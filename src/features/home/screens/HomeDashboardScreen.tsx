/**
 * Premium Home Dashboard Screen
 *
 * Modern dashboard with:
 * - Beautiful gradient hero section
 * - Animated stat cards with micro-interactions
 * - Premium repository cards with hover effects
 * - Smooth scrolling and transitions
 * - Enhanced visual hierarchy
 * - Professional typography
 *
 * Inspired by Linear, Notion, and modern dashboard apps
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../../../components/icons/Icon';
import { LinearGradient } from 'react-native-linear-gradient';

import { useTheme } from '../../../hooks/useTheme';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { getCacheDebugInfo } from '../../../services/database/cacheSyncMiddleware';
import {
  selectFavoriteRepositories,
  selectSearchResults,
  selectAllRepositories,
} from '../../../store/slices/repositories/selectors';
import { hydrateSearchSession } from '../../../store/slices/repositories';
import type { HomeStackScreenProps } from '../../../types/navigation';

export const HomeDashboardScreen: React.FC<HomeStackScreenProps<'HomeDashboard'>> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const repositories = useAppSelector(selectSearchResults);
  const favoriteRepositories = useAppSelector(selectFavoriteRepositories);
  const allRepositories = useAppSelector(selectAllRepositories);
  const dispatch = useAppDispatch();
  const [cachedRepositoryCount, setCachedRepositoryCount] = useState(0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const statScaleAnim = useRef(new Animated.Value(0.8)).current;

  // Entrance animations
  useEffect(() => {
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    });

    const slideUp = Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    });

    const scaleStats = Animated.spring(statScaleAnim, {
      toValue: 1,
      damping: 20,
      stiffness: 300,
      useNativeDriver: true,
    });

    Animated.sequence([Animated.parallel([fadeIn, slideUp]), scaleStats]).start();
  }, [fadeAnim, slideAnim, statScaleAnim]);

  // Update cache info whenever screen focuses
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      void getCacheDebugInfo().then((info) => {
        if (mounted) {
          setCachedRepositoryCount(info.repositoriesCount);
        }
      });

      return () => {
        mounted = false;
      };
    }, [])
  );

  // Also update cache info when repositories are loaded (after search/trending)
  useEffect(() => {
    let mounted = true;

    void getCacheDebugInfo().then((info) => {
      if (mounted) {
        setCachedRepositoryCount(info.repositoriesCount);
      }
    });

    return () => {
      mounted = false;
    };
  }, [repositories.length]); // Re-run when search results count changes

  // Animated stat card component
  const AnimatedStatCard = ({
    children,
    delay = 0,
  }: {
    children: React.ReactNode;
    delay?: number;
  }) => {
    const scaleValue = useRef(new Animated.Value(0.8)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.spring(scaleValue, {
            toValue: 1,
            damping: 20,
            stiffness: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, delay);

      return () => clearTimeout(timer);
    }, [delay, scaleValue, opacityValue]);

    const animatedStyle = {
      transform: [{ scale: scaleValue }],
      opacity: opacityValue,
    };

    return <Animated.View style={[animatedStyle, styles.statCard]}>{children}</Animated.View>;
  };

  // Animated repository card
  const AnimatedRepoCard = ({ repository, index }: { repository: any; index: number }) => {
    const scaleValue = useRef(new Animated.Value(0.95)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const timer = setTimeout(
        () => {
          Animated.parallel([
            Animated.spring(scaleValue, {
              toValue: 1,
              damping: 20,
              stiffness: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacityValue, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
        },
        800 + index * 100
      );

      return () => clearTimeout(timer);
    }, [index, scaleValue, opacityValue]);

    const animatedStyle = {
      transform: [{ scale: scaleValue }],
      opacity: opacityValue,
    };

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={() => {
            const [owner, name] = repository.full_name.split('/');
            navigation.navigate('RepositoryDetails', {
              id: repository.id.toString(),
              owner,
              name,
            });
          }}
          style={[
            styles.repoCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderLight,
              shadowColor: theme.colors.border,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            },
          ]}
        >
          <View style={styles.repoHeader}>
            <Text style={[styles.repoName, { color: theme.colors.text }]} numberOfLines={1}>
              {repository.full_name}
            </Text>
            <Icon name="chevron-right" size={16} color={theme.colors.textQuaternary} />
          </View>
          <Text
            style={[styles.repoDescription, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {repository.description || 'No description available.'}
          </Text>
          <View style={styles.repoMeta}>
            <View style={styles.metaItem}>
              <Icon name="star" size={12} color={theme.colors.textTertiary} />
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                {repository.stargazers_count}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="git-branch" size={12} color={theme.colors.textTertiary} />
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                {repository.forks_count}
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Premium Hero Section with Gradient */}
      <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={theme.colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroGradient, { borderRadius: theme.borderRadius.xl }]}
        >
          <View style={styles.heroContent}>
            <Text style={[styles.kicker, { color: theme.colors.textInverted }]}>
              GitHub Developer Dashboard
            </Text>
            <Animated.Text
              style={[
                styles.title,
                { color: theme.colors.textInverted, transform: [{ translateY: slideAnim }] },
              ]}
            >
              Current state at a glance
            </Animated.Text>
            <Text style={[styles.subtitle, { color: theme.colors.textInverted }]}>
              Cached repository data is restored on launch and refreshed from the network when
              available.
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Animated Stats Section */}
      <Animated.View style={[styles.statsSection, { transform: [{ scale: statScaleAnim }] }]}>
        <AnimatedStatCard delay={200}>
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.primaryLight }]}>
              <Icon name="package" size={20} color={theme.colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {cachedRepositoryCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Cached repos
            </Text>
          </View>
        </AnimatedStatCard>

        <AnimatedStatCard delay={400}>
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.accentLight }]}>
              <Icon name="star" size={20} color={theme.colors.accent} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {favoriteRepositories.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Favorites</Text>
          </View>
        </AnimatedStatCard>
      </Animated.View>

      {/* Recent Repositories Section */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recently loaded</Text>
          <Pressable
            onPress={() => {
              // Hydrate search session with all cached repositories so "See all" shows everything
              try {
                const ids = allRepositories.map((r) => r.id.toString());
                if (ids.length > 0) {
                  dispatch(hydrateSearchSession({ repositoryIds: ids }));
                }
              } catch {
                // ignore dispatch errors -- fallback to default navigation behavior
              }

              // Navigate to RepositoriesStack tab first, then to RepositoriesSearch screen
              navigation.navigate('RepositoriesStack' as any, { screen: 'RepositoriesSearch' });
            }}
            style={styles.seeAllButton}
          >
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See all</Text>
            <Icon name="arrow-right" size={14} color={theme.colors.primary} />
          </Pressable>
        </View>

        {repositories.slice(0, 3).map((repository, index) => (
          <AnimatedRepoCard key={repository.id} repository={repository} index={index} />
        ))}
      </View>
    </ScrollView>
  );
};

