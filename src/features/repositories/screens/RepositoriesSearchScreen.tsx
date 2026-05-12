/**
 * Premium Repository Search Screen
 *
 * Modern search experience with:
 * - Animated search bar with focus states
 * - Fluid list animations
 * - Premium card layouts
 * - Enhanced micro-interactions
 * - Beautiful loading states
 * - Smooth transitions
 *
 * Inspired by Linear, Notion, and modern search interfaces
 */

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
} from 'react-native';
import { Icon } from '../../../components/icons/Icon';

import type { RepositoriesStackScreenProps } from '../../../types/navigation';
import { useTheme } from '../../../hooks/useTheme';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { searchRepositories, getTrendingRepositories } from '../../../store/slices/repositories';
import {
  selectErrorMessage,
  selectFavoriteLookup,
  selectIsLoading,
  selectSearchPagination,
  selectSearchResults,
} from '../../../store/slices/repositories/selectors';
import { toggleFavorite, clearSearch } from '../../../store/slices/repositories/slice';
import { RepositoryRepository } from '../../../services/database';
import { networkStateManager } from '../../../services';
import { hydrateSearchSession } from '../../../store/slices/repositories';
import type { RepositoryEntity } from '../../../store/slices/repositories/types';
import { RepositoryListItem } from '../components/RepositoryListItem';

const DEFAULT_PER_PAGE = 20;
const LIST_ITEM_HEIGHT = 120;
const LIST_SEPARATOR_HEIGHT = 16;
const LIST_ROW_HEIGHT = LIST_ITEM_HEIGHT + LIST_SEPARATOR_HEIGHT;

// Animated search bar component - moved outside to prevent re-renders
interface AnimatedSearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  searchAnim: Animated.Value;
  theme: any;
  handleSubmitSearch: () => void;
}

const AnimatedSearchBar: React.FC<AnimatedSearchBarProps> = ({
  query,
  setQuery,
  isSearchFocused,
  setIsSearchFocused,
  searchAnim,
  theme,
  handleSubmitSearch,
}) => {
  const animatedStyle = {
    transform: [{ scale: searchAnim }],
    shadowColor: theme.colors.border,
    shadowOffset: { width: 0, height: isSearchFocused ? 8 : 4 },
    shadowOpacity: isSearchFocused ? 0.15 : 0.08,
    shadowRadius: isSearchFocused ? 16 : 8,
    elevation: isSearchFocused ? 8 : 4,
  };

  return (
    <Animated.View style={[styles.searchContainer, animatedStyle]}>
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isSearchFocused ? theme.colors.primary : theme.colors.borderLight,
          },
        ]}
      >
        <Icon
          name="search"
          size={20}
          color={isSearchFocused ? theme.colors.primary : theme.colors.textTertiary}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Search repositories..."
          placeholderTextColor={theme.colors.textQuaternary}
          style={[styles.input, { color: theme.colors.text }]}
          returnKeyType="search"
          onSubmitEditing={handleSubmitSearch}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Repository search input"
          accessibilityHint="Enter keywords, then submit search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} style={styles.clearButton}>
            <Icon name="x" size={18} color={theme.colors.textTertiary} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

export const RepositoriesSearchScreen: React.FC<
  RepositoriesStackScreenProps<'RepositoriesSearch'>
> = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  const repositories = useAppSelector(selectSearchResults);
  const pagination = useAppSelector(selectSearchPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const errorMessage = useAppSelector(selectErrorMessage);
  const favoriteLookup = useAppSelector(selectFavoriteLookup);

  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Animation values
  const searchAnim = useRef(new Animated.Value(1)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  // Search focus animation
  useEffect(() => {
    Animated.spring(searchAnim, {
      toValue: isSearchFocused ? 1.02 : 1,
      damping: 20,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  }, [isSearchFocused, searchAnim]);

  // List entrance animation
  useEffect(() => {
    if (repositories.length > 0) {
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [repositories.length, listAnim]);

  useEffect(() => {
    void dispatch(getTrendingRepositories({ perPage: DEFAULT_PER_PAGE }));
  }, [dispatch]);

  // Fallback: when offline and no repositories loaded, hydrate from local cache
  useEffect(() => {
    let mounted = true;

    const tryLoadCached = async () => {
      try {
        if (networkStateManager.isOnline()) return;
        if (!mounted) return;

        const cached = await RepositoryRepository.getRecent(500);
        if (!cached || cached.length === 0) return;

        // Parse github_data and convert to RepositoryEntity shape
        const parsedRepos: any[] = cached
          .map((row) => {
            try {
              return JSON.parse(row.github_data);
            } catch {
              return null;
            }
          })
          .filter(Boolean);

        if (parsedRepos.length === 0) return;

        // If we already have at least as many repositories as are cached, skip hydrate
        if (repositories.length >= parsedRepos.length) return;

        const entities = parsedRepos.map((r) => ({ ...r, ownerId: r.owner?.id ?? 0 }));
        const ids = entities.map((e) => e.id.toString());

        // Hydrate redux with entities and a search session that contains all cached ids
        dispatch(hydrateSearchSession({ repositoryIds: ids, repositories: entities }));
      } catch {
        // ignore fallback errors
      }
    };

    void tryLoadCached();

    return () => {
      mounted = false;
    };
  }, [dispatch, repositories.length]);

  const isSearching = activeQuery.length > 0;
  const hasMore = pagination?.hasMore ?? false;

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    Keyboard.dismiss();
    setActiveQuery(trimmed);
    await dispatch(
      searchRepositories({
        query: trimmed,
        page: 1,
        perPage: DEFAULT_PER_PAGE,
      })
    );
  }, [dispatch, query]);

  const handleSubmitSearch = useCallback(() => {
    void handleSearch();
  }, [handleSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setActiveQuery('');
    dispatch(clearSearch());
    void dispatch(getTrendingRepositories({ perPage: DEFAULT_PER_PAGE }));
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    if (isSearching && activeQuery) {
      await dispatch(
        searchRepositories({ query: activeQuery, page: 1, perPage: DEFAULT_PER_PAGE })
      );
    } else {
      await dispatch(getTrendingRepositories({ perPage: DEFAULT_PER_PAGE }));
    }

    setRefreshing(false);
  }, [activeQuery, dispatch, isSearching]);

  const handleLoadMore = useCallback(async () => {
    if (!isSearching || !activeQuery || !hasMore || isLoading || !pagination) {
      return;
    }

    await dispatch(
      searchRepositories({
        query: activeQuery,
        page: pagination.currentPage + 1,
        perPage: pagination.pageSize,
      })
    );
  }, [activeQuery, dispatch, hasMore, isLoading, isSearching, pagination]);

  const handlePressItem = useCallback(
    (repository: RepositoryEntity) => {
      const [owner, name] = repository.full_name.split('/');
      navigation.navigate('RepositoryDetail' as any, {
        id: repository.id.toString(),
        owner,
        name,
      });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<RepositoryEntity>) => (
      <RepositoryListItem
        repository={item}
        isFavorite={Boolean(favoriteLookup[item.id.toString()])}
        onPress={handlePressItem}
        onToggleFavorite={(repositoryId) => {
          dispatch(toggleFavorite(repositoryId));
        }}
      />
    ),
    [dispatch, favoriteLookup, handlePressItem]
  );

  const keyExtractor = useCallback((item: RepositoryEntity) => item.id.toString(), []);
  const getItemLayout = useCallback(
    (_data: unknown, index: number) => ({
      length: LIST_ROW_HEIGHT,
      offset: LIST_ROW_HEIGHT * index,
      index,
    }),
    []
  );

  const renderSeparator = useCallback(() => <View style={styles.separator} />, []);

  const handleLoadMoreRequest = useCallback(() => {
    void handleLoadMore();
  }, [handleLoadMore]);

  const handleRefreshRequest = useCallback(() => {
    void handleRefresh();
  }, [handleRefresh]);

  const handleRetry = useCallback(() => {
    if (isSearching && activeQuery) {
      void dispatch(searchRepositories({ query: activeQuery, page: 1, perPage: DEFAULT_PER_PAGE }));
      return;
    }

    void dispatch(getTrendingRepositories({ perPage: DEFAULT_PER_PAGE }));
  }, [activeQuery, dispatch, isSearching]);

  const listFooter = useMemo(() => {
    if (!isLoading || !repositories.length) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [isLoading, repositories.length, theme.colors.primary]);

  const headline = isSearching ? `Results for "${activeQuery}"` : 'Trending repositories';

  const isOffline = !networkStateManager.isOnline();
  const showCacheBanner = isOffline && repositories.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Premium Search Section */}
      <View style={styles.searchSection}>
        <Text style={[styles.screenTitle, { color: theme.colors.text }]}>
          Discover Repositories
        </Text>
        <Text style={[styles.screenSubtitle, { color: theme.colors.textSecondary }]}>
          Explore trending projects and search for repositories
        </Text>

        <AnimatedSearchBar
          query={query}
          setQuery={setQuery}
          isSearchFocused={isSearchFocused}
          setIsSearchFocused={setIsSearchFocused}
          searchAnim={searchAnim}
          theme={theme}
          handleSubmitSearch={handleSubmitSearch}
        />

        <View style={styles.headerRow}>
          <Text style={[styles.headline, { color: theme.colors.text }]}>{headline}</Text>
          {isSearching && (
            <Pressable
              onPress={handleClear}
              style={styles.resetButton}
              accessibilityRole="button"
              accessibilityLabel="Reset current search and load trending repositories"
            >
              <Icon name="x" size={16} color={theme.colors.primary} />
              <Text style={[styles.resetText, { color: theme.colors.primary }]}>Clear</Text>
            </Pressable>
          )}
        </View>

        {showCacheBanner && (
          <View
            style={[
              styles.cacheBanner,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight },
            ]}
          >
            <Icon name="package" size={14} color={theme.colors.primary} />
            <Text style={[styles.cacheBannerText, { color: theme.colors.textSecondary }]}>
              Showing cached results (offline)
            </Text>
          </View>
        )}
      </View>

      {/* Debug banner: shows counts/loading/error for quick diagnostics */}
      <View
        style={{
          paddingHorizontal: 24,
          marginBottom: 8,
        }}
      >
        <View
          style={{
            borderRadius: 8,
            padding: 8,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
            flexDirection: 'row',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: theme.colors.textSecondary }}>Repos:</Text>
          <Text style={{ color: theme.colors.text }}>{repositories.length}</Text>
          <Text style={{ color: theme.colors.textSecondary, marginLeft: 12 }}>Loading:</Text>
          <Text style={{ color: theme.colors.text }}>{isLoading ? 'yes' : 'no'}</Text>
          <Text style={{ color: theme.colors.textSecondary, marginLeft: 12 }}>Error:</Text>
          <Text style={{ color: theme.colors.error }}>{errorMessage || 'none'}</Text>
        </View>
      </View>

      {/* Error State */}
      {errorMessage && !isOffline ? (
        <View style={styles.errorContainer}>
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: theme.colors.errorLight,
                borderColor: theme.colors.error,
              },
            ]}
          >
            <Icon name="alert-circle" size={20} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{errorMessage}</Text>
            <Pressable
              onPress={handleRetry}
              style={[
                styles.retryButton,
                {
                  backgroundColor: theme.colors.error,
                },
              ]}
            >
              <Text style={[styles.retryText, { color: theme.colors.textInverted }]}>Retry</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Repository List */}
      <Animated.FlatList
        data={repositories}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={11}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={[styles.listContent, { opacity: listAnim }]}
        ItemSeparatorComponent={renderSeparator}
        onEndReachedThreshold={0.4}
        onEndReached={handleLoadMoreRequest}
        ListFooterComponent={listFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefreshRequest}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Searching repositories...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyBox,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.borderLight,
                  },
                ]}
              >
                <Icon name="package" size={48} color={theme.colors.textQuaternary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  No repositories yet
                </Text>
                <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
                  Run a search or pull to refresh trending repositories.
                </Text>
                <Pressable
                  onPress={handleRetry}
                  style={[
                    styles.emptyButton,
                    {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Text style={[styles.emptyButtonText, { color: theme.colors.textInverted }]}>
                    Load Trending
                  </Text>
                </Pressable>
              </View>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// ============================================================================
// PREMIUM STYLES
// ============================================================================

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    searchSection: {
      padding: 24,
      paddingBottom: 16,
    },
    screenTitle: {
      fontSize: 32,
      fontWeight: '800',
      marginBottom: 4,
    },
    screenSubtitle: {
      fontSize: 15,
      marginBottom: 32,
      lineHeight: 21,
    },
    searchContainer: {
      marginBottom: 32,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 8,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    input: {
      flex: 1,
      fontSize: 17,
      padding: 0,
      fontWeight: '500',
    },
    clearButton: {
      padding: 8,
      borderRadius: 6,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      marginTop: 12,
    },
    headline: {
      fontSize: 24,
      fontWeight: '700',
      flex: 1,
    },
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    resetText: {
      fontSize: 13,
      fontWeight: '600',
    },
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 48,
    },
    separator: {
      height: LIST_SEPARATOR_HEIGHT,
    },
    footerLoader: {
      paddingVertical: 16,
    },
    errorContainer: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    errorBox: {
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      alignItems: 'center',
      gap: 8,
    },
    errorText: {
      fontSize: 15,
      textAlign: 'center',
      marginBottom: 8,
    },
    retryButton: {
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    retryText: {
      fontSize: 13,
      fontWeight: '600',
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      gap: 12,
    },
    loadingText: {
      fontSize: 15,
      marginTop: 4,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
    },
    emptyBox: {
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      gap: 16,
      borderWidth: 1,
      width: '100%',
      maxWidth: 320,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 21,
    },
    emptyButton: {
      borderRadius: 14,
      paddingHorizontal: 24,
      paddingVertical: 16,
      marginTop: 12,
    },
    emptyButtonText: {
      fontSize: 13,
      fontWeight: '600',
    },
    cacheBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      marginHorizontal: 24,
      marginBottom: 12,
    },
    cacheBannerText: {
      fontSize: 13,
      fontWeight: '600',
    },
  });

const styles = createStyles();
