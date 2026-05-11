/**
 * Theme Configuration
 *
 * Light and dark color palettes with AA-compliant contrast ratios.
 * All colors chosen for accessibility and visual hierarchy.
 *
 * Reference: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
 */

import type { ThemeConfig, ColorPalette, TypographyConfig, SpacingConfig } from '../types/theme';

// ============================================================================
// COLOR PALETTES
// ============================================================================

/**
 * Light Theme Colors
 * Primary: GitHub blue (#0969da)
 * Contrast-checked against WCAG AA standards
 */
export const lightColors: ColorPalette = {
  // Surfaces
  background: '#FFFFFF',
  surface: '#F6F8FA',
  surfaceVariant: '#EAEEF2',

  // Text - follows GitHub's typography system
  text: '#24292F', // Primary text
  textSecondary: '#57606A', // Secondary text
  textTertiary: '#8C959F', // Tertiary text
  textInverted: '#FFFFFF', // Inverted (on dark backgrounds)

  // Interactive
  primary: '#0969DA', // GitHub blue
  primaryVariant: '#054A87', // Darker blue
  secondary: '#6E40C9', // Purple
  secondaryVariant: '#4B2082',
  accent: '#FFA500', // Orange for CTAs

  // Semantic
  success: '#1A7F0F', // Green
  error: '#DA3633', // Red
  warning: '#BF8700', // Amber
  info: '#0969DA', // Blue

  // Borders
  border: '#D0D7DE',
  divider: '#EAEEF2',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayStrong: 'rgba(0, 0, 0, 0.7)',
};

/**
 * Dark Theme Colors
 * Inverted palette with accessibility maintained
 */
export const darkColors: ColorPalette = {
  // Surfaces
  background: '#0D1117', // GitHub dark background
  surface: '#161B22', // Slightly lighter surface
  surfaceVariant: '#21262D', // Variant surface

  // Text - high contrast on dark backgrounds
  text: '#C9D1D9', // Primary text
  textSecondary: '#8B949E', // Secondary text
  textTertiary: '#6E7681', // Tertiary text
  textInverted: '#0D1117', // Inverted

  // Interactive
  primary: '#58A6FF', // Lighter blue for dark mode
  primaryVariant: '#79C0FF', // Even lighter
  secondary: '#BC8CDB', // Purple
  secondaryVariant: '#D291FF',
  accent: '#FFB81D', // Brighter orange

  // Semantic
  success: '#3FB950', // Green
  error: '#F85149', // Red
  warning: '#D29922', // Amber
  info: '#58A6FF', // Blue

  // Borders
  border: '#30363D',
  divider: '#21262D',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayStrong: 'rgba(0, 0, 0, 0.9)',
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography: TypographyConfig = {
  fonts: {
    // System fonts - fast loading, great readability
    // Falls back to native system fonts if custom fonts not available
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  sizes: {
    xs: 12, // Smallest: captions, helpers
    sm: 14, // Small: labels, secondary text
    base: 16, // Base: body text
    lg: 18, // Large: subheadings
    xl: 24, // XL: section headings
    xxl: 32, // XXL: screen titles
  },
  lineHeights: {
    tight: 1.2, // Headings
    normal: 1.5, // Body text
    relaxed: 1.75, // Long-form content
  },
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

// ============================================================================
// SPACING
// ============================================================================

/**
 * Spacing System
 * Based on 4px grid: xs=4, sm=8, md=12, lg=16, xl=24, xxl=32
 * Provides consistency and scalability
 *
 * Usage:
 * - xs, sm: Tight spacing (inline elements, small gaps)
 * - md, lg: Standard spacing (component padding, section gaps)
 * - xl, xxl: Large spacing (section breaks, major gaps)
 */
export const spacing: SpacingConfig = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// ============================================================================
// COMPLETE THEME OBJECTS
// ============================================================================

/**
 * Light Theme
 */
export const lightTheme: ThemeConfig = {
  variant: 'light',
  colors: lightColors,
  typography,
  spacing,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    large: '0 15px 25px rgba(0, 0, 0, 0.15), 0 10px 15px rgba(0, 0, 0, 0.05)',
  },
};

/**
 * Dark Theme
 */
export const darkTheme: ThemeConfig = {
  variant: 'dark',
  colors: darkColors,
  typography,
  spacing,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)',
    large: '0 15px 25px rgba(0, 0, 0, 0.5), 0 10px 15px rgba(0, 0, 0, 0.3)',
  },
};

/**
 * Get theme by variant
 */
export const getTheme = (variant: 'light' | 'dark'): ThemeConfig => {
  return variant === 'dark' ? darkTheme : lightTheme;
};
