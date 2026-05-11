import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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

  return (
    <Pressable
      onPress={() => onPress(repository)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${repository.full_name} repository`}
    >
      <View style={styles.rowBetween}>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
          {repository.full_name}
        </Text>
        <Pressable
          onPress={() => onToggleFavorite(repository.id.toString())}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Text
            style={[
              styles.favorite,
              { color: isFavorite ? theme.colors.warning : theme.colors.textTertiary },
            ]}
          >
            {isFavorite ? '★' : '☆'}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
        {repository.description || 'No description available.'}
      </Text>

      <View style={styles.rowBetween}>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
            ★ {formatCount(repository.stargazers_count)}
          </Text>
          <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
            ⑂ {formatCount(repository.forks_count)}
          </Text>
          <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
            {repository.language || 'Unknown'}
          </Text>
        </View>
      </View>
    </Pressable>
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

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  favorite: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
  },
});
