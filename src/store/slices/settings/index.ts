/**
 * Settings Slice
 *
 * Manages app preferences and settings
 * Persisted to AsyncStorage
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../';
import type { ThemeVariant } from '../../../types/theme';

// ============================================================================
// STATE & TYPES
// ============================================================================

export interface SettingsSliceState {
  theme: ThemeVariant;
  showNotifications: boolean;
  defaultLanguage: string | null;
  perPage: number;
  apiCacheTime: number; // milliseconds
}

const initialState: SettingsSliceState = {
  theme: 'light',
  showNotifications: true,
  defaultLanguage: null,
  perPage: 30,
  apiCacheTime: 5 * 60 * 1000, // 5 minutes
};

// ============================================================================
// SLICE
// ============================================================================

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    /**
     * Set theme preference
     */
    setTheme: (state, action: PayloadAction<ThemeVariant>) => {
      state.theme = action.payload;
    },

    /**
     * Toggle notifications
     */
    setShowNotifications: (state, action: PayloadAction<boolean>) => {
      state.showNotifications = action.payload;
    },

    /**
     * Set default search language filter
     */
    setDefaultLanguage: (state, action: PayloadAction<string | null>) => {
      state.defaultLanguage = action.payload;
    },

    /**
     * Set pagination size
     */
    setPerPage: (state, action: PayloadAction<number>) => {
      if (action.payload >= 10 && action.payload <= 100) {
        state.perPage = action.payload;
      }
    },

    /**
     * Reset all settings to defaults
     */
    resetSettings: () => initialState,
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const { setTheme, setShowNotifications, setDefaultLanguage, setPerPage, resetSettings } =
  settingsSlice.actions;

export default settingsSlice.reducer;

// ============================================================================
// SELECTORS
// ============================================================================

export const selectTheme = (state: RootState): ThemeVariant => {
  if (!state || typeof state !== 'object' || !state.settings) {
    console.warn('[Settings] Invalid state object or settings slice not found');
    return 'light';
  }
  return state.settings.theme;
};

export const selectShowNotifications = (state: RootState): boolean => {
  if (!state || typeof state !== 'object' || !state.settings) {
    console.warn('[Settings] Invalid state object or settings slice not found');
    return true;
  }
  return state.settings.showNotifications;
};

export const selectDefaultLanguage = (state: RootState): string | null => {
  if (!state || typeof state !== 'object' || !state.settings) {
    console.warn('[Settings] Invalid state object or settings slice not found');
    return null;
  }
  return state.settings.defaultLanguage;
};

export const selectPerPage = (state: RootState): number => {
  if (!state || typeof state !== 'object' || !state.settings) {
    console.warn('[Settings] Invalid state object or settings slice not found');
    return 30;
  }
  return state.settings.perPage;
};

export const selectApiCacheTime = (state: RootState): number => {
  if (!state || typeof state !== 'object' || !state.settings) {
    console.warn('[Settings] Invalid state object or settings slice not found');
    return 5 * 60 * 1000;
  }
  return state.settings.apiCacheTime;
};
