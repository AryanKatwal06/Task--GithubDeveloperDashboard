/**
 * Repositories Slice State & Types
 *
 * Manages:
 * - Repository search results
 * - Repository details
 * - Favorites/bookmarks
 * - Pagination state
 * - Loading & error states
 *
 * Uses normalized state for performance
 */

import type { GitHubRepository } from '../../../types/api';

// ============================================================================
// NORMALIZED ENTITY STORAGE
// ============================================================================

/**
 * Normalized repository entity
 * Removes nested user object to prevent duplication
 */
export interface RepositoryEntity extends Omit<GitHubRepository, 'owner'> {
  ownerId: number;
}

/**
 * Pagination state for search results
 */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

/**
 * Search filters
 */
export interface RepositoryFilters {
  language?: string;
  sort?: 'stars' | 'forks' | 'updated';
  order?: 'asc' | 'desc';
}

/**
 * Search session state
 * Tracks search history and pagination
 */
export interface SearchSession {
  query: string;
  filters: RepositoryFilters;
  repositoryIds: string[]; // IDs in search result order
  pagination: PaginationState;
  timestamp: number;
}

// ============================================================================
// SLICE STATE
// ============================================================================

export interface RepositoriesSliceState {
  // Normalized entities
  byId: Record<string, RepositoryEntity>;
  allIds: string[];

  // Favorites (user-saved repositories)
  favoriteIds: string[];

  // Search state
  searchSession: SearchSession | null;
  currentSearchQuery: string;

  // Loading & error states
  loading: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  error: string | null;
  lastFetchTime: number | null;
  activeRequestId: string | null;

  // Caching (prevent redundant requests)
  cache: {
    searchQueries: Record<string, number>; // query -> timestamp
    repositoryIds: Record<string, number>; // repo id -> timestamp
  };
}

// ============================================================================
// INITIAL STATE
// ============================================================================

export const initialRepositoriesState: RepositoriesSliceState = {
  byId: {},
  allIds: [],
  favoriteIds: [],
  searchSession: null,
  currentSearchQuery: '',
  loading: 'idle',
  error: null,
  lastFetchTime: null,
  activeRequestId: null,
  cache: {
    searchQueries: {},
    repositoryIds: {},
  },
};
