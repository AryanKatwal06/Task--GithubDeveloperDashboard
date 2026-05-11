import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../hooks/useTheme';
import type { RepositoriesStackScreenProps } from '../../../types/navigation';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getRepositoryDetails } from '../../../store/slices/repositories';
import { selectRepositoryById } from '../../../store/slices/repositories/selectors';
import { ErrorState, LoadingState } from '../../../components/feedback';

export const RepositoryDetailScreen: React.FC<RepositoriesStackScreenProps<'RepositoryDetail'>> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { id, owner, name } = route.params ?? { id: '', owner: '', name: '' };

  const repository = useAppSelector((state) => selectRepositoryById(state, id));

  const [readme, setReadme] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: `${owner}/${name}` });
  }, [name, navigation, owner]);

  useEffect(() => {
    let isMounted = true;

    const load = async (forceRefresh: boolean = false): Promise<void> => {
      setLoading(true);
      setLoadError(null);

      const result = await dispatch(getRepositoryDetails({ owner, repo: name, forceRefresh }));

      if (getRepositoryDetails.fulfilled.match(result)) {
        if (!isMounted) {
          return;
        }
        setReadme(result.payload.readme || 'README not available.');
      } else if (getRepositoryDetails.rejected.match(result) && isMounted) {
        setLoadError(result.payload?.message || 'Failed to load repository details.');
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [dispatch, name, owner]);

  const repoUrl = repository?.html_url;

  const metadata = useMemo(
    () => [
      { label: 'Stars', value: `${repository?.stargazers_count ?? 0}` },
      { label: 'Forks', value: `${repository?.forks_count ?? 0}` },
      { label: 'Language', value: repository?.language || 'Unknown' },
      { label: 'Open Issues', value: `${repository?.open_issues_count ?? 0}` },
    ],
    [repository]
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      accessibilityLabel="Repository detail screen"
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {owner}/{name}
      </Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        {repository?.description || 'No description available.'}
      </Text>

      <View style={styles.grid}>
        {metadata.map((item) => (
          <View
            key={item.label}
            style={[
              styles.metaCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>
              {item.label}
            </Text>
            <Text style={[styles.metaValue, { color: theme.colors.text }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => {
            navigation.navigate('RepositoryIssues', { owner, repo: name });
          }}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="View repository issues"
        >
          <Text style={[styles.buttonText, { color: theme.colors.textInverted }]}>View Issues</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (repoUrl) {
              void Linking.openURL(repoUrl);
            }
          }}
          style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Open repository in GitHub"
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
            Open in GitHub
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>README Preview</Text>

      {loading ? (
        <LoadingState label="Loading repository details" />
      ) : loadError ? (
        <ErrorState
          message={loadError}
          actionLabel="Retry"
          onAction={() => {
            void dispatch(getRepositoryDetails({ owner, repo: name, forceRefresh: true }));
          }}
        />
      ) : (
        <View
          style={[
            styles.readmeCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text
            style={[styles.readmeText, { color: theme.colors.textSecondary }]}
            numberOfLines={20}
          >
            {readme}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  metaCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  metaValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  readmeCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  readmeText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
