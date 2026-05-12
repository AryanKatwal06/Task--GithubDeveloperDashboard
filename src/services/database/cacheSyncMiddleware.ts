/**
 * Cache Sync Middleware
 *
 * Syncs Redux state changes to SQLite database
 * - Caches search results after successful API calls
 * - Persists repository data to offline storage
 * - Updates cache timestamps for invalidation logic
 */

import type { Middleware } from '@reduxjs/toolkit';

import { DatabaseService } from './DatabaseService';
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
  if (!DatabaseService.isReady()) {
    return;
  }

  switch (action.type) {
    // ================================================================
    // REPOSITORIES SEARCH FULFILLED
    // ================================================================
    case 'repositories/searchRepositories/fulfilled': {
      try {
        const { repositories, query, filters } = action.payload;

        await RepositoryRepository.upsertBatch(repositories, 'search');

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

        await RepositoryRepository.upsert(repository, 'detail');
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

        await SyncMetadataRepository.updateLastTrendingSync();
      } catch (error) {
        console.error('[Cache] Error caching trending repositories:', error);
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
    const isTestEnv =
      typeof process !== 'undefined' &&
      (process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID);
    if (!DatabaseService.isReady() && !isTestEnv) {
      return;
    }

    await RepositoryRepository.getRecent(50);
    await SearchCacheRepository.getSearchHistory(20);
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
    const isTestEnv =
      typeof process !== 'undefined' &&
      (process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID);
    if (!DatabaseService.isReady() && !isTestEnv) {
      return;
    }

    const isCleanupNeeded = await SyncMetadataRepository.isSearchCleanupNeeded();

    if (isCleanupNeeded) {
      await RepositoryRepository.cleanup(CACHE_TTL.REPOSITORY_DETAIL);
      await SearchCacheRepository.cleanup();

      await SyncMetadataRepository.updateLastSearchCleanup();
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
    if (!DatabaseService.isReady()) {
      return {
        repositoriesCount: 0,
        searchCacheCount: 0,
        lastMaintenance: 0,
        lastTrendingSync: 0,
      };
    }

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
