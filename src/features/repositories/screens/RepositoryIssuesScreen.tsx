import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../hooks/useTheme';
import type { RepositoriesStackScreenProps } from '../../../types/navigation';

export const RepositoryIssuesScreen: React.FC<RepositoriesStackScreenProps<'RepositoryIssues'>> = ({
  route,
}) => {
  const { theme } = useTheme();
  const { owner, repo } = route.params ?? { owner: '', repo: '' };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Issues Explorer</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {owner}/{repo}
      </Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
        This screen is wired and route-ready. Full issue listing lands in the next feature phase.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
