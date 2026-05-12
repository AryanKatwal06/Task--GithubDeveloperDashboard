/**
 * Theme Utilities
 *
 * Helper functions for creating themed styles and working with theme values.
 * Provides common styling patterns used across the app.
 */

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import type { ThemeConfig } from '../types/theme';

// Type for all style types
export type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Create themed stylesheets
 *
 * USAGE:
 * const styles = createThemedStyles((theme) => ({
 *   container: {
 *     flex: 1,
 *     backgroundColor: theme.colors.background,
 *   },
 * }));
 *
 * WHY:
 * - Ensures styles are created with current theme
 * - Returns actual StyleSheet (performance optimized)
 * - Type-safe theme access
 */
export const createThemedStyles = <T extends NamedStyles<T>>(
  styleCreator: (theme: ThemeConfig) => T,
  theme: ThemeConfig
): T => {
  const styles = styleCreator(theme);
  // Use StyleSheet.create for production optimization
  // This flattens styles and validates them at creation time
  return StyleSheet.create(styles) as T;
};

/**
 * Common flex utility styles
 * Reduces repetition for common flexbox patterns
 */
export const flexUtils = {
  flex: {
    flex: 1,
  },
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexBetween: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
} as const;

/**
 * Semantic spacing combinations
 *
 * USAGE:
 * <View style={[styles.container, spacingUtils.horizontalPadding('lg')]} />
 */
export const createSpacingUtils = (spacing: ThemeConfig['spacing']) => ({
  horizontalPadding: (
    size: keyof Pick<typeof spacing, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'xxxxl'>
  ): ViewStyle => ({
    paddingHorizontal: spacing[size],
  }),
  verticalPadding: (
    size: keyof Pick<typeof spacing, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'xxxxl'>
  ): ViewStyle => ({
    paddingVertical: spacing[size],
  }),
  padding: (
    size: keyof Pick<typeof spacing, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'xxxxl'>
  ): ViewStyle => ({
    padding: spacing[size],
  }),
  horizontalMargin: (
    size: keyof Pick<typeof spacing, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'xxxxl'>
  ): ViewStyle => ({
    marginHorizontal: spacing[size],
  }),
  verticalMargin: (
    size: keyof Pick<typeof spacing, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'xxxxl'>
  ): ViewStyle => ({
    marginVertical: spacing[size],
  }),
  margin: (
    size: keyof Pick<typeof spacing, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'xxxxl'>
  ): ViewStyle => ({
    margin: spacing[size],
  }),
  gap: (
    size: keyof Pick<typeof spacing, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'xxxxl'>
  ): ViewStyle => ({
    gap: spacing[size],
  }),
});

/**
 * Opacity helper for creating disabled states
 */
export const getOpacityStyle = (opacity: number): ViewStyle => ({
  opacity,
});

/**
 * Create shadow style from theme
 *
 * USAGE:
 * style={[styles.card, getShadowStyle(theme, 'medium')]}
 *
 * Different platforms handle shadows differently:
 * - iOS: shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * - Android: elevation (simplified)
 */
export const getShadowStyle = (shadowValue: string, isAndroid: boolean = false): ViewStyle => {
  if (isAndroid) {
    // Android uses elevation (0-24 scale)
    // Map shadow intensity to elevation value
    return { elevation: shadowValue === 'large' ? 12 : shadowValue === 'medium' ? 6 : 2 };
  }

  // iOS uses explicit shadow properties
  // Parse shadow string and extract values
  // For now, use elevation which works cross-platform
  return { elevation: shadowValue === 'large' ? 12 : shadowValue === 'medium' ? 6 : 2 };
};
