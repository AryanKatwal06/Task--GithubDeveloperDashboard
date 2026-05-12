/**
 * Repositories Slice
 *
 * Redux Toolkit slice for repositories state management
 * Handles all repository-related state updates
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { initialRepositoriesState, RepositoryEntity } from './types';
import { searchRepositories, getRepositoryDetails, getTrendingRepositories } from './thunks';
import type { AppError } from '../../../types/error';

// ============================================================================
// SLICE CREATION
// ============================================================================

export const repositoriesSlice = createSlice({
  name: 'repositories',
  initialState: initialRepositoriesState,
  reducers: {
    /**
     * Clear search results
     */
    clearSearch: (state) => {
      state.searchSession = null;
      state.currentSearchQuery = '';
      state.error = null;
    },

    /**
     * Toggle favorite status
     */
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const repoId = action.payload;
      if (state.favoriteIds.includes(repoId)) {
        state.favoriteIds = state.favoriteIds.filter((id) => id !== repoId);
      } else {
        state.favoriteIds.push(repoId);
      }
    },

    /**
     * Clear all favorites
     */
    clearFavorites: (state) => {
      state.favoriteIds = [];
    },

    /**
     * Clear cache
     */
    clearCache: (state) => {
      state.cache.searchQueries = {};
      state.cache.repositoryIds = {};
      state.searchSession = null;
      state.currentSearchQuery = '';
      state.loading = 'idle';
      state.error = null;
      state.lastFetchTime = null;
      state.activeRequestId = null;
    },
    /**
     * Hydrate search session from cached repository IDs.
     * Used to show all cached repos when offline / from dashboard "See all".
     */
    hydrateSearchSession: (
      state,
      action: PayloadAction<{
        query?: string;
        repositoryIds: string[];
        repositories?: RepositoryEntity[];
      }>
    ) => {
      const { query = 'Cached Repositories', repositoryIds, repositories } = action.payload;

      // Optionally hydrate entity store with provided repositories
      if (Array.isArray(repositories) && repositories.length > 0) {
        repositories.forEach((repo) => {
          state.byId[repo.id.toString()] = repo;
          if (!state.allIds.includes(repo.id.toString())) {
            state.allIds.push(repo.id.toString());
          }
        });
      }

      state.searchSession = {
        query,
        filters: {},
        repositoryIds: repositoryIds.slice(),
        pagination: {
          currentPage: 1,
          pageSize: repositoryIds.length,
          totalCount: repositoryIds.length,
          hasMore: false,
        },
        timestamp: Date.now(),
      };

      state.currentSearchQuery = query;
      state.loading = 'fulfilled';
      state.error = null;
      state.lastFetchTime = Date.now();
      state.activeRequestId = null;
    },
  },

  // =========================================================================
  // EXTRA REDUCERS (for async thunks)
  // =========================================================================

  extraReducers: (builder) => {
    // =====================================================================
    // searchRepositories
    // =====================================================================

    builder.addCase(searchRepositories.pending, (state, action) => {
      state.loading = 'pending';
      state.error = null;
      state.activeRequestId = action.meta.requestId;
    });

    builder.addCase(searchRepositories.fulfilled, (state, action) => {
      if (state.activeRequestId && state.activeRequestId !== action.meta.requestId) {
        return;
      }

      const { repositories, totalCount, query, filters, page, perPage } = action.payload;

      // Normalize repositories
      repositories.forEach((repo) => {
        if (!repo || typeof repo.id !== 'number' || !repo.owner) {
          return;
        }

        const entity: RepositoryEntity = {
          ...repo,
          ownerId: repo.owner.id,
        } as RepositoryEntity;

        state.byId[repo.id.toString()] = entity;
        if (!state.allIds.includes(repo.id.toString())) {
          state.allIds.push(repo.id.toString());
        }
      });

      const validRepoIds = repositories
        .filter((r) => r && typeof r.id === 'number')
        .map((r) => r.id.toString());

      const isPaginationContinuation = page > 1 && state.searchSession?.query === query;
      const previousRepositoryIds = state.searchSession?.repositoryIds ?? [];

      const repositoryIds = isPaginationContinuation
        ? [...previousRepositoryIds, ...validRepoIds].filter(
            (value, index, array) => array.indexOf(value) === index
          )
        : validRepoIds;

      // Update search session
      state.searchSession = {
        query,
        filters,
        repositoryIds,
        pagination: {
          currentPage: page,
          pageSize: perPage,
          totalCount: totalCount || repositories.length,
          hasMore: page * perPage < (totalCount || repositories.length),
        },
        timestamp: Date.now(),
      };

      state.currentSearchQuery = query;
      state.loading = 'fulfilled';
      state.lastFetchTime = Date.now();
      state.activeRequestId = null;
      state.error = null;

      // Cache this search
      state.cache.searchQueries[query] = Date.now();
    });

    builder.addCase(searchRepositories.rejected, (state, action) => {
      if (state.activeRequestId && state.activeRequestId !== action.meta.requestId) {
        return;
      }

      state.loading = 'rejected';
      const error = action.payload as AppError;
      state.error = error?.message || 'Failed to search repositories';
      state.activeRequestId = null;
    });

    // =====================================================================
    // getRepositoryDetails
    // =====================================================================

    builder.addCase(getRepositoryDetails.pending, (state, action) => {
      state.loading = 'pending';
      state.error = null;
      state.activeRequestId = action.meta.requestId;
    });

    builder.addCase(getRepositoryDetails.fulfilled, (state, action) => {
      if (state.activeRequestId && state.activeRequestId !== action.meta.requestId) {
        return;
      }

      const { repository } = action.payload;

      // Store normalized repository
      const entity: RepositoryEntity = {
        ...repository,
        ownerId: repository.owner.id,
      } as RepositoryEntity;

      state.byId[repository.id.toString()] = entity;
      if (!state.allIds.includes(repository.id.toString())) {
        state.allIds.push(repository.id.toString());
      }

      state.loading = 'fulfilled';
      state.lastFetchTime = Date.now();
      state.activeRequestId = null;
    });

    builder.addCase(getRepositoryDetails.rejected, (state, action) => {
      if (state.activeRequestId && state.activeRequestId !== action.meta.requestId) {
        return;
      }

      state.loading = 'rejected';
      const error = action.payload as AppError;
      state.error = error?.message || 'Failed to fetch repository details';
      state.activeRequestId = null;
    });

    // =====================================================================
    // getTrendingRepositories
    // =====================================================================

    builder.addCase(getTrendingRepositories.pending, (state, action) => {
      state.loading = 'pending';
      state.error = null;
      state.activeRequestId = action.meta.requestId;
    });

    builder.addCase(getTrendingRepositories.fulfilled, (state, action) => {
      if (state.activeRequestId && state.activeRequestId !== action.meta.requestId) {
        return;
      }

      const { repositories, query, filters, page, perPage } = action.payload;

      // Store repositories
      repositories.forEach((repo) => {
        const entity: RepositoryEntity = {
          ...repo,
          ownerId: repo.owner.id,
        } as RepositoryEntity;

        state.byId[repo.id.toString()] = entity;
        if (!state.allIds.includes(repo.id.toString())) {
          state.allIds.push(repo.id.toString());
        }
      });

      // Update search session for trending
      state.searchSession = {
        query,
        filters,
        repositoryIds: repositories.map((r) => r.id.toString()),
        pagination: {
          currentPage: page,
          pageSize: perPage,
          totalCount: repositories.length,
          hasMore: false, // Trending doesn't have pagination in our impl
        },
        timestamp: Date.now(),
      };

      state.loading = 'fulfilled';
      state.lastFetchTime = Date.now();
      state.activeRequestId = null;
    });

    builder.addCase(getTrendingRepositories.rejected, (state, action) => {
      if (state.activeRequestId && state.activeRequestId !== action.meta.requestId) {
        return;
      }

      state.loading = 'rejected';
      const error = action.payload as AppError;
      state.error = error?.message || 'Failed to fetch trending repositories';
      state.activeRequestId = null;
    });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const { clearSearch, toggleFavorite, clearFavorites, clearCache } =
  repositoriesSlice.actions;

export default repositoriesSlice.reducer;
