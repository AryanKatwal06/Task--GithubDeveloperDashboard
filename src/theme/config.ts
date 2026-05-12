/**
 * Premium Theme Configuration
 *
 * Modern light palette inspired by top-tier productivity apps
 * - Soft whites and subtle grays for surfaces
 * - Professional accent colors with proper contrast
 * - Smooth gradients and elegant shadows
 * - Premium visual hierarchy
 *
 * Reference: Linear, Notion, GitHub Mobile, Stripe Dashboards
 */

import type { ThemeConfig, ColorPalette, TypographyConfig, SpacingConfig } from '../types/theme';

// ============================================================================
// COLOR PALETTES
// ============================================================================

/**
 * Premium Light Theme Colors
 * Modern, clean, and professional palette
 * Inspired by Linear, Notion, and GitHub Mobile
 */
export const lightColors: ColorPalette = {
  // Surfaces - Premium layered whites
  background: '#FAFBFC', // Soft off-white background
  surface: '#FFFFFF', // Pure white cards
  surfaceVariant: '#F7F8FA', // Subtle surface variation
  surfaceElevated: '#FFFFFF', // Elevated surfaces with shadows

  // Text - Enhanced hierarchy with better contrast
  text: '#1A1B23', // Deep charcoal for primary text
  textSecondary: '#4A5568', // Medium gray for secondary
  textTertiary: '#718096', // Light gray for tertiary
  textQuaternary: '#A0AEC0', // Very light gray for hints
  textInverted: '#FFFFFF', // White text on dark backgrounds
  textSubtle: '#CBD5E0', // Subtle text for disabled states

  // Interactive - Modern accent system
  primary: '#0066FF', // Premium blue (GitHub-style)
  primaryHover: '#0052CC', // Darker blue for hover
  primaryLight: '#E6F0FF', // Light blue for backgrounds
  primaryVariant: '#0969DA', // Alternative blue

  secondary: '#6366F1', // Modern purple
  secondaryHover: '#4F46E5', // Darker purple
  secondaryLight: '#EEF2FF', // Light purple background

  accent: '#F59E0B', // Warm amber for CTAs
  accentHover: '#D97706', // Darker amber
  accentLight: '#FEF3C7', // Light amber background

  // Semantic - Clear, accessible colors
  success: '#059669', // Modern green
  successLight: '#D1FAE5', // Light green background
  error: '#DC2626', // Modern red
  errorLight: '#FEE2E2', // Light red background
  warning: '#D97706', // Modern amber
  warningLight: '#FEF3C7', // Light amber background
  info: '#0EA5E9', // Modern cyan
  infoLight: '#E0F2FE', // Light cyan background

  // Borders - Subtle and elegant
  border: '#E5E7EB', // Light border
  borderLight: '#F3F4F6', // Very light border
  borderMedium: '#D1D5DB', // Medium border
  divider: '#F3F4F6', // Subtle divider

  // Overlay - Premium transparency
  overlay: 'rgba(0, 0, 0, 0.08)', // Very light overlay
  overlayMedium: 'rgba(0, 0, 0, 0.16)', // Medium overlay
  overlayStrong: 'rgba(0, 0, 0, 0.32)', // Strong overlay

  // Gradients - Premium gradients
  gradientPrimary: ['#0066FF', '#0052CC'],
  gradientSecondary: ['#6366F1', '#4F46E5'],
  gradientSurface: ['#FFFFFF', '#F7F8FA'],
};

/**
 * Premium Dark Theme Colors
 * Modern dark mode with proper contrast and elegance
 */
