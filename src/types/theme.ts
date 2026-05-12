/**
 * Theme Type Definitions
 *
 * Defines all theme-related types with strict TypeScript.
 * Used throughout the app for type-safe theming.
 */

export type ThemeVariant = 'light' | 'dark';

/**
 * Color Palette Interface
 * Premium color system with enhanced semantic naming
 */
export interface ColorPalette {
  // Primary surfaces
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceElevated: string;

  // Text colors - Enhanced hierarchy
  text: string;
  textSecondary: string;
  textTertiary: string;
  textQuaternary: string;
  textInverted: string;
  textSubtle: string;

  // Interactive elements - Modern accent system
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryVariant: string;
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;
  accent: string;
  accentHover: string;
  accentLight: string;

  // Semantic colors with light variants
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;

  // Borders and dividers - Enhanced system
  border: string;
  borderLight: string;
  borderMedium: string;
  divider: string;

  // Overlay/transparency - Premium transparency
  overlay: string;
  overlayMedium: string;
  overlayStrong: string;

  // Gradients - Premium gradients
  gradientPrimary: [string, string];
  gradientSecondary: [string, string];
  gradientSurface: [string, string];
}

/**
 * Typography configuration
 * Premium typography system with enhanced options
 */
export interface TypographyConfig {
  // Font families
  fonts: {
    regular: string;
    medium: string;
    semiBold: string;
    bold: string;
  };

  // Font sizes (points) - Expanded scale
  sizes: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    xxxxl: number;
  };

  // Line heights (multipliers of font size) - Enhanced options
  lineHeights: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };

  // Font weights - Enhanced weights
  weights: {
    regular: '400';
    medium: '500';
    semiBold: '600';
    bold: '700';
    extraBold: '800';
  };

  // Letter spacing for enhanced typography
  letterSpacing: {
    tighter: number;
    tight: number;
    normal: number;
    wide: number;
    wider: number;
    widest: number;
  };
}

/**
 * Spacing configuration
 * Premium 4px grid system with expanded scale
 */
export interface SpacingConfig {
  xs: number; // 2px
  sm: number; // 4px
  md: number; // 8px
  lg: number; // 12px
  xl: number; // 16px
  xxl: number; // 24px
  xxxl: number; // 32px
  xxxxl: number; // 48px

  // Semantic spacing for common patterns
  gap?: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };

  // Component-specific spacing
  component?: {
    padding?: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    margin?: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
  };
}

/**
 * Border Radius configuration
 * Premium border radius system with enhanced options
 */
export interface BorderRadiusConfig {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  full: number;

  // Semantic radius for common patterns
  button?: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  card?: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  avatar?: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

/**
 * Complete Theme Configuration
 * Premium theme system with enhanced capabilities
 */
export interface ThemeConfig {
  variant: ThemeVariant;
  colors: ColorPalette;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  borderRadius: BorderRadiusConfig;
  shadows: {
    subtle: {
      offset: { width: 0; height: 1 };
      blur: 2;
      spread: 0;
      color: 'rgba(0, 0, 0, 0.05)';
    };
    light: {
      offset: { width: 0; height: 2 };
      blur: 4;
      spread: 0;
      color: 'rgba(0, 0, 0, 0.08)';
    };
    medium: {
      offset: { width: 0; height: 4 };
      blur: 8;
      spread: 0;
      color: 'rgba(0, 0, 0, 0.12)';
    };
    strong: {
      offset: { width: 0; height: 8 };
      blur: 16;
      spread: 0;
      color: 'rgba(0, 0, 0, 0.15)';
    };
    heavy: {
      offset: { width: 0; height: 12 };
      blur: 24;
      spread: 0;
      color: 'rgba(0, 0, 0, 0.25)';
    };
    primary: {
      offset: { width: 0; height: 4 };
      blur: 8;
      spread: 0;
      color: 'rgba(0, 102, 255, 0.2)';
    };
    accent: {
      offset: { width: 0; height: 4 };
      blur: 8;
      spread: 0;
      color: 'rgba(245, 158, 11, 0.2)';
    };
  };
  animations: {
    spring: {
      tension: number;
      friction: number;
    };
    timing: {
      duration: number;
    };
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