// ============================================================================
// PREMIUM STYLES
// ============================================================================

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.xl,
      paddingBottom: theme.spacing.xxxl,
    },

    // Hero Section
    heroSection: {
      marginBottom: theme.spacing.xxxl,
    },
    heroGradient: {
      padding: theme.spacing.xxxl,
      minHeight: 180,
      justifyContent: 'center',
    },
    heroContent: {
      gap: theme.spacing.sm,
    },
    kicker: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.extraBold as any,
      textTransform: 'uppercase',
      letterSpacing: theme.typography.letterSpacing.wider,
      opacity: 0.9,
    },
    title: {
      fontSize: theme.typography.sizes.xxxl,
      fontWeight: theme.typography.weights.extraBold as any,
      lineHeight: theme.typography.lineHeights.tight * theme.typography.sizes.xxxl,
    },
    subtitle: {
      fontSize: theme.typography.sizes.base,
      lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.base,
      opacity: 0.8,
      marginTop: theme.spacing.sm,
    },

    // Stats Section
    statsSection: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.xxxl,
    },
    statCard: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    statContent: {
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    statIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statValue: {
      fontSize: theme.typography.sizes.xxl,
      fontWeight: theme.typography.weights.extraBold as any,
    },
    statLabel: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.semiBold as any,
      textTransform: 'uppercase',
      letterSpacing: theme.typography.letterSpacing.wide,
    },

    // Recent Section
    recentSection: {
      gap: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.bold as any,
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    seeAllText: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.semiBold as any,
    },

    // Repository Cards
    repoCard: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
    },
    repoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    repoName: {
      flex: 1,
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.semiBold as any,
      marginRight: theme.spacing.sm,
    },
    repoDescription: {
      fontSize: theme.typography.sizes.base,
      lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.base,
      marginBottom: theme.spacing.md,
    },
    repoMeta: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
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
