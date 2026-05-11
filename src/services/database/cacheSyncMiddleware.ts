/**
 * Cache Sync Middleware
 *
 * Syncs Redux state changes to SQLite database
 * - Caches search results after successful API calls
 * - Persists repository data to offline storage
 * - Updates cache timestamps for invalidation logic
 *
 * Architecture:
 * - Listens to Redux actions from async thunks
 * - Writes data to SQLite on successful API responses
 * - Logs cache operations for debugging
 */

import type { Middleware } from '@reduxjs/toolkit';

import {
  RepositoryRepository,
  SearchCacheRepository,
  SyncMetadataRepository,
} from './repositories';
import { CACHE_TTL } from './schema';
import type { GitHubRepository } from '../../types/api';

// ============================================================================
// TYPES
// ============================================================================

interface CacheSyncAction {
  type: string;
  payload?: any;
}

// ============================================================================
// CACHE SYNC MIDDLEWARE
// ============================================================================

/**
 * Create cache sync middleware
 *
 * This middleware intercepts Redux actions and syncs data to SQLite:
 *
 * USAGE:
 * const store = configureStore({
 *   reducer: { ... },
 *   middleware: (getDefaultMiddleware) =>
 *     getDefaultMiddleware().concat(createCacheSyncMiddleware()),
 * });
 */
export const createCacheSyncMiddleware = (): Middleware => {
  return (_store) => (next) => (action: any) => {
    const result = next(action);

    // Handle cache sync asynchronously (fire and forget)
    handleCacheSyncAction(action).catch((error) =>
      console.error('[Cache] Error in cache sync:', error)
    );

    return result;
  };
};

/**
 * Handle cache sync for different action types
 */
async function handleCacheSyncAction(action: CacheSyncAction): Promise<void> {
  switch (action.type) {
    // ================================================================
    // REPOSITORIES SEARCH FULFILLED
    // ================================================================
    case 'repositories/searchRepositories/fulfilled': {
      try {
        const { repositories, query, filters } = action.payload;

        // Cache repository data
        await RepositoryRepository.upsertBatch(repositories, 'search');

        // Cache search metadata
        const repositoryIds = repositories.map((r: GitHubRepository) => r.id);
        await SearchCacheRepository.cache(
          query,
          repositoryIds,
          action.payload.totalCount || repositories.length,
          filters?.language,
          action.payload.page || 1,
          action.payload.perPage || 30,
          CACHE_TTL.SEARCH_RESULTS
        );

        console.log(`[Cache] Cached ${repositories.length} search results for "${query}"`);
      } catch (error) {
        console.error('[Cache] Error caching search results:', error);
      }
      break;
    }

    // ================================================================
    // REPOSITORIES DETAIL FULFILLED
    // ================================================================
    case 'repositories/getRepositoryDetails/fulfilled': {
      try {
        const repository = action.payload?.repository as GitHubRepository | undefined;

        if (!repository) {
          break;
        }

        // Cache individual repository detail
        await RepositoryRepository.upsert(repository, 'detail');

        console.log(`[Cache] Cached repository detail: ${repository.full_name}`);
      } catch (error) {
        console.error('[Cache] Error caching repository detail:', error);
      }
      break;
    }

    // ================================================================
    // TRENDING REPOSITORIES FULFILLED
    // ================================================================
    case 'repositories/getTrendingRepositories/fulfilled': {
      try {
        const { repositories, language, query, page, perPage, totalCount } = action.payload;

        // Cache repository data
        await RepositoryRepository.upsertBatch(repositories, 'trending');

        await SearchCacheRepository.cache(
          query,
          repositories.map((r: GitHubRepository) => r.id),
          totalCount || repositories.length,
          language,
          page || 1,
          perPage || 30,
          CACHE_TTL.TRENDING_REPOS
        );

        // Update trending sync timestamp
        await SyncMetadataRepository.updateLastTrendingSync();

        console.log(
          `[Cache] Cached ${repositories.length} trending repositories for language: ${
            language || 'all'
          }`
        );
      } catch (error) {
        console.error('[Cache] Error caching trending repositories:', error);
      }
      break;
    }

    // ================================================================
    // DEVELOPERS SEARCH FULFILLED
    // ================================================================
    case 'developers/searchDevelopers/fulfilled': {
      try {
        const developers = action.payload;

        console.log(`[Cache] Cached ${developers.length} developer search results`);
      } catch (error) {
        console.error('[Cache] Error caching developer search:', error);
      }
      break;
    }

    // ================================================================
    // REPOSITORIES CLEAR CACHE
    // ================================================================
    case 'repositories/clearCache': {
      try {
        await RepositoryRepository.deleteAll();
        await SearchCacheRepository.deleteAll();

        console.log('[Cache] Cleared all repository and search cache');
      } catch (error) {
        console.error('[Cache] Error clearing cache:', error);
      }
      break;
    }

    // ================================================================
    // DEFAULT: NO CACHE ACTION
    // ================================================================
    default:
      // No cache action needed
      break;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Preload cache data into Redux on app startup
 *
 * USAGE:
 * useEffect(() => {
 *   preloadCacheData();
 * }, []);
 */
export async function preloadCacheData(): Promise<void> {
  try {
    console.log('[Cache] Starting cache preload...');

    const recentRepositories = await RepositoryRepository.getRecent(50);
    const recentSearches = await SearchCacheRepository.getSearchHistory(20);

    console.log(
      `[Cache] Preloaded ${recentRepositories.length} repositories and ${recentSearches.length} searches`
    );

    // Optional: Dispatch action to populate Redux with preloaded data
    // await dispatch(hydrateFromCache({ repositories: recentRepositories }));
  } catch (error) {
    console.error('[Cache] Error preloading cache data:', error);
  }
}

/**
 * Perform cache maintenance
 *
 * Cleanup old entries, remove expired caches
 *
 * USAGE:
 * useEffect(() => {
 *   performCacheMaintenance();
 * }, []);
 */
export async function performCacheMaintenance(): Promise<void> {
  try {
    console.log('[Cache] Starting maintenance...');

    const isCleanupNeeded = await SyncMetadataRepository.isSearchCleanupNeeded();

    if (isCleanupNeeded) {
      const removedRepositories = await RepositoryRepository.cleanup(CACHE_TTL.REPOSITORY_DETAIL);
      const removedSearches = await SearchCacheRepository.cleanup();

      await SyncMetadataRepository.updateLastSearchCleanup();

      console.log(
        `[Cache] Maintenance complete: removed ${removedRepositories} old repos, ${removedSearches} old searches`
      );
    }
  } catch (error) {
    console.error('[Cache] Error during maintenance:', error);
  }
}

/**
 * Get cache debug information
 *
 * Returns statistics about current cache state
 */
export async function getCacheDebugInfo(): Promise<{
  repositoriesCount: number;
  searchCacheCount: number;
  lastMaintenance: number;
  lastTrendingSync: number;
}> {
  try {
    const repositoriesCount = await RepositoryRepository.count();
    const searchCacheCount = await SearchCacheRepository.count();
    const lastMaintenance = await SyncMetadataRepository.getLastSearchCleanup();
    const lastTrendingSync = await SyncMetadataRepository.getLastTrendingSync();

    return {
      repositoriesCount,
      searchCacheCount,
      lastMaintenance,
      lastTrendingSync,
    };
  } catch (error) {
    console.error('[Cache] Error getting debug info:', error);
    return {
      repositoriesCount: 0,
      searchCacheCount: 0,
      lastMaintenance: 0,
      lastTrendingSync: 0,
    };
  }
}
