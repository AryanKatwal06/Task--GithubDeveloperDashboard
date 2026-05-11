/**
 * Redux Store Configuration
 *
 * Uses Redux Toolkit for minimal boilerplate and best practices.
 *
 * Architecture:
 * - Empty store setup (ready for feature slices)
 * - Dev tools enabled
 * - Redux DevTools support
 * - TypeScript-first approach
 *
 * FUTURE: Feature slices will be added in Phases 4-6
 * - repositoriesSlice
 * - developersSlice
 * - settingsSlice
 * - uiSlice (modals, loading states)
 */

import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { createCacheSyncMiddleware } from '../services/database/cacheSyncMiddleware';

import { repositoriesReducer } from './slices/repositories';
import developersReducer from './slices/developers';
import settingsReducer from './slices/settings';
import uiReducer from './slices/ui';

// ============================================================================
// STORE CONFIGURATION
// ============================================================================

const rootReducer = {
  repositories: repositoriesReducer,
  developers: developersReducer,
  settings: settingsReducer,
  ui: uiReducer,
};

interface CreateAppStoreOptions {
  enableCacheSync?: boolean;
  enableDevTools?: boolean;
}

export const createAppStore = ({
  enableCacheSync = true,
  enableDevTools = __DEV__,
}: CreateAppStoreOptions = {}) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'repositories/searchRepositories/fulfilled',
            'repositories/getRepositoryDetails/fulfilled',
            'repositories/getTrendingRepositories/fulfilled',
            'developers/searchDevelopers/fulfilled',
            'developers/getDeveloperDetails/fulfilled',
          ],
          ignoredPaths: ['repositories.byId', 'repositories.cache', 'developers.byId'],
        },
      });

      return enableCacheSync ? middleware.concat(createCacheSyncMiddleware()) : middleware;
    },
    devTools: enableDevTools
      ? {
          maxAge: 50,
          trace: true,
          traceLimit: 25,
        }
      : false,
  });

export const store = createAppStore();

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * RootState Type
 * Use this in selectors to get typed state
 *
 * EXAMPLE:
 * const selectRepositories = (state: RootState) => state.repositories;
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * AppDispatch Type
 * Use this for typed dispatch
 *
 * EXAMPLE:
 * const dispatch = useAppDispatch();
 * dispatch(fetchRepositories());
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Async Thunk Type
 * Use this for creating type-safe async thunks
 *
 * EXAMPLE:
 * export const fetchRepositories = createAsyncThunk<
 *   Repository[],  // Return type
 *   string,        // Arg type
 *   {
 *     state: RootState;
 *     dispatch: AppDispatch;
 *     rejectValue: ApiError;
 *   }
 * >(...)
 */
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;
