/**
 * Repositories Selectors
 *
 * Selectors query Redux state for repositories data
 * All component queries go through selectors
 * Enables refactoring state structure without changing components
 *
 * Memoized selectors prevent unnecessary re-renders
 */

import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '../../';
import type { RepositoryEntity, RepositoriesSliceState } from './types';

// ============================================================================
// BASE SELECTORS
// ============================================================================

/**
 * Select repositories slice
 */
const selectRepositoriesSlice = (state: RootState) => {
  // Add safety check to prevent accessing undefined state
  if (!state || typeof state !== 'object' || !state.repositories) {
    console.warn('[Selectors] Invalid state object or repositories slice not found');
    // Return a minimal safe fallback
    return {
      byId: {},
      allIds: [],
      favoriteIds: [],
      searchSession: null,
      loading: 'idle',
      error: null,
      cache: { searchQueries: {}, repositoryIds: {} },
      currentSearchQuery: '',
      lastFetchTime: null,
      activeRequestId: null,
    } as RepositoriesSliceState;
  }

  return state.repositories;
};

/**
 * Select repositories by ID
 */
const selectRepositoriesById = createSelector(
  [selectRepositoriesSlice],
  (repositories) => repositories.byId
);

/**
 * Select all repository IDs
 */
const selectAllRepositoryIds = createSelector(
  [selectRepositoriesSlice],
  (repositories) => repositories.allIds
);

/**
 * Select favorite repository IDs
 */
const selectFavoriteIds = createSelector(
  [selectRepositoriesSlice],
  (repositories) => repositories.favoriteIds
);

/**
 * Select favorite ID lookup map for O(1) checks in list render paths
 */
export const selectFavoriteLookup = createSelector([selectFavoriteIds], (favoriteIds) => {
  const lookup: Record<string, true> = {};
  favoriteIds.forEach((id: string) => {
    lookup[id] = true;
  });
  return lookup;
});

/**
 * Select current search session
 */
const selectSearchSession = createSelector(
  [selectRepositoriesSlice],
  (repositories) => repositories.searchSession
);

/**
 * Select loading state
 */
const selectLoading = createSelector(
  [selectRepositoriesSlice],
  (repositories) => repositories.loading
);

/**
 * Select error state
 */
const selectError = createSelector([selectRepositoriesSlice], (repositories) => repositories.error);

/**
 * Select last fetch time
 */
const selectLastFetchTime = createSelector(
  [selectRepositoriesSlice],
  (repositories) => repositories.lastFetchTime
);

// ============================================================================
// DERIVED SELECTORS
// ============================================================================

/**
 * Select all repositories (array format)
 *
 * PERFORMANCE NOTE:
 * This selector creates a new array every time state changes,
 * even if repositories didn't change.
 *
 * Use selectRepositoriesByIds() instead for better performance.
 */
export const selectAllRepositories = createSelector(
  [selectAllRepositoryIds, selectRepositoriesById],
  (ids, byId) => ids.map((id: string) => byId[id] as RepositoryEntity)
);

/**
 * Select repositories by specific IDs
 *
 * USAGE:
 * const searchResults = selectRepositoriesByIds(state, searchSession.repositoryIds);
 *
 * More efficient than selectAllRepositories if you only need subset
 */
export const selectRepositoriesByIds = createSelector(
  [selectRepositoriesById, (_: RootState, ids: string[]) => ids],
  (byId, ids) => ids.map((id: string) => byId[id]).filter(Boolean)
);

/**
 * Select single repository by ID
 *
 * USAGE:
 * const repo = selectRepositoryById(state, repoId);
 */
export const selectRepositoryById = createSelector(
  [selectRepositoriesById, (_: RootState, id: string | number) => id.toString()],
  (byId, id) => byId[id]
);

/**
 * Select favorite repositories
 */
export const selectFavoriteRepositories = createSelector(
  [selectRepositoriesById, selectFavoriteIds],
  (byId, favoriteIds) => favoriteIds.map((id: string) => byId[id]).filter(Boolean)
);

/**
 * Select search results (repositories from current search)
 *
 * USAGE:
 * const results = selectSearchResults(state);
 */
export const selectSearchResults = createSelector(
  [selectSearchSession, selectRepositoriesById],
  (searchSession, byId) => {
    if (!searchSession) return [];
    return searchSession.repositoryIds.map((id: string) => byId[id]).filter(Boolean);
  }
);

/**
 * Select search pagination info
 */
export const selectSearchPagination = createSelector(
  [selectSearchSession],
  (searchSession) => searchSession?.pagination ?? null
);

/**
 * Select is repository favorite
 *
 * USAGE:
 * const isFavorite = selectIsRepositoryFavorite(state, repoId);
 */
export const selectIsRepositoryFavorite = createSelector(
  [selectFavoriteIds, (_: RootState, id: string | number) => id.toString()],
  (favoriteIds, id) => favoriteIds.includes(id)
);

/**
 * Select repository with favorite status
 *
 * Combines repository data with favorite flag
 */
export const selectRepositoryWithFavorite = createSelector(
  [selectRepositoriesById, selectFavoriteIds, (_: RootState, id: string | number) => id.toString()],
  (byId, favoriteIds, id) => {
    const repo = byId[id];
    if (!repo) return null;

    return {
      ...repo,
      isFavorite: favoriteIds.includes(id),
    };
  }
);

/**
 * Select loading state
 */
export const selectIsLoading = createSelector([selectLoading], (loading) => loading === 'pending');

export const selectErrorMessage = selectError;

/**
 * Select is data stale
 *
 * Data is stale if:
 * - Never fetched
 * - Last fetch was > 5 minutes ago
 *
 * USAGE:
 * if (selectIsDataStale(state)) {
 *   dispatch(searchRepositories(...)); // refresh
 * }
 */
export const selectIsDataStale = createSelector([selectLastFetchTime], (lastFetchTime) => {
  if (!lastFetchTime) return true;
  const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
  return Date.now() - lastFetchTime > CACHE_TIME;
});

/**
 * Select repositories grouped by language
 *
 * USAGE:
 * const byLanguage = selectRepositoriesByLanguage(state);
 * console.log(byLanguage['JavaScript']); // [repo1, repo2]
 */
export const selectRepositoriesByLanguage = createSelector(
  [selectAllRepositories],
  (repositories) => {
    const grouped: Record<string, RepositoryEntity[]> = {};

    repositories.forEach((repo: RepositoryEntity) => {
      const language = repo.language || 'Unknown';
      if (!grouped[language]) {
        grouped[language] = [];
      }
      grouped[language].push(repo);
    });

    return grouped;
  }
);

/**
 * Select top N repositories by stars
 */
export const selectTopRepositoriesByStars = createSelector(
  [selectAllRepositories, (_: RootState, limit: number = 10) => limit],
  (repositories, limit) =>
    [...repositories].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, limit)
);

/**
 * Select repository statistics
 *
 * Useful for analytics/dashboard
 */
export const selectRepositoryStats = createSelector(
  [selectAllRepositories, selectFavoriteIds],
  (repositories: RepositoryEntity[], favoriteIds) => ({
    totalRepositories: repositories.length,
    totalFavorites: favoriteIds.length,
    totalStars: repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    totalForks: repositories.reduce((sum, repo) => sum + repo.forks_count, 0),
    languages: [...new Set(repositories.map((r) => r.language).filter(Boolean))],
  })
);

// ============================================================================
// ROOT STATE SELECTORS
// ============================================================================

/**
 * Select entire repositories state
 * Useful for debugging
 */
export const selectRepositoriesState = (state: RootState) => state.repositories;
