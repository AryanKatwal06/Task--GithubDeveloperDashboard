/**
 * Theme Context Provider
 *
 * Manages theme state (light/dark), persistence, and system preference detection.
 * Uses React.createContext for performance-optimized theme delivery.
 *
 * Architecture:
 * - Separate contexts for colors vs full theme (prevents unnecessary re-renders)
 * - Persists user preference to AsyncStorage
 * - Respects system theme on first install
 * - useTheme hook for consuming theme
 */

import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ThemeContextValue, ThemeConfig, ThemeVariant } from '../types/theme';
import { getTheme, lightTheme } from './config';

// ============================================================================
// CONTEXT CREATION
// ============================================================================

/**
 * Theme Context
 * Provides theme config and methods to toggle theme
 */
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================================================
// THEME PROVIDER COMPONENT
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider
 *
 * Features:
 * - Detects system theme preference on app start
 * - Allows user to override system preference
 * - Persists preference to AsyncStorage
 * - Memoizes theme to prevent unnecessary re-renders
 * - Provides toggle function for easy theme switching
 *
 * PERFORMANCE NOTE:
 * The context value is memoized with useMemo to prevent all consumers
 * from re-rendering every time provider re-renders. Only changes to
 * {theme, variant, setVariant, toggleTheme} trigger consumer updates.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [variant, setVariantState] = useState<ThemeVariant>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize theme on app start
   *
   * 1. Check AsyncStorage for saved preference
   * 2. Fall back to system preference
   * 3. Fall back to light theme
   *
   * WHY: Respects user choice but works on first install
   */
  useEffect(() => {
    const initializeTheme = async (): Promise<void> => {
      try {
        // Check for saved preference
        const savedTheme = await AsyncStorage.getItem('theme-preference');

        if (savedTheme === 'light' || savedTheme === 'dark') {
          setVariantState(savedTheme);
          setIsInitialized(true);
          return;
        }

        // Fall back to system preference
        const systemScheme = Appearance.getColorScheme();
        const theme: ThemeVariant = systemScheme === 'dark' ? 'dark' : 'light';
        setVariantState(theme);
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeTheme();
  }, []);

  /**
   * Handle system theme changes
   *
   * If user hasn't set a preference, respect system changes.
   * If user has set a preference, ignore system changes.
   */
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only update if no saved preference exists
      AsyncStorage.getItem('theme-preference').then((saved) => {
        if (!saved && colorScheme) {
          const newTheme: ThemeVariant = colorScheme === 'dark' ? 'dark' : 'light';
          setVariantState(newTheme);
        }
      });
    });

    return (): void => subscription?.remove();
  }, []);

  /**
   * Update theme variant and persist choice
   *
   * Called when user toggles theme or selects a specific theme.
   */
  const setVariant = useCallback(async (newVariant: ThemeVariant): Promise<void> => {
    setVariantState(newVariant);
    try {
      await AsyncStorage.setItem('theme-preference', newVariant);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  /**
   * Toggle between light and dark
   *
   * Convenience function for theme toggle button
   */
  const toggleTheme = useCallback((): void => {
    setVariant(variant === 'dark' ? 'light' : 'dark');
  }, [variant, setVariant]);

  /**
   * Get current theme config
   *
   * WHY NOT compute in provider directly:
   * We want to memoize the entire context value to prevent
   * unnecessary re-renders of all consumers
   */
  const theme: ThemeConfig = useMemo(() => {
    if (!isInitialized) {
      // Return light theme while initializing to prevent flicker
      return lightTheme;
    }
    return getTheme(variant);
  }, [variant, isInitialized]);

  /**
   * Memoize context value
   *
   * PERFORMANCE CRITICAL:
   * Even though this re-runs on every render, the memoized object
   * reference only changes when any dependency changes. This prevents
   * all child components from re-rendering due to context value changes.
   */
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      variant,
      setVariant,
      toggleTheme,
    }),
    [theme, variant, setVariant, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
