/**
 * Database Schema Definitions
 *
 * Defines SQLite table structures for:
 * - repositories: Cached GitHub repository data
 * - search_cache: Search query results and metadata
 * - sync_metadata: Cache timestamps and sync status
 */

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

export const DATABASE_VERSION = 1;
export const DATABASE_NAME = 'github_dashboard.db';

/**
 * CREATE TABLE statements
 * Order matters: foreign key dependencies must be created after their targets
 */
export const CREATE_TABLE_STATEMENTS = [
  /**
   * Main repositories table
   * Stores cached repository data from GitHub API
   */
  `
  CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    owner TEXT NOT NULL,
    full_name TEXT UNIQUE NOT NULL,
    description TEXT,
    url TEXT,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    language TEXT,
    is_fork INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT,
    github_data TEXT NOT NULL,
    cached_at INTEGER NOT NULL,
    source TEXT DEFAULT 'api',
    UNIQUE(owner, name)
  );
  `,

  /**
   * Search cache table
   * Stores search queries and their result counts for reference
   * Note: Actual result IDs are stored in search_results table
   */
  `
  CREATE TABLE IF NOT EXISTS search_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    language_filter TEXT,
    page INTEGER DEFAULT 1,
    per_page INTEGER DEFAULT 30,
    result_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    repository_ids TEXT,
    cached_at INTEGER NOT NULL,
    ttl_ms INTEGER DEFAULT 43200000,
    UNIQUE(query, language_filter, page)
  );
  `,

  /**
   * Search results table (normalized)
   * Join table between searches and repositories for many-to-many relationship
   */
  `
  CREATE TABLE IF NOT EXISTS search_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    search_cache_id INTEGER NOT NULL,
    repository_id INTEGER NOT NULL,
    result_order INTEGER NOT NULL,
    UNIQUE(search_cache_id, repository_id),
    FOREIGN KEY (search_cache_id) REFERENCES search_cache(id) ON DELETE CASCADE,
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
  );
  `,

  /**
   * Sync metadata table
   * Tracks cache invalidation times and other sync metadata
   */
  `
  CREATE TABLE IF NOT EXISTS sync_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
  `,
];

/**
 * CREATE INDEX statements for performance
 */
export const CREATE_INDEX_STATEMENTS = [
  'CREATE INDEX IF NOT EXISTS idx_repositories_owner ON repositories(owner);',
  'CREATE INDEX IF NOT EXISTS idx_repositories_language ON repositories(language);',
  'CREATE INDEX IF NOT EXISTS idx_repositories_stars ON repositories(stars DESC);',
  'CREATE INDEX IF NOT EXISTS idx_repositories_cached_at ON repositories(cached_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_search_cache_query ON search_cache(query);',
  'CREATE INDEX IF NOT EXISTS idx_search_cache_cached_at ON search_cache(cached_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_search_results_cache_id ON search_results(search_cache_id);',
  'CREATE INDEX IF NOT EXISTS idx_search_results_repo_id ON search_results(repository_id);',
  'CREATE INDEX IF NOT EXISTS idx_sync_metadata_key ON sync_metadata(key);',
];

/**
 * Cache invalidation times (in milliseconds)
 */
export const CACHE_TTL = {
  REPOSITORY_DETAIL: 24 * 60 * 60 * 1000, // 24 hours - detailed repo info doesn't change often
  SEARCH_RESULTS: 12 * 60 * 60 * 1000, // 12 hours - search results cache
  TRENDING_REPOS: 6 * 60 * 60 * 1000, // 6 hours - trending changes more frequently
  USER_PROFILE: 7 * 24 * 60 * 60 * 1000, // 7 days - user profiles are stable
  USER_REPOS: 12 * 60 * 60 * 1000, // 12 hours
  FOLLOWERS: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Sync metadata keys
 */
export const SYNC_KEYS = {
  LAST_TRENDING_SYNC: 'last_trending_sync',
  LAST_SEARCH_CLEANUP: 'last_search_cleanup',
  DB_VERSION: 'db_version',
  LAST_FULL_SYNC: 'last_full_sync',
} as const;
