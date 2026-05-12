/**
 * Theme Context Provider
 *
 * Manages theme state (light/dark), persistence, and user-driven toggling.
 * Uses React.createContext for performance-optimized theme delivery.
 *
 * Architecture:
 * - Separate contexts for colors vs full theme (prevents unnecessary re-renders)
 * - Persists user preference to AsyncStorage
 * - Respects system theme on first install
 * - useTheme hook for consuming theme
 */

import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ThemeContextValue, ThemeConfig, ThemeVariant } from '../types/theme';
import { getTheme } from './config';

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
 * - Boots in light mode by default
 * - Allows user to override the current variant
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

  useEffect(() => {
    let isMounted = true;

    const loadThemePreference = async (): Promise<void> => {
      try {
        const storedVariant = await AsyncStorage.getItem('theme-preference');

        if (isMounted && (storedVariant === 'light' || storedVariant === 'dark')) {
          setVariantState(storedVariant);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }
    };

    void loadThemePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const theme: ThemeConfig = useMemo(() => getTheme(variant), [variant]);

  /**
   * Persist and update the current theme variant.
   */
  const setVariant = useCallback((nextVariant: ThemeVariant): void => {
    setVariantState(nextVariant);

    void Promise.resolve(AsyncStorage.setItem('theme-preference', nextVariant)).catch((error) => {
      console.warn('Failed to save theme preference:', error);
    });
  }, []);

  const toggleTheme = useCallback((): void => {
    setVariantState((currentVariant) => {
      const nextVariant: ThemeVariant = currentVariant === 'light' ? 'dark' : 'light';
      void Promise.resolve(AsyncStorage.setItem('theme-preference', nextVariant)).catch((error) => {
        console.warn('Failed to save theme preference:', error);
      });

      return nextVariant;
    });
  }, []);

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
