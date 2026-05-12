/**
 * Search Cache Repository
 *
 * Data access object for search_cache table
 * Handles caching of search queries and their results
 */

import { DatabaseService } from '../DatabaseService';
import { CACHE_TTL } from '../schema';

// ============================================================================
// TYPES
// ============================================================================

export interface SearchCacheEntity {
  id: number;
  query: string;
  language_filter: string | null;
  page: number;
  per_page: number;
  result_count: number;
  total_count: number;
  repository_ids: string | null;
  cached_at: number;
  ttl_ms: number;
}

export interface CachedSearchResult {
  cache: SearchCacheEntity;
  repositoryIds: number[];
  isExpired: boolean;
}

// ============================================================================
// SEARCH CACHE REPOSITORY
// ============================================================================

class SearchCacheRepositoryImpl {
  private static instance: SearchCacheRepositoryImpl;

  static getInstance(): SearchCacheRepositoryImpl {
    if (!SearchCacheRepositoryImpl.instance) {
      SearchCacheRepositoryImpl.instance = new SearchCacheRepositoryImpl();
    }
    return SearchCacheRepositoryImpl.instance;
  }

  /**
   * Cache a search query and its results
   */
  async cache(
    query: string,
    repositoryIds: number[],
    totalCount: number,
    languageFilter?: string | null,
    page: number = 1,
    perPage: number = 30,
    ttlMs: number = CACHE_TTL.SEARCH_RESULTS
  ): Promise<number> {
    const now = Date.now();
    const idsString = repositoryIds.join(',');

    const result = await DatabaseService.query(
      `
      INSERT OR REPLACE INTO search_cache (
        query, language_filter, page, per_page, result_count, total_count,
        repository_ids, cached_at, ttl_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        query,
        languageFilter || '',
        page.toString(),
        perPage.toString(),
        repositoryIds.length.toString(),
        totalCount.toString(),
        idsString,
        now.toString(),
        ttlMs.toString(),
      ]
    );

    return result.insertId || 0;
  }

  /**
   * Get cached search result by query
   * Returns null if cache doesn't exist or is expired
   */
  async getCachedSearch(
    query: string,
    languageFilter?: string | null,
    page: number = 1
  ): Promise<CachedSearchResult | null> {
    const result = await DatabaseService.query(
      `
      SELECT * FROM search_cache
      WHERE query = ? AND language_filter = ? AND page = ?
      `,
      [query, languageFilter || '', page.toString()]
    );

    if (!result.rows[0]) {
      return null;
    }

    const cache = result.rows[0] as SearchCacheEntity;
    const now = Date.now();
    const isExpired = now - cache.cached_at > cache.ttl_ms;

    if (isExpired) {
      return { cache, repositoryIds: [], isExpired: true };
    }

    const repositoryIds = cache.repository_ids ? cache.repository_ids.split(',').map(Number) : [];

    return {
      cache,
      repositoryIds,
      isExpired: false,
    };
  }

  /**
   * Get all cached searches for a query (all pages, all filters)
   */
  async getQueryCaches(query: string): Promise<SearchCacheEntity[]> {
    const result = await DatabaseService.query(
      `
      SELECT * FROM search_cache
      WHERE query = ?
      ORDER BY cached_at DESC
      `,
      [query]
    );

    return result.rows;
  }

  /**
   * Get recently cached searches
   */
  async getRecent(limit: number = 20): Promise<SearchCacheEntity[]> {
    const result = await DatabaseService.query(
      `
      SELECT * FROM search_cache
      ORDER BY cached_at DESC
      LIMIT ?
      `,
      [limit.toString()]
    );

    return result.rows;
  }

  /**
   * Get expired cache entries
   */
  async getExpired(): Promise<SearchCacheEntity[]> {
    const now = Date.now();

    const result = await DatabaseService.query(
      `
      SELECT * FROM search_cache
      WHERE (? - cached_at) > ttl_ms
      ORDER BY cached_at ASC
      `,
      [now.toString()]
    );

    return result.rows;
  }

  /**
   * Check if a search is cached and valid (not expired)
   */
  async isCached(
    query: string,
    languageFilter?: string | null,
    page: number = 1
  ): Promise<boolean> {
    const cached = await this.getCachedSearch(query, languageFilter, page);
    return cached !== null && !cached.isExpired;
  }

  /**
   * Delete search cache by ID
   */
  async delete(id: number): Promise<void> {
    await DatabaseService.query('DELETE FROM search_cache WHERE id = ?', [id.toString()]);
  }

  /**
   * Delete search caches by query
   */
  async deleteByQuery(query: string): Promise<number> {
    const result = await DatabaseService.query('DELETE FROM search_cache WHERE query = ?', [query]);

    return result.rowsAffected;
  }

  /**
   * Delete all expired search caches
   */
  async deleteExpired(): Promise<number> {
    const now = Date.now();

    const result = await DatabaseService.query(
      `
      DELETE FROM search_cache
      WHERE (? - cached_at) > ttl_ms
      `,
      [now.toString()]
    );
    return result.rowsAffected;
  }

  /**
   * Delete all search caches
   */
  async deleteAll(): Promise<number> {
    const result = await DatabaseService.query('DELETE FROM search_cache');
    return result.rowsAffected;
  }

  /**
   * Count total search caches
   */
  async count(): Promise<number> {
    const result = await DatabaseService.query('SELECT COUNT(*) as count FROM search_cache');

    return result.rows[0]?.count ?? 0;
  }

  /**
   * Get most searched queries (by frequency)
   */
  async getMostSearched(limit: number = 20): Promise<Array<{ query: string; count: number }>> {
    const result = await DatabaseService.query(
      `
      SELECT query, COUNT(*) as count
      FROM search_cache
      GROUP BY query
      ORDER BY count DESC
      LIMIT ?
      `,
      [limit.toString()]
    );

    return result.rows;
  }

  /**
   * Get search history (unique queries, recent first)
   */
  async getSearchHistory(limit: number = 50): Promise<string[]> {
    const result = await DatabaseService.query(
      `
      SELECT DISTINCT query
      FROM search_cache
      ORDER BY cached_at DESC
      LIMIT ?
      `,
      [limit.toString()]
    );

    return result.rows.map((row) => row.query);
  }

  /**
   * Cleanup: Remove expired search caches and prune old searches
   */
  async cleanup(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    // Remove expired searches
    const expiredCount = await this.deleteExpired();

    // Remove searches older than maxAge
    const cutoffTime = (Date.now() - maxAge).toString();
    const oldResult = await DatabaseService.query('DELETE FROM search_cache WHERE cached_at < ?', [
      cutoffTime,
    ]);

    return expiredCount + oldResult.rowsAffected;
  }
}

export const SearchCacheRepository = SearchCacheRepositoryImpl.getInstance();
