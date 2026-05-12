/**
 * Premium Repository List Item
 *
 * Modern card design with:
 * - Enhanced visual hierarchy
 * - Smooth hover animations
 * - Professional typography
 * - Premium shadows and borders
 * - Interactive favorite button
 * - Beautiful metadata display
 *
 * Inspired by Linear, Notion, and modern card layouts
 */

import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { useTheme } from '../../../hooks/useTheme';
import type { RepositoryEntity } from '../../../store/slices/repositories/types';

interface RepositoryListItemProps {
  repository: RepositoryEntity;
  isFavorite: boolean;
  onPress: (repository: RepositoryEntity) => void;
  onToggleFavorite: (repositoryId: string) => void;
}

const formatCount = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return `${value}`;
};

const RepositoryListItemComponent: React.FC<RepositoryListItemProps> = ({
  repository,
  isFavorite,
  onPress,
  onToggleFavorite,
}) => {
  const { theme } = useTheme();

  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const favoriteScaleAnim = React.useRef(new Animated.Value(1)).current;

  // Handle press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      damping: 20,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 20,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  // Handle favorite animation
  const handleFavoritePress = () => {
    Animated.sequence([
      Animated.timing(favoriteScaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(favoriteScaleAnim, {
        toValue: 1,
        damping: 20,
        stiffness: 300,
        useNativeDriver: true,
      }),
    ]).start();

    onToggleFavorite(repository.id.toString());
  };

  const cardAnimatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  const favoriteAnimatedStyle = {
    transform: [{ scale: favoriteScaleAnim }],
  };

  return (
    <Animated.View style={cardAnimatedStyle}>
      <Pressable
        onPress={() => onPress(repository)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderLight,
            shadowColor: theme.colors.border,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 6,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${repository.full_name} repository`}
      >
        {/* Header with title and favorite */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              {repository.full_name}
            </Text>
            {repository.language && (
              <View style={[styles.languageBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.languageText, { color: theme.colors.primary }]}>
                  {repository.language}
                </Text>
              </View>
            )}
          </View>

          <Animated.View style={favoriteAnimatedStyle}>
            <Pressable
              onPress={handleFavoritePress}
              hitSlop={12}
              style={[
                styles.favoriteButton,
                {
                  backgroundColor: isFavorite ? theme.colors.accentLight : 'transparent',
                  borderColor: isFavorite ? theme.colors.accent : theme.colors.borderLight,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Icon
                name={isFavorite ? 'star' : 'star'}
                size={16}
                color={isFavorite ? theme.colors.accent : theme.colors.textQuaternary}
              />
            </Pressable>
          </Animated.View>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {repository.description || 'No description available.'}
        </Text>

        {/* Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metaItem}>
            <Icon name="star" size={14} color={theme.colors.textTertiary} />
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              {formatCount(repository.stargazers_count)}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Icon name="git-branch" size={14} color={theme.colors.textTertiary} />
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              {formatCount(repository.forks_count)}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Icon name="eye" size={14} color={theme.colors.textTertiary} />
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              {formatCount(repository.watchers_count || 0)}
            </Text>
          </View>

          {repository.updated_at && (
            <View style={styles.metaItem}>
              <Icon name="clock" size={14} color={theme.colors.textTertiary} />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                Updated {new Date(repository.updated_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Action indicator */}
        <View style={styles.actionIndicator}>
          <Icon name="chevron-right" size={16} color={theme.colors.textQuaternary} />
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const RepositoryListItem = memo(RepositoryListItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.repository.id === nextProps.repository.id &&
    prevProps.repository.full_name === nextProps.repository.full_name &&
    prevProps.repository.description === nextProps.repository.description &&
    prevProps.repository.stargazers_count === nextProps.repository.stargazers_count &&
    prevProps.repository.forks_count === nextProps.repository.forks_count &&
    prevProps.repository.language === nextProps.repository.language &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.onToggleFavorite === nextProps.onToggleFavorite
  );
});

// ============================================================================
// PREMIUM STYLES
// ============================================================================

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      position: 'relative',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    titleContainer: {
      flex: 1,
      marginRight: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    title: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.semiBold as any,
      lineHeight: theme.typography.lineHeights.tight * theme.typography.sizes.lg,
    },
    languageBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    languageText: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.semiBold as any,
      textTransform: 'uppercase',
      letterSpacing: theme.typography.letterSpacing.wide,
    },
    favoriteButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
    },
    description: {
      fontSize: theme.typography.sizes.base,
      lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.base,
      marginBottom: theme.spacing.md,
    },
    metadata: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.lg,
      alignItems: 'center',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    metaText: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium as any,
    },
    actionIndicator: {
      position: 'absolute',
      top: theme.spacing.lg,
      right: theme.spacing.lg,
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
