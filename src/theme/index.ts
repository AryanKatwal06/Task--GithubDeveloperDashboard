/**
 * Theme Module Exports
 *
 * Centralized exports for all theme-related functionality
 */

export { ThemeProvider } from './ThemeProvider';
export { useTheme } from '../hooks/useTheme';
export { lightTheme, darkTheme, getTheme } from './config';
export type {
  ThemeContextValue,
  ThemeConfig,
  ColorPalette,
  TypographyConfig,
  SpacingConfig,
  ThemeVariant,
} from '../types/theme';
export {
  createThemedStyles,
  flexUtils,
  createSpacingUtils,
  getShadowStyle,
  getOpacityStyle,
} from './utils';
