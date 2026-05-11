/**
 * Cache Utilities
 *
 * Helper functions for cache validation, key generation, and sync strategies
 */

import { CACHE_TTL } from './schema';

// ============================================================================
// CACHE VALIDATION
// ============================================================================

/**
 * Check if a timestamp is within TTL
 *
 * @param cachedAt - Timestamp when data was cached
 * @param ttlMs - Time-to-live in milliseconds
 * @returns true if cache is still valid
 */
export function isCacheValid(cachedAt: number, ttlMs: number): boolean {
  const now = Date.now();
  return now - cachedAt <= ttlMs;
}

/**
 * Get cache age in milliseconds
 */
export function getCacheAge(cachedAt: number): number {
  return Date.now() - cachedAt;
}

/**
 * Get time remaining until cache expires
 * Returns negative if already expired
 */
export function getCacheTimeRemaining(cachedAt: number, ttlMs: number): number {
  const now = Date.now();
  return ttlMs - (now - cachedAt);
}

/**
 * Get cache percentage (0-100)
 * 100 = just cached, 0 = about to expire, negative = expired
 */
export function getCachePercentage(cachedAt: number, ttlMs: number): number {
  const remaining = getCacheTimeRemaining(cachedAt, ttlMs);
  return Math.max(0, Math.min(100, (remaining / ttlMs) * 100));
}

/**
 * Format cache age as human-readable string
 */
export function formatCacheAge(cachedAt: number): string {
  const ageMs = getCacheAge(cachedAt);
  const ageSeconds = Math.floor(ageMs / 1000);
  const ageMinutes = Math.floor(ageSeconds / 60);
  const ageHours = Math.floor(ageMinutes / 60);
  const ageDays = Math.floor(ageHours / 24);

  if (ageDays > 0) return `${ageDays}d ago`;
  if (ageHours > 0) return `${ageHours}h ago`;
  if (ageMinutes > 0) return `${ageMinutes}m ago`;
  return `${ageSeconds}s ago`;
}

// ============================================================================
// CACHE KEYS & IDS
// ============================================================================

/**
 * Generate cache key for search query
 */
export function getSearchCacheKey(query: string, language?: string, page: number = 1): string {
  return `search:${query}:${language || 'all'}:${page}`;
}

/**
 * Generate cache key for repository
 */
export function getRepositoryCacheKey(fullName: string): string {
  return `repo:${fullName}`;
}

/**
 * Generate cache key for user
 */
export function getUserCacheKey(login: string): string {
  return `user:${login}`;
}

/**
 * Generate cache key for trending repos
 */
export function getTrendingCacheKey(language?: string): string {
  return `trending:${language || 'all'}`;
}

// ============================================================================
// CACHE STRATEGY HELPERS
// ============================================================================

/**
 * Determine cache TTL based on entity type and freshness requirements
 */
export function determineCacheTTL(
  entityType: keyof typeof CACHE_TTL,
  options?: {
    userPreferredTTL?: number;
    minTTL?: number;
  }
): number {
  let ttl = CACHE_TTL[entityType] || CACHE_TTL.REPOSITORY_DETAIL;

  if (options?.userPreferredTTL) {
    ttl = Math.max(ttl, options.userPreferredTTL);
  }

  if (options?.minTTL) {
    ttl = Math.max(ttl, options.minTTL);
  }

  return ttl;
}

/**
 * Check if data should be refreshed
 *
 * Strategy: Refresh if expired OR if approaching expiration (80% through TTL)
 */
export function shouldRefreshCache(
  cachedAt: number,
  ttlMs: number,
  forceRefresh: boolean = false
): boolean {
  if (forceRefresh) return true;

  const remaining = getCacheTimeRemaining(cachedAt, ttlMs);
  const percentRemaining = (remaining / ttlMs) * 100;

  // Refresh if less than 20% time remaining
  return percentRemaining < 20;
}

/**
 * Stale-while-revalidate pattern
 *
 * Returns data immediately if available, but marks whether refresh is needed
 */
export function evaluateStaleWhileRevalidate(
  cachedAt: number,
  ttlMs: number,
  staleAfterMs?: number
): {
  isStale: boolean;
  shouldRevalidate: boolean;
  revalidateIfPossible: boolean;
} {
  const ageMs = getCacheAge(cachedAt);
  const isExpired = ageMs > ttlMs;
  const staleThreshold = staleAfterMs ?? Math.floor(ttlMs * 0.8);
  const isStale = ageMs > staleThreshold;

  return {
    isStale,
    shouldRevalidate: isExpired, // Only revalidate if truly expired
    revalidateIfPossible: isStale && !isExpired, // Can use stale data while revalidating
  };
}

// ============================================================================
// CLEANUP STRATEGIES
// ============================================================================

/**
 * Determine if cache cleanup is needed
 *
 * Cleanup strategy:
 * - Remove expired items
 * - Keep total cache size manageable
 * - Preserve frequently accessed items
 */
export function isCleanupNeeded(
  cacheItemCount: number,
  maxItems: number = 1000,
  lastCleanupTime: number = 0,
  cleanupIntervalMs: number = 24 * 60 * 60 * 1000
): boolean {
  const timeSinceCleanup = Date.now() - lastCleanupTime;
  const exceededCount = cacheItemCount > maxItems * 1.5; // 50% over max
  const timePassed = timeSinceCleanup > cleanupIntervalMs;

  return exceededCount || timePassed;
}

/**
 * Calculate cache pressure (0-100)
 *
 * Returns percentage indicating how "full" the cache is
 */
export function calculateCachePressure(currentItems: number, maxItems: number = 1000): number {
  return Math.min(100, (currentItems / maxItems) * 100);
}

// ============================================================================
// DEBUGGING & METRICS
// ============================================================================

/**
 * Get cache statistics
 */
export function getCacheStats(cacheEntries: Array<{ cached_at: number; ttl_ms: number }>): {
  total: number;
  valid: number;
  expired: number;
  avgAge: number;
  oldestAge: number;
  youngestAge: number;
} {
  const now = Date.now();

  let valid = 0;
  let expired = 0;
  let totalAge = 0;
  let oldestAge = 0;
  let youngestAge = Infinity;

  for (const entry of cacheEntries) {
    const age = now - entry.cached_at;
    totalAge += age;

    if (age > entry.ttl_ms) {
      expired++;
    } else {
      valid++;
    }

    oldestAge = Math.max(oldestAge, age);
    youngestAge = Math.min(youngestAge, age);
  }

  return {
    total: cacheEntries.length,
    valid,
    expired,
    avgAge: cacheEntries.length > 0 ? totalAge / cacheEntries.length : 0,
    oldestAge,
    youngestAge: youngestAge === Infinity ? 0 : youngestAge,
  };
}

/**
 * Log cache performance metrics
 */
export function logCacheMetrics(label: string, stats: ReturnType<typeof getCacheStats>): void {
  console.log(`[Cache] ${label}:`, {
    total: stats.total,
    valid: stats.valid,
    expired: stats.expired,
    hitRate: `${((stats.valid / stats.total) * 100).toFixed(1)}%`,
    avgAge: formatCacheAge(Date.now() - stats.avgAge),
  });
}
