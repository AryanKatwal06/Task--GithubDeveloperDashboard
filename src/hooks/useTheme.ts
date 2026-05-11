/**
 * useTheme Hook
 *
 * Provides typed access to theme throughout the application.
 *
 * Usage:
 * const { theme, variant, toggleTheme } = useTheme();
 * const { colors, spacing } = theme;
 */

import { useContext } from 'react';

import type { ThemeContextValue } from '../types/theme';
import { ThemeContext } from '../theme/ThemeProvider';

/**
 * useTheme Hook
 *
 * Returns the current theme configuration and theme control functions.
 *
 * THROWS ERROR:
 * If component using this hook is not wrapped by ThemeProvider.
 * This is intentional - ensures provider is always in the tree.
 *
 * @returns Theme context value including colors, typography, spacing, and control functions
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * const { theme, variant, toggleTheme } = useTheme();
 * return <View style={{ backgroundColor: theme.colors.background }} />;
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      '❌ useTheme must be used within a ThemeProvider. ' +
        'Ensure your component is wrapped by <ThemeProvider> in the component tree.'
    );
  }

  return context;
};
