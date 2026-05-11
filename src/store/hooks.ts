/**
 * Redux Hooks
 *
 * Typed Redux hooks to avoid repeating types throughout the app
 *
 * WHY:
 * React-Redux's useDispatch and useSelector return generic types.
 * These typed versions provide autocomplete and type checking everywhere.
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

import type { RootState, AppDispatch } from './index';

/**
 * useAppDispatch Hook
 *
 * Typed dispatch hook with async thunk support
 *
 * USAGE:
 * const dispatch = useAppDispatch();
 * dispatch(fetchRepositories('react'));
 */
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

/**
 * useAppSelector Hook
 *
 * Typed selector hook with full autocomplete
 *
 * USAGE:
 * const repositories = useAppSelector((state) => state.repositories.items);
 * // TypeScript knows the type of repositories!
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
