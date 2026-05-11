/**
 * API Client Configuration
 *
 * Sets up Axios instance with:
 * - Request/response interceptors
 * - Error handling
 * - Retry logic
 *
 * Architecture Decision:
 * We create ONE axios instance that all features use.
 * This ensures consistent configuration across the app.
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import Config from 'react-native-config';

import { AppError, ErrorCode, httpStatusToErrorCode } from '../types/error';

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Exponential Backoff Retry
 *
 * WHY:
 * Transient failures (network blips, rate limits) often resolve quickly.
 * Exponential backoff prevents overwhelming the server.
 *
 * STRATEGY:
 * - 1st attempt: immediate
 * - 2nd attempt: wait 1 second
 * - 3rd attempt: wait 2 seconds
 * - 4th attempt: wait 4 seconds
 * - Max: 3 retries (configurable)
 *
 * DON'T RETRY:
 * - 4xx errors (our fault, not server's)
 * - 401/403 (auth issues)
 * - 404 (not found)
 */

const MAX_RETRIES = 3;

const shouldRetry = (error: AxiosError): boolean => {
  // Only retry on network errors or 5xx
  if (!error.response) {
    return true; // Network error
  }

  const status = error.response.status;
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(status);
};

const getRetryDelay = (attemptNumber: number): number => {
  // Exponential backoff: 1000ms, 2000ms, 4000ms
  return Math.pow(2, attemptNumber - 1) * 1000;
};

// ============================================================================
// AXIOS INSTANCE CREATION
// ============================================================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_URL || 'https://api.github.com',
  timeout: parseInt(Config.API_TIMEOUT || '30000', 10),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.v3+json',
  },
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

/**
 * Request Interceptor
 *
 * Responsibilities:
 * 1. Add request metadata for logging
 * 2. Keep response errors consistent
 */

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add request ID for tracking
    (config as any).__requestId = `${Date.now()}-${Math.random()}`;

    // Add timestamp for timing metrics
    (config as any).__startTime = Date.now();

    if (__DEV__) {
      console.log(`[API] ${method} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(
      new AppError('Request configuration error', ErrorCode.UNKNOWN_ERROR, {
        originalError: error,
      })
    );
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

/**
 * Response Interceptor
 *
 * Responsibilities:
 * 1. Map HTTP errors to AppError
 * 2. Remove from pending requests
 * 3. Log metrics (request time, etc)
 * 4. Handle rate limiting
 */

apiClient.interceptors.response.use(
  (response) => {
    const startTime = (response.config as any)?.__startTime;
    const duration = startTime ? Date.now() - startTime : 0;

    if (__DEV__) {
      console.log(`[API] Response ${response.status} (${duration}ms)`);
    }

    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & {
      __retryCount?: number;
      __requestId?: string;
    };

    // Check if we should retry
    if (shouldRetry(error) && (!config.__retryCount || config.__retryCount < MAX_RETRIES)) {
      config.__retryCount = (config.__retryCount || 0) + 1;

      const delay = getRetryDelay(config.__retryCount);

      if (__DEV__) {
        console.log(`[API] Retry attempt ${config.__retryCount}/${MAX_RETRIES} after ${delay}ms`);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return apiClient.request(config);
    }

    // Map error to AppError
    let appError: AppError;

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const code = httpStatusToErrorCode(status);

      appError = new AppError(
        (error.response.data as any)?.message || error.message || 'API Error',
        code,
        {
          statusCode: status,
          originalError: error,
          retryable: shouldRetry(error),
        }
      );
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      appError = new AppError('Request timeout', ErrorCode.TIMEOUT, {
        originalError: error,
        retryable: true,
      });
    } else if (error.message === 'Network Error') {
      // Network error (offline)
      appError = new AppError('Network error', ErrorCode.NETWORK_ERROR, {
        originalError: error,
        retryable: true,
      });
    } else {
      // Unknown error
      appError = new AppError(error.message || 'Unknown error', ErrorCode.UNKNOWN_ERROR, {
        originalError: error,
      });
    }

    if (__DEV__) {
      console.error(`[API] Error: ${appError.code} - ${appError.message}`);
    }

    return Promise.reject(appError);
  }
);

// ============================================================================
// UTILITIES
// ============================================================================

/**
/**
 * Get API rate limit info from response headers
 *
 * GitHub returns rate limit info in headers:
 * - x-ratelimit-limit: 60 (public API)
 * - x-ratelimit-remaining: 59
 * - x-ratelimit-reset: 1234567890
 */
export const getRateLimitInfo = (response: any) => {
  return {
    limit: parseInt(response.headers['x-ratelimit-limit'] || '60', 10),
    remaining: parseInt(response.headers['x-ratelimit-remaining'] || '60', 10),
    reset: parseInt(response.headers['x-ratelimit-reset'] || '0', 10),
  };
};

export default apiClient;
