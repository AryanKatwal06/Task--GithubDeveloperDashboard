/**
 * Repositories Slice - Async Thunks
 *
 * Thunks handle API calls and dispatch actions
 * All API data flows through these thunks
 */

import { createAsyncThunk } from '@reduxjs/toolkit';

import { githubAPI } from '../../../services/githubAPI';
import { networkStateManager } from '../../../services/networkStateManager';
import { RepositoryRepository, SearchCacheRepository } from '../../../services/database';
import type { GitHubRepository, SearchResponse } from '../../../types/api';
import { AppError, ErrorCode } from '../../../types/error';
import type { RootState } from '../../';

// ============================================================================
// THUNK TYPES
// ============================================================================

/**
 * Search repositories payload
 */
export interface SearchRepositoriesPayload {
  query: string;
  page?: number;
  perPage?: number;
  language?: string;
  forceRefresh?: boolean;
}

/**
 * Search response with normalized data
 */
export interface SearchRepositoriesResponse {
  repositories: GitHubRepository[];
  totalCount: number;
  query: string;
  filters: {
    language?: string;
  };
  page: number;
  perPage: number;
  fromCache?: boolean;
}

const parseCachedRepository = (
  rawRepository: Awaited<ReturnType<typeof RepositoryRepository.getById>>
): GitHubRepository | null => {
  if (!rawRepository?.github_data) {
    return null;
  }

  try {
    return JSON.parse(rawRepository.github_data) as GitHubRepository;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Repositories] Failed to parse cached repository payload', error);
    }
    return null;
  }
};

const getRepositoriesByIdsFromCache = async (
  repositoryIds: number[]
): Promise<GitHubRepository[]> => {
  const cachedRows = await Promise.all(repositoryIds.map((id) => RepositoryRepository.getById(id)));

  const parsedRepositories = cachedRows
    .map((cachedRow) => parseCachedRepository(cachedRow))
    .filter(Boolean) as GitHubRepository[];

  const parsedById = new Map(parsedRepositories.map((repo) => [repo.id, repo]));
  return repositoryIds.map((id) => parsedById.get(id)).filter(Boolean) as GitHubRepository[];
};

const getCachedSearchResponse = async (
  query: string,
  language: string | undefined,
  page: number,
  fallbackPerPage: number
): Promise<SearchRepositoriesResponse | null> => {
  const cachedSearch = await SearchCacheRepository.getCachedSearch(query, language, page);

  if (!cachedSearch || cachedSearch.isExpired || cachedSearch.repositoryIds.length === 0) {
    return null;
  }

  const repositories = await getRepositoriesByIdsFromCache(cachedSearch.repositoryIds);
  if (repositories.length === 0) {
    return null;
  }

  return {
    repositories,
    totalCount: cachedSearch.cache.total_count || repositories.length,
    query,
    filters: {
      language,
    },
    page: cachedSearch.cache.page || page,
    perPage: cachedSearch.cache.per_page || fallbackPerPage,
    fromCache: true,
  };
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Search Repositories Thunk
 *
 * WHY separate thunk:
 * - API call is async
 * - Multiple reducers need to run (setLoading, setRepositories, setError)
 * - Need to normalize API response
 * - Handles errors properly
 *
 * @param payload - Search query and pagination params
 * @param thunkAPI - Redux thunk API (dispatch, getState, rejectWithValue)
 * @returns Normalized repositories and search metadata
 */
export const searchRepositories = createAsyncThunk<
  SearchRepositoriesResponse,
  SearchRepositoriesPayload,
  {
    state: RootState;
    rejectValue: AppError;
  }
>('repositories/searchRepositories', async (payload, { rejectWithValue, signal }) => {
  try {
    const { query, language, page = 1, perPage = 30, forceRefresh = false } = payload;

    if (!forceRefresh) {
      const cachedResponse = await getCachedSearchResponse(query, language, page, perPage);

      if (cachedResponse) {
        return cachedResponse;
      }
    }

    if (!networkStateManager.isOnline()) {
      return rejectWithValue(
        new AppError(
          'No internet connection and no cached search results available.',
          ErrorCode.NO_INTERNET,
          { retryable: true }
        )
      );
    }

    const effectiveQuery = language ? `${query} language:${language}` : query;

    // Call API
    const response: SearchResponse<GitHubRepository> = await githubAPI.searchRepositories(
      effectiveQuery,
      page,
      perPage,
      signal
    );

    // Return normalized data
    return {
      repositories: response.items,
      totalCount: response.total_count,
      query,
      filters: {
        language,
      },
      page,
      perPage,
      fromCache: false,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return rejectWithValue(error);
    }
    throw error;
  }
});

/**
 * Get Repository Details Thunk
 *
 * Fetches full repository details including README
 */
export const getRepositoryDetails = createAsyncThunk<
  {
    repository: GitHubRepository;
    readme: string;
    fromCache?: boolean;
  },
  { owner: string; repo: string; forceRefresh?: boolean },
  {
    state: RootState;
    rejectValue: AppError;
  }
>(
  'repositories/getRepositoryDetails',
  async ({ owner, repo, forceRefresh = false }, { rejectWithValue, signal }) => {
    try {
      const fullName = `${owner}/${repo}`;

      if (!forceRefresh) {
        const cachedRepository = await RepositoryRepository.getByFullName(fullName);
        const parsedRepository = parseCachedRepository(cachedRepository);

        if (parsedRepository) {
          return {
            repository: parsedRepository,
            readme: 'README preview unavailable in offline cache mode.',
            fromCache: true,
          };
        }
      }

      if (!networkStateManager.isOnline()) {
        return rejectWithValue(
          new AppError(
            'No internet connection and no cached repository details available.',
            ErrorCode.NO_INTERNET,
            { retryable: true }
          )
        );
      }

      const [repository, readme] = await Promise.all([
        githubAPI.getRepository(owner, repo, signal),
        githubAPI.getRepositoryReadme(owner, repo, signal),
      ]);

      return { repository, readme, fromCache: false };
    } catch (error) {
      if (error instanceof AppError) {
        return rejectWithValue(error);
      }
      throw error;
    }
  }
);

/**
 * Get Trending Repositories Thunk
 *
 * Shows recently active popular repositories
 */
export const getTrendingRepositories = createAsyncThunk<
  SearchRepositoriesResponse,
  { language?: string; page?: number; perPage?: number; forceRefresh?: boolean },
  {
    state: RootState;
    rejectValue: AppError;
  }
>('repositories/getTrendingRepositories', async (payload, { rejectWithValue, signal }) => {
  try {
    const { language, page = 1, perPage = 30, forceRefresh = false } = payload;
    const trendingQuery = language ? `trending:${language}` : 'trending';

    if (!forceRefresh) {
      const cachedResponse = await getCachedSearchResponse(trendingQuery, language, page, perPage);

      if (cachedResponse) {
        return cachedResponse;
      }
    }

    if (!networkStateManager.isOnline()) {
      return rejectWithValue(
        new AppError(
          'No internet connection and no cached trending repositories available.',
          ErrorCode.NO_INTERNET,
          { retryable: true }
        )
      );
    }

    const response: SearchResponse<GitHubRepository> = await githubAPI.getTrendingRepositories(
      language,
      page,
      perPage,
      signal
    );

    return {
      repositories: response.items,
      totalCount: response.total_count,
      query: trendingQuery,
      filters: {
        language,
      },
      page,
      perPage,
      fromCache: false,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return rejectWithValue(error);
    }
    throw error;
  }
});
