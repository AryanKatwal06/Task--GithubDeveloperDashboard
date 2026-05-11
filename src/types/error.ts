/**
 * Error Types & Handling
 *
 * Centralized error definitions for the entire application
 * Enables consistent error handling across all layers
 */

// ============================================================================
// ERROR CODES
// ============================================================================

export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  NO_INTERNET = 'NO_INTERNET',
  REQUEST_CANCELLED = 'REQUEST_CANCELLED',

  // API errors (from GitHub)
  UNAUTHORIZED = 'UNAUTHORIZED', // 401
  FORBIDDEN = 'FORBIDDEN', // 403
  NOT_FOUND = 'NOT_FOUND', // 404
  RATE_LIMITED = 'RATE_LIMITED', // 429
  SERVER_ERROR = 'SERVER_ERROR', // 5xx
  BAD_REQUEST = 'BAD_REQUEST', // 400
  CONFLICT = 'CONFLICT', // 409

  // Application errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// ============================================================================
// ERROR CLASS
// ============================================================================

/**
 * AppError
 * Standard error class for the entire application
 *
 * WHY:
 * - Distinguishes app errors from regular Errors
 * - Carries context about where error occurred
 * - Enables better error recovery strategies
 */
export class AppError extends Error {
  code: ErrorCode;
  statusCode?: number;
  originalError?: unknown;
  retryable: boolean;
  timestamp: number;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    options: {
      statusCode?: number;
      originalError?: unknown;
      retryable?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = options.statusCode;
    this.originalError = options.originalError;
    this.retryable = options.retryable ?? false;
    this.timestamp = Date.now();

    // Maintain prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ============================================================================
// ERROR MAPPING
// ============================================================================

/**
 * HTTP Status Code to Error Code Mapping
 * Converts HTTP errors to application error codes
 */
export const httpStatusToErrorCode = (status: number): ErrorCode => {
  switch (status) {
    case 400:
      return ErrorCode.BAD_REQUEST;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 409:
      return ErrorCode.CONFLICT;
    case 429:
      return ErrorCode.RATE_LIMITED;
    case 408:
    case 504:
      return ErrorCode.TIMEOUT;
    case 500:
    case 502:
    case 503:
      return ErrorCode.SERVER_ERROR;
    default:
      return ErrorCode.UNKNOWN_ERROR;
  }
};

/**
 * Is error retryable?
 *
 * Some errors indicate transient failures and should be retried.
 * Others indicate permanent failures (auth, not found, etc).
 */
export const isRetryableError = (error: AppError): boolean => {
  const retryableCodes = [
    ErrorCode.TIMEOUT,
    ErrorCode.RATE_LIMITED,
    ErrorCode.SERVER_ERROR,
    ErrorCode.NETWORK_ERROR,
  ];

  return retryableCodes.includes(error.code);
};

/**
 * Get user-friendly error message
 *
 * IMPORTANT: Never expose internal errors to users.
 * Map all errors to user-readable messages.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    switch (error.code) {
      case ErrorCode.NO_INTERNET:
        return 'No internet connection. Check your network.';
      case ErrorCode.TIMEOUT:
        return 'Request timed out. Please try again.';
      case ErrorCode.UNAUTHORIZED:
        return 'Authentication failed. Please log in again.';
      case ErrorCode.FORBIDDEN:
        return 'You do not have permission to access this resource.';
      case ErrorCode.NOT_FOUND:
        return 'Resource not found.';
      case ErrorCode.RATE_LIMITED:
        return 'Too many requests. Please wait a moment and try again.';
      case ErrorCode.SERVER_ERROR:
        return 'Server error. Please try again later.';
      case ErrorCode.NETWORK_ERROR:
        return 'Network error. Please check your connection.';
      case ErrorCode.REQUEST_CANCELLED:
        return 'Request was cancelled.';
      case ErrorCode.PARSE_ERROR:
        return 'Failed to parse response. Please try again.';
      case ErrorCode.VALIDATION_ERROR:
        return 'Invalid input. Please check your data.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};

// ============================================================================
// ERROR PREDICATES
// ============================================================================

/**
 * Type guard to check if error is AppError
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

/**
 * Type guard for rate limit errors
 */
export const isRateLimitError = (error: unknown): error is AppError => {
  return isAppError(error) && error.code === ErrorCode.RATE_LIMITED;
};

/**
 * Type guard for network errors
 */
export const isNetworkError = (error: unknown): error is AppError => {
  return (
    isAppError(error) &&
    [ErrorCode.NETWORK_ERROR, ErrorCode.NO_INTERNET, ErrorCode.TIMEOUT].includes(error.code)
  );
};
