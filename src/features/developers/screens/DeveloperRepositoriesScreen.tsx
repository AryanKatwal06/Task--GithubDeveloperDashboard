import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../../../hooks/useTheme';
import type { DevelopersStackScreenProps } from '../../../types/navigation';
import { githubAPI } from '../../../services/githubAPI';
import type { GitHubRepository } from '../../../types/api';

export const DeveloperRepositoriesScreen: React.FC<
  DevelopersStackScreenProps<'DeveloperRepositories'>
> = ({ route }) => {
  const { theme } = useTheme();
  const { login } = route.params ?? { login: '' };
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async (): Promise<void> => {
      try {
        const result = await githubAPI.getUserRepositories(login, 1, 20);
        if (mounted) {
          setRepositories(result);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [login]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{login}'s repositories</Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
        This screen is intentionally simple and only loads a short repo list.
      </Text>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <FlatList
          data={repositories}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => void Linking.openURL(item.html_url)}
              style={[
                styles.card,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text
                style={[styles.cardBody, { color: theme.colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.description || 'No description available.'}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 14,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 18,
  },
});
