import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { RepositoriesStackScreenProps } from '../../../types/navigation';
import { useTheme } from '../../../hooks/useTheme';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { searchRepositories, getTrendingRepositories } from '../../../store/slices/repositories';
import { EmptyState, ErrorState, LoadingState } from '../../../components/feedback';
import {
  selectErrorMessage,
  selectFavoriteLookup,
  selectIsLoading,
  selectSearchPagination,
  selectSearchResults,
} from '../../../store/slices/repositories/selectors';
import { toggleFavorite, clearSearch } from '../../../store/slices/repositories/slice';
import type { RepositoryEntity } from '../../../store/slices/repositories/types';
import { RepositoryListItem } from '../components/RepositoryListItem';

const DEFAULT_PER_PAGE = 20;
const LIST_ITEM_HEIGHT = 132;
const LIST_SEPARATOR_HEIGHT = 10;
const LIST_ROW_HEIGHT = LIST_ITEM_HEIGHT + LIST_SEPARATOR_HEIGHT;

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

  const [query, setQuery] = useState('react native');
  const [activeQuery, setActiveQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void dispatch(getTrendingRepositories({ perPage: DEFAULT_PER_PAGE }));
  }, [dispatch]);

  const isSearching = activeQuery.length > 0;
  const hasMore = pagination?.hasMore ?? false;

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    setActiveQuery(trimmed);
    await dispatch(
      searchRepositories({
        query: trimmed,
        page: 1,
        perPage: DEFAULT_PER_PAGE,
      })
    );
  }, [dispatch, query]);

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
      navigation.navigate('RepositoryDetail', {
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

  const handleSubmitSearch = useCallback(() => {
    void handleSearch();
  }, [handleSearch]);

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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.searchBox,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search repositories"
          placeholderTextColor={theme.colors.textTertiary}
          style={[styles.input, { color: theme.colors.text }]}
          returnKeyType="search"
          onSubmitEditing={handleSubmitSearch}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Repository search input"
          accessibilityHint="Enter keywords, then submit search"
        />
        <Pressable
          onPress={handleSubmitSearch}
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Run repository search"
        >
          <Text style={[styles.actionText, { color: theme.colors.textInverted }]}>Search</Text>
        </Pressable>
      </View>

      <View style={styles.headerRow}>
        <Text style={[styles.headline, { color: theme.colors.text }]}>{headline}</Text>
        <Pressable
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Reset current search and load trending repositories"
        >
          <Text style={[styles.clearText, { color: theme.colors.primary }]}>Reset</Text>
        </Pressable>
      </View>

      {errorMessage ? (
        <ErrorState message={errorMessage} actionLabel="Retry" onAction={handleRetry} />
      ) : null}

      <FlatList
        data={repositories}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={11}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={renderSeparator}
        onEndReachedThreshold={0.4}
        onEndReached={handleLoadMoreRequest}
        ListFooterComponent={listFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefreshRequest}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingState label="Loading repositories" />
          ) : (
            <EmptyState
              title="No repositories yet"
              body="Run a search or pull to refresh trending repositories."
              actionLabel="Load Trending"
              onAction={handleRetry}
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  searchBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  headerRow: {
    marginTop: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 10,
  },
  footerLoader: {
    paddingVertical: 14,
  },
});