export const darkColors: ColorPalette = {
  // Surfaces - Premium layered darks
  background: '#0A0B0D', // Deep dark background
  surface: '#141519', // Dark surface
  surfaceVariant: '#1A1B21', // Subtle surface variation
  surfaceElevated: '#1F2027', // Elevated surfaces

  // Text - Enhanced hierarchy for dark mode
  text: '#F7F8FA', // Light primary text
  textSecondary: '#D1D5DB', // Medium light secondary
  textTertiary: '#9CA3AF', // Gray tertiary
  textQuaternary: '#6B7280', // Dark gray for hints
  textInverted: '#0A0B0D', // Dark text on light backgrounds
  textSubtle: '#4B5563', // Very subtle text

  // Interactive - Modern accent system for dark mode
  primary: '#3B82F6', // Bright blue
  primaryHover: '#2563EB', // Darker blue for hover
  primaryLight: '#1E3A8A', // Dark blue for backgrounds
  primaryVariant: '#60A5FA', // Lighter blue

  secondary: '#8B5CF6', // Bright purple
  secondaryHover: '#7C3AED', // Darker purple
  secondaryLight: '#4C1D95', // Dark purple background

  accent: '#F59E0B', // Warm amber
  accentHover: '#D97706', // Darker amber
  accentLight: '#78350F', // Dark amber background

  // Semantic - Clear colors for dark mode
  success: '#10B981', // Bright green
  successLight: '#064E3B', // Dark green background
  error: '#EF4444', // Bright red
  errorLight: '#7F1D1D', // Dark red background
  warning: '#F59E0B', // Bright amber
  warningLight: '#78350F', // Dark amber background
  info: '#06B6D4', // Bright cyan
  infoLight: '#164E63', // Dark cyan background

  // Borders - Subtle dark borders
  border: '#2D3748', // Dark border
  borderLight: '#1F2937', // Very dark border
  borderMedium: '#374151', // Medium dark border
  divider: '#1F2937', // Dark divider

  // Overlay - Premium transparency for dark mode
  overlay: 'rgba(255, 255, 255, 0.08)', // Light overlay
  overlayMedium: 'rgba(255, 255, 255, 0.16)', // Medium overlay
  overlayStrong: 'rgba(255, 255, 255, 0.32)', // Strong overlay

  // Gradients - Premium dark gradients
  gradientPrimary: ['#3B82F6', '#2563EB'],
  gradientSecondary: ['#8B5CF6', '#7C3AED'],
  gradientSurface: ['#141519', '#1A1B21'],
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography: TypographyConfig = {
  fonts: {
    // Premium system font stack
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  // Enhanced typography with modern hierarchy
  sizes: {
    xs: 11, // Captions, metadata
    sm: 13, // Small text, labels
    base: 15, // Body text
    lg: 17, // Subheadings
    xl: 20, // Headings
    xxl: 24, // Large headings
    xxxl: 32, // Hero text
    xxxxl: 40, // Display text
  },

  // Refined font weights for better contrast
  weights: {
    regular: '400', // Body text
    medium: '500', // Emphasis
    semiBold: '600', // Subheadings
    bold: '700', // Headings
    extraBold: '800', // Hero text
  },

  // Enhanced letter spacing for readability
  letterSpacing: {
    tighter: -0.8, // Tight spacing
    tight: -0.5, // Slightly tight
    normal: 0, // Normal spacing
    wide: 0.5, // Wide spacing
    wider: 1, // Wider spacing
    widest: 1.5, // Very wide
  },

  // Optimized line heights for readability
  lineHeights: {
    none: 1, // No line height
    tight: 1.2, // Tight line height
    snug: 1.3, // Snug line height
    normal: 1.4, // Normal line height
    relaxed: 1.6, // Relaxed line height
    loose: 1.8, // Loose line height
  },
};

// ============================================================================
// SPACING
// ============================================================================

/**
 * Premium Spacing System
 * Based on 4px grid with expanded scale for better hierarchy
 * Provides consistency and sophisticated spacing relationships
 */
export const spacing: SpacingConfig = {
  xs: 2, // Micro: 2px
  sm: 4, // Small: 4px
  md: 8, // Medium: 8px
  lg: 12, // Large: 12px
  xl: 16, // XL:16px
  xxl: 24, // XXL: 24px
  xxxl: 32, // XXXL: 32px
  xxxxl: 48, // XXXXL: 48px

  // Semantic spacing for common patterns
  gap: {
    xs: 4, // Small gaps
    sm: 8, // Standard gaps
    md: 12, // Medium gaps
    lg: 16, // Large gaps
    xl: 24, // Extra large gaps
  },

  // Component-specific spacing
  component: {
    padding: {
      xs: 8, // Small components
      sm: 12, // Medium components
      md: 16, // Large components
      lg: 20, // Extra large components
      xl: 24, // Cards, containers
    },
    margin: {
      xs: 4, // Small margins
      sm: 8, // Standard margins
      md: 12, // Medium margins
      lg: 16, // Large margins
      xl: 20, // Section margins
    },
  },
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  // Enhanced border radius for modern design
  none: 0, // No radius
  xs: 2, // 2px - Small elements
  sm: 6, // 6px - Buttons, inputs
  md: 10, // 10px - Cards
  lg: 14, // 14px - Large cards
  xl: 18, // 18px - Extra large
  xxl: 24, // 24px - Hero elements
  xxxl: 32, // 32px - Special elements
  full: 9999, // Full radius

  // Semantic radius for common patterns
  button: {
    xs: 6, // Small buttons
    sm: 8, // Standard buttons
    md: 10, // Medium buttons
    lg: 12, // Large buttons
  },
  card: {
    xs: 8, // Small cards
    sm: 10, // Standard cards
    md: 12, // Medium cards
    lg: 14, // Large cards
    xl: 16, // Extra large cards
  },
  avatar: {
    xs: 16, // Small avatars
    sm: 20, // Standard avatars
    md: 24, // Medium avatars
    lg: 32, // Large avatars
    xl: 40, // Extra large avatars
  },
};

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  // Subtle shadows for light elements
  subtle: {
    offset: { width: 0, height: 1 },
    blur: 2,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.05)',
  },

  // Light shadows for cards
  light: {
    offset: { width: 0, height: 2 },
    blur: 4,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.08)',
  },

  // Medium shadows for elevated elements
  medium: {
    offset: { width: 0, height: 4 },
    blur: 8,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.12)',
  },

  // Strong shadows for floating elements
  strong: {
    offset: { width: 0, height: 8 },
    blur: 16,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.15)',
  },

  // Heavy shadows for modals, overlays
  heavy: {
    offset: { width: 0, height: 12 },
    blur: 24,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.25)',
  },

  // Colored shadows for brand elements
  primary: {
    offset: { width: 0, height: 4 },
    blur: 8,
    spread: 0,
    color: 'rgba(0, 102, 255, 0.2)',
  },

  accent: {
    offset: { width: 0, height: 4 },
    blur: 8,
    spread: 0,
    color: 'rgba(245, 158, 11, 0.2)',
  },
} as const;

// ============================================================================
// COMPLETE THEME OBJECTS
// ============================================================================

/**
 * Premium Light Theme
 * Modern, clean, and professional design system
 */
export const lightTheme: ThemeConfig = {
  variant: 'light',
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations: {
    spring: {
      tension: 300,
      friction: 8,
    },
    timing: {
      duration: 300,
    },
  },
};

/**
 * Premium Dark Theme
 * Modern dark mode with enhanced shadows and contrast
 */
export const darkTheme: ThemeConfig = {
  variant: 'dark',
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations: {
    spring: {
      tension: 300,
      friction: 8,
    },
    timing: {
      duration: 300,
    },
  },
};

/**
 * Get theme by variant
 */
export const getTheme = (variant: 'light' | 'dark'): ThemeConfig => {
  return variant === 'dark' ? darkTheme : lightTheme;
};
