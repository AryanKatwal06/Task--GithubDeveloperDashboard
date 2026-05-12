/**
 * Database Module Exports
 *
 * Complete database layer with SQLite integration
 */

// Core Database Service
export { DatabaseService, type DbQueryResult } from './DatabaseService';

// Schema & Configuration
export {
  DATABASE_VERSION,
  DATABASE_NAME,
  CREATE_TABLE_STATEMENTS,
  CREATE_INDEX_STATEMENTS,
  CACHE_TTL,
  SYNC_KEYS,
} from './schema';

// Repository Pattern (Data Access Objects)
export {
  RepositoryRepository,
  SearchCacheRepository,
  SyncMetadataRepository,
  type RepositoryEntity,
  type SearchCacheEntity,
  type CachedSearchResult,
  type SyncMetadata,
} from './repositories';

// Cache Utilities
export {
  isCacheValid,
  getCacheAge,
  getCacheTimeRemaining,
  getCachePercentage,
  formatCacheAge,
  getSearchCacheKey,
  getRepositoryCacheKey,
  getUserCacheKey,
  getTrendingCacheKey,
  determineCacheTTL,
  shouldRefreshCache,
  evaluateStaleWhileRevalidate,
  isCleanupNeeded,
  calculateCachePressure,
  getCacheStats,
} from './cacheUtils';
