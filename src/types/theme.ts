/**
 * Theme Type Definitions
 *
 * Defines all theme-related types with strict TypeScript.
 * Used throughout the app for type-safe theming.
 */

export type ThemeVariant = 'light' | 'dark';

/**
 * Color Palette Interface
 * Semantic naming prevents confusion (use "background" not "white")
 */
export interface ColorPalette {
  // Primary surfaces
  background: string;
  surface: string;
  surfaceVariant: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverted: string;

  // Interactive elements
  primary: string;
  primaryVariant: string;
  secondary: string;
  secondaryVariant: string;
  accent: string;

  // Semantic colors
  success: string;
  error: string;
  warning: string;
  info: string;

  // Borders and dividers
  border: string;
  divider: string;

  // Overlay/transparency
  overlay: string;
  overlayStrong: string;
}

/**
 * Typography configuration
 * Following Material Design principles
 */
export interface TypographyConfig {
  // Font families
  fonts: {
    regular: string;
    medium: string;
    bold: string;
  };

  // Font sizes (points)
  sizes: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    xxl: number;
  };

  // Line heights (multipliers of font size)
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };

  // Font weights
  weights: {
    regular: '400';
    medium: '500';
    semiBold: '600';
    bold: '700';
  };
}

/**
 * Spacing configuration
 * 8px grid system for consistent spacing
 */
export interface SpacingConfig {
  xs: number; // 4px
  sm: number; // 8px
  md: number; // 12px
  lg: number; // 16px
  xl: number; // 24px
  xxl: number; // 32px
}

/**
 * Complete Theme Configuration
 */
export interface ThemeConfig {
  variant: ThemeVariant;
  colors: ColorPalette;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

/**
 * Theme Context Value
 * Passed via React Context to all components
 */
export interface ThemeContextValue {
  theme: ThemeConfig;
  variant: ThemeVariant;
  setVariant: (variant: ThemeVariant) => void;
  toggleTheme: () => void;
}
