/**
 * Premium Screen States
 *
 * Modern loading and empty states with:
 * - Beautiful skeleton loaders
 * - Elegant empty states
 * - Smooth animations
 * - Professional design
 * - Enhanced visual hierarchy
 *
 * Inspired by Linear, Notion, and modern loading patterns
 */

import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'react-native-linear-gradient';

import { useTheme } from '../../hooks/useTheme';

interface LoadingStateProps {
  label?: string;
}

interface EmptyStateProps {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ErrorStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

// ============================================================================
// PREMIUM SKELETON LOADER
// ============================================================================

interface SkeletonLoaderProps {
  label?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ label = 'Loading content' }) => {
  const { theme } = useTheme();

  // Animation values
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0.3)).current;

  // Shimmer animation
  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    // Fade in effect
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [shimmerAnim, opacityAnim]);

  const shimmerStyle = {
    transform: [
      {
        translateX: shimmerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 100],
        }),
      },
    ],
  };

  return (
    <View style={styles.skeletonContainer}>
      {/* Skeleton Cards */}
      <Animated.View
        style={[
          styles.skeletonCard,
          {
            opacity: opacityAnim,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderLight,
          },
        ]}
      >
        <View style={styles.skeletonHeader}>
          <View
            style={[
              styles.skeletonTitle,
              {
                backgroundColor: theme.colors.borderLight,
              },
            ]}
          />
          <View
            style={[
              styles.skeletonBadge,
              {
                backgroundColor: theme.colors.borderLight,
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.skeletonLine,
            {
              backgroundColor: theme.colors.borderLight,
            },
          ]}
        />
        <View
          style={[
            styles.skeletonLine,
            {
              backgroundColor: theme.colors.borderLight,
              width: '60%',
            },
          ]}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.skeletonCard,
          {
            opacity: opacityAnim,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderLight,
          },
        ]}
      >
        <View style={styles.skeletonHeader}>
          <View
            style={[
              styles.skeletonTitle,
              {
                backgroundColor: theme.colors.borderLight,
              },
            ]}
          />
          <View
            style={[
              styles.skeletonBadge,
              {
                backgroundColor: theme.colors.borderLight,
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.skeletonLine,
            {
              backgroundColor: theme.colors.borderLight,
            },
          ]}
        />
        <View
          style={[
            styles.skeletonLine,
            {
              backgroundColor: theme.colors.borderLight,
              width: '75%',
            },
          ]}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.skeletonCard,
          {
            opacity: opacityAnim,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderLight,
          },
        ]}
      >
        <View style={styles.skeletonHeader}>
          <View
            style={[
              styles.skeletonTitle,
              {
                backgroundColor: theme.colors.borderLight,
              },
            ]}
          />
          <View
            style={[
              styles.skeletonBadge,
              {
                backgroundColor: theme.colors.borderLight,
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.skeletonLine,
            {
              backgroundColor: theme.colors.borderLight,
            },
          ]}
        />
        <View
          style={[
            styles.skeletonLine,
            {
              backgroundColor: theme.colors.borderLight,
              width: '45%',
            },
          ]}
        />
      </Animated.View>

      {/* Shimmer overlay */}
      <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>

      {/* Loading text */}
      <View style={styles.loadingTextContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>{label}</Text>
      </View>
    </View>
  );
};

export const LoadingState: React.FC<LoadingStateProps> = ({ label = 'Loading content' }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.centered} accessibilityRole="progressbar" accessibilityLabel={label}>
      <View
        style={[
          styles.loadingBox,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderLight,
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.loadingSubtitle, { color: theme.colors.textSecondary }]}>
          Please wait while we fetch the latest data...
        </Text>
      </View>
    </View>
  );
};

export const EmptyState: React.FC<EmptyStateProps> = ({ title, body, actionLabel, onAction }) => {
  const { theme } = useTheme();

  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  // Entrance animation
  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 20,
        stiffness: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  return (
    <Animated.View style={[styles.centered, animatedStyle]} accessibilityRole="summary">
      <LinearGradient
        colors={theme.colors.gradientSurface}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.emptyBox,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderLight,
          },
        ]}
      >
        <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primaryLight }]}>
          <Icon name="package" size={48} color={theme.colors.textQuaternary} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>{body}</Text>

        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            style={[
              styles.emptyButton,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={[styles.emptyButtonText, { color: theme.colors.textInverted }]}>
              {actionLabel}
            </Text>
            <Icon name="arrow-right" size={14} color={theme.colors.textInverted} />
          </Pressable>
        ) : null}
      </LinearGradient>
    </Animated.View>
  );
};

