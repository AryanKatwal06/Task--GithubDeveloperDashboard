import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../hooks/useTheme';
import { useAppSelector } from '../../../store/hooks';
import {
  selectFavoriteRepositories,
  selectSearchResults,
} from '../../../store/slices/repositories/selectors';
import type { HomeStackScreenProps } from '../../../types/navigation';

export const HomeDashboardScreen: React.FC<HomeStackScreenProps<'HomeDashboard'>> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const repositories = useAppSelector(selectSearchResults);
  const favoriteRepositories = useAppSelector(selectFavoriteRepositories);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.kicker, { color: theme.colors.primary }]}>
        GitHub Developer Dashboard
      </Text>
      <Text style={[styles.title, { color: theme.colors.text }]}>Current state at a glance</Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
        Cached repository data is restored on launch and refreshed from the network when available.
      </Text>

      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {repositories.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Visible repos
          </Text>
        </View>
        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {favoriteRepositories.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Favorites</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recently loaded</Text>
      {repositories.slice(0, 3).map((repository) => (
        <Pressable
          key={repository.id}
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
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.repoName, { color: theme.colors.text }]} numberOfLines={1}>
            {repository.full_name}
          </Text>
          <Text style={[styles.repoMeta, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {repository.description || 'No description available.'}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  body: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '700',
  },
  repoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  repoName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  repoMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
});

