/**
 * GitHub API Service
 *
 * Business logic layer for GitHub API calls
 * Used by features to fetch repositories, users, issues
 *
 * Architecture:
 * This sits between features and the apiClient.
 * Features never call apiClient directly.
 *
 * WHY:
 * - Centralized API logic
 * - Easy to mock for testing
 * - Easy to change API endpoints
 * - Data transformation in one place
 */

import { AxiosError } from 'axios';

import apiClient, { getRateLimitInfo } from './apiClient';
import type { GitHubRepository, GitHubUser, GitHubIssue, SearchResponse } from '../types/api';
import { AppError, ErrorCode } from '../types/error';

// ============================================================================
// REPOSITORY API CALLS
// ============================================================================

/**
 * Search repositories on GitHub
 *
 * @param query - Search query (e.g., "react language:javascript")
 * @param page - Page number for pagination (1-indexed)
 * @param perPage - Results per page (1-100, default 30)
 * @returns Search results with repositories
 *
 * GITHUB API:
 * GET /search/repositories?q=react+language:javascript&page=1&per_page=30
 */
export const searchRepositories = async (
  query: string,
  page: number = 1,
  perPage: number = 30,
  signal?: AbortSignal
): Promise<SearchResponse<GitHubRepository>> => {
  try {
    const response = await apiClient.get<SearchResponse<GitHubRepository>>('/search/repositories', {
      params: {
        q: query,
        page,
        per_page: perPage,
        sort: 'stars',
        order: 'desc',
      },
      signal,
    });

    // Extract rate limit info from headers
    const rateLimitInfo = getRateLimitInfo(response);
    if (__DEV__) {
      console.log(`[GitHub] Rate limit: ${rateLimitInfo.remaining}/${rateLimitInfo.limit}`);
    }

    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to search repositories');
  }
};

/**
 * Get trending repositories (sorted by recently updated)
 *
 * Alternative to search that shows recently active repos
 */
export const getTrendingRepositories = async (
  language?: string,
  page: number = 1,
  perPage: number = 30,
  signal?: AbortSignal
): Promise<SearchResponse<GitHubRepository>> => {
  try {
    let query = 'stars:>100 sort:updated';

    if (language) {
      query += ` language:${language}`;
    }

    const response = await apiClient.get<SearchResponse<GitHubRepository>>('/search/repositories', {
      params: {
        q: query,
        page,
        per_page: perPage,
        sort: 'updated',
        order: 'desc',
      },
      signal,
    });

    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch trending repositories');
  }
};

/**
 * Get single repository by owner and name
 */
export const getRepository = async (
  owner: string,
  repo: string,
  signal?: AbortSignal
): Promise<GitHubRepository> => {
  try {
    const response = await apiClient.get<GitHubRepository>(`/repos/${owner}/${repo}`, { signal });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch repository');
  }
};

/**
 * Get repository README (raw content)
 *
 * Returns the README.md file content as text
 */
export const getRepositoryReadme = async (
  owner: string,
  repo: string,
  signal?: AbortSignal
): Promise<string> => {
  try {
    const response = await apiClient.get(`/repos/${owner}/${repo}/readme`, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
      },
      signal,
    });
    return response.data;
  } catch (error) {
    // README might not exist, return empty string
    if (error instanceof AxiosError && error.response?.status === 404) {
      return '';
    }
    throw handleAPIError(error, 'Failed to fetch README');
  }
};

// ============================================================================
// USER/DEVELOPER API CALLS
// ============================================================================

/**
 * Search users on GitHub
 */
export const searchUsers = async (
  query: string,
  page: number = 1,
  perPage: number = 30
): Promise<SearchResponse<GitHubUser>> => {
  try {
    const response = await apiClient.get<SearchResponse<GitHubUser>>('/search/users', {
      params: {
        q: query,
        page,
        per_page: perPage,
        sort: 'followers',
        order: 'desc',
      },
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to search users');
  }
};

/**
 * Get user profile by login
 */
export const getUser = async (login: string): Promise<GitHubUser> => {
  try {
    const response = await apiClient.get<GitHubUser>(`/users/${login}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch user profile');
  }
};

/**
 * Get repositories for a specific user
 */
export const getUserRepositories = async (
  login: string,
  page: number = 1,
  perPage: number = 30
): Promise<GitHubRepository[]> => {
  try {
    const response = await apiClient.get<GitHubRepository[]>(`/users/${login}/repos`, {
      params: {
        page,
        per_page: perPage,
        sort: 'updated',
        direction: 'desc',
        type: 'all',
      },
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch user repositories');
  }
};

/**
 * Get followers of a user
 */
export const getUserFollowers = async (
  login: string,
  page: number = 1,
  perPage: number = 30
): Promise<GitHubUser[]> => {
  try {
    const response = await apiClient.get<GitHubUser[]>(`/users/${login}/followers`, {
      params: {
        page,
        per_page: perPage,
      },
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch followers');
  }
};

// ============================================================================
// ISSUES API CALLS
// ============================================================================

/**
 * Get issues for a repository
 */
export const getRepositoryIssues = async (
  owner: string,
  repo: string,
  page: number = 1,
  perPage: number = 30,
  state: 'open' | 'closed' | 'all' = 'open'
): Promise<GitHubIssue[]> => {
  try {
    const response = await apiClient.get<GitHubIssue[]>(`/repos/${owner}/${repo}/issues`, {
      params: {
        page,
        per_page: perPage,
        state,
        sort: 'updated',
        direction: 'desc',
      },
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch issues');
  }
};

/**
 * Get single issue details
 */
export const getIssue = async (
  owner: string,
  repo: string,
  issueNumber: number
): Promise<GitHubIssue> => {
  try {
    const response = await apiClient.get<GitHubIssue>(
      `/repos/${owner}/${repo}/issues/${issueNumber}`
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch issue');
  }
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Centralized error handling for GitHub API
 *
 * Maps axios errors to AppError with context
 */
const handleAPIError = (error: unknown, context: string): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const appError = new AppError(
      error.response?.data?.message || error.message || context,
      ErrorCode.UNKNOWN_ERROR,
      {
        statusCode: error.response?.status,
        originalError: error,
      }
    );

    return appError;
  }

  return new AppError(context, ErrorCode.UNKNOWN_ERROR, {
    originalError: error,
  });
};

// ============================================================================
// API SERVICE EXPORT
// ============================================================================

export const githubAPI = {
  // Repositories
  searchRepositories,
  getTrendingRepositories,
  getRepository,
  getRepositoryReadme,

  // Users
  searchUsers,
  getUser,
  getUserRepositories,
  getUserFollowers,

  // Issues
  getRepositoryIssues,
  getIssue,
};

export default githubAPI;
