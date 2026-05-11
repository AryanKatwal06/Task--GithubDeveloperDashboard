/**
 * Developers Slice
 *
 * Manages developer/user data from GitHub API
 * Simpler than repositories (no pagination, just search)
 */

import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

import { githubAPI } from '../../../services/githubAPI';
import type { GitHubUser } from '../../../types/api';
import { AppError } from '../../../types/error';
import type { RootState } from '../../';

// ============================================================================
// STATE & TYPES
// ============================================================================

export interface DevelopersSliceState {
  byId: Record<string, GitHubUser>;
  allIds: string[];
  followingIds: string[];
  searchQuery: string;
  searchResults: string[]; // User login names
  loading: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  error: string | null;
}

const initialState: DevelopersSliceState = {
  byId: {},
  allIds: [],
  followingIds: [],
  searchQuery: '',
  searchResults: [],
  loading: 'idle',
  error: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

export const searchDevelopers = createAsyncThunk<
  GitHubUser[],
  { query: string; page?: number },
  { rejectValue: AppError }
>('developers/searchDevelopers', async ({ query, page = 1 }, { rejectWithValue }) => {
  try {
    const response = await githubAPI.searchUsers(query, page);
    return response.items;
  } catch (error) {
    if (error instanceof AppError) {
      return rejectWithValue(error);
    }
    throw error;
  }
});

export const getDeveloperDetails = createAsyncThunk<
  GitHubUser,
  string, // login
  { rejectValue: AppError }
>('developers/getDeveloperDetails', async (login, { rejectWithValue }) => {
  try {
    return await githubAPI.getUser(login);
  } catch (error) {
    if (error instanceof AppError) {
      return rejectWithValue(error);
    }
    throw error;
  }
});

// ============================================================================
// SLICE
// ============================================================================

export const developersSlice = createSlice({
  name: 'developers',
  initialState,
  reducers: {
    toggleFollowing: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (state.followingIds.includes(userId)) {
        state.followingIds = state.followingIds.filter((id) => id !== userId);
      } else {
        state.followingIds.push(userId);
      }
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(searchDevelopers.pending, (state) => {
      state.loading = 'pending';
      state.error = null;
    });

    builder.addCase(searchDevelopers.fulfilled, (state, action) => {
      const users = action.payload;

      users.forEach((user) => {
        state.byId[user.login] = user;
        if (!state.allIds.includes(user.login)) {
          state.allIds.push(user.login);
        }
      });

      state.searchResults = users.map((u) => u.login);
      state.loading = 'fulfilled';
    });

    builder.addCase(searchDevelopers.rejected, (state, action) => {
      state.loading = 'rejected';
      const error = action.payload as AppError;
      state.error = error?.message || 'Failed to search developers';
    });

    builder.addCase(getDeveloperDetails.pending, (state) => {
      state.loading = 'pending';
    });

    builder.addCase(getDeveloperDetails.fulfilled, (state, action) => {
      const user = action.payload;
      state.byId[user.login] = user;
      if (!state.allIds.includes(user.login)) {
        state.allIds.push(user.login);
      }
      state.loading = 'fulfilled';
    });

    builder.addCase(getDeveloperDetails.rejected, (state, action) => {
      state.loading = 'rejected';
      const error = action.payload as AppError;
      state.error = error?.message || 'Failed to fetch developer details';
    });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const { toggleFollowing, clearSearch } = developersSlice.actions;
export default developersSlice.reducer;

// ============================================================================
// SELECTORS
// ============================================================================

const selectDevelopersSlice = (state: RootState) => {
  // Add safety check to prevent accessing undefined state
  if (!state || typeof state !== 'object' || !state.developers) {
    console.warn('[Developers] Invalid state object or developers slice not found');
    return {
      byId: {},
      allIds: [],
      followingIds: [],
      searchQuery: '',
      searchResults: [],
      loading: 'idle',
      error: null,
    };
  }
  
  return state.developers;
};

export const selectDeveloperById = createSelector(
  [(state: RootState) => state.developers.byId, (_: RootState, login: string) => login],
  (byId, login) => byId[login]
);

export const selectSearchResults = createSelector(
  [
    (state: RootState) => state.developers.searchResults,
    (state: RootState) => state.developers.byId,
  ],
  (results, byId) => results.map((login: string) => byId[login]).filter(Boolean)
);

export const selectFollowingDevelopers = createSelector(
  [
    (state: RootState) => state.developers.followingIds,
    (state: RootState) => state.developers.byId,
  ],
  (ids, byId) => ids.map((id: string) => byId[id]).filter(Boolean)
);

export const selectIsLoading = createSelector(
  [selectDevelopersSlice],
  (slice) => slice.loading === 'pending'
);

export const selectError = createSelector([selectDevelopersSlice], (slice) => slice.error);