export const ErrorState: React.FC<ErrorStateProps> = ({ message, actionLabel, onAction }) => {
  const { theme } = useTheme();

  // Animation values
  const shakeAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  // Shake animation on mount
  React.useEffect(() => {
    const shakeAnimation = Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]);

    shakeAnimation.start();

    // Fade in effect
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [shakeAnim, opacityAnim]);

  const animatedStyle = {
    transform: [{ translateX: shakeAnim }],
    opacity: opacityAnim,
  };

  return (
    <Animated.View
      style={[
        styles.errorContainer,
        animatedStyle,
        {
          backgroundColor: theme.colors.errorLight,
          borderColor: theme.colors.error,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.errorContent}>
        <View style={[styles.errorIconContainer, { backgroundColor: theme.colors.errorLight }]}>
          <Icon name="alert-circle" size={24} color={theme.colors.error} />
        </View>
        <View style={styles.errorTextContainer}>
          <Text style={[styles.errorTitle, { color: theme.colors.error }]}>
            Something went wrong
          </Text>
          <Text style={[styles.errorBody, { color: theme.colors.textSecondary }]}>{message}</Text>
        </View>
      </View>

      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={[
            styles.retryButton,
            {
              backgroundColor: theme.colors.error,
              shadowColor: theme.colors.error,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 2,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Icon name="refresh-cw" size={14} color={theme.colors.textInverted} />
          <Text style={[styles.retryText, { color: theme.colors.textInverted }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

// ============================================================================
// PREMIUM STYLES
// ============================================================================

const createStyles = (theme: any) =>
  StyleSheet.create({
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxxl,
      paddingHorizontal: theme.spacing.lg,
    },

    // Skeleton Loader Styles
    skeletonContainer: {
      width: '100%',
      position: 'relative',
    },
    skeletonCard: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      overflow: 'hidden',
    },
    skeletonHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    skeletonTitle: {
      height: 20,
      borderRadius: theme.borderRadius.sm,
      width: '60%',
    },
    skeletonBadge: {
      height: 20,
      borderRadius: theme.borderRadius.sm,
      width: 60,
    },
    skeletonLine: {
      height: 12,
      borderRadius: theme.borderRadius.sm,
      width: '100%',
      marginBottom: theme.spacing.sm,
    },
    shimmerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    shimmerGradient: {
      flex: 1,
      height: '100%',
    },
    loadingTextContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    loadingText: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium as any,
    },

    // Loading State Styles
    loadingBox: {
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xxxl,
      alignItems: 'center',
      borderWidth: 1,
      gap: theme.spacing.lg,
      minWidth: 280,
    },
    loadingTitle: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.bold as any,
      textAlign: 'center',
    },
    loadingSubtitle: {
      fontSize: theme.typography.sizes.base,
      textAlign: 'center',
      lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.base,
    },

    // Empty State Styles
    emptyBox: {
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xxxl,
      alignItems: 'center',
      borderWidth: 1,
      gap: theme.spacing.lg,
      minWidth: 320,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    emptyTitle: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.bold as any,
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: theme.typography.sizes.base,
      textAlign: 'center',
      lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.base,
      marginBottom: theme.spacing.lg,
    },
    emptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    emptyButtonText: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.semiBold as any,
    },

    // Error State Styles
    errorContainer: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      marginBottom: theme.spacing.md,
    },
    errorContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    errorIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorTextContainer: {
      flex: 1,
    },
    errorTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold as any,
      marginBottom: theme.spacing.xs,
    },
    errorBody: {
      fontSize: theme.typography.sizes.base,
      lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.base,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
      alignSelf: 'flex-start',
    },
    retryText: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.semiBold as any,
    },
  });

const styles = createStyles({
  spacing: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 24, xxxl: 32 },
  typography: {
    sizes: { xs: 11, sm: 13, base: 15, lg: 17, xl: 20, xxl: 24, xxxl: 32 },
    weights: { regular: '400', medium: '500', semiBold: '600', bold: '700', extraBold: '800' },
    letterSpacing: { tight: -0.5, normal: 0, wide: 0.5, wider: 1 },
    lineHeights: { tight: 1.2, normal: 1.4, relaxed: 1.6, loose: 1.8 },
  },
  borderRadius: { xs: 2, sm: 6, md: 10, lg: 14, xl: 18, xxl: 24, full: 9999 },
});
