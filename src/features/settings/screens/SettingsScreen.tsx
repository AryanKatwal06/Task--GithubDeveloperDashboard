import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../../hooks/useTheme';
import { useAppDispatch } from '../../../store/hooks';
import { clearCache } from '../../../store/slices/repositories/slice';
import { DatabaseService } from '../../../services/database';
import { getCacheDebugInfo } from '../../../services/database/cacheSyncMiddleware';
import type { SettingsStackScreenProps } from '../../../types/navigation';

/**
 * Union type for all possible SettingsStackScreenProps
 * Allows the component to handle any of the 4 screen names in SettingsStack
 */
type SettingsScreenProps =
  | SettingsStackScreenProps<'SettingsHome'>
  | SettingsStackScreenProps<'ThemeSettings'>
  | SettingsStackScreenProps<'AppInfo'>
  | SettingsStackScreenProps<'CacheManagement'>;

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const { theme, variant, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const [isCleaning, setIsCleaning] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({ repositoriesCount: 0, searchCacheCount: 0 });

  const refreshCacheInfo = useCallback(async (): Promise<void> => {
    const info = await getCacheDebugInfo();
    setCacheInfo({
      repositoriesCount: info.repositoriesCount,
      searchCacheCount: info.searchCacheCount,
    });
  }, []);

  // Update cache info on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      void refreshCacheInfo();
    }, [refreshCacheInfo])
  );

  const handleRunCleanup = useCallback(async (): Promise<void> => {
    if (isCleaning) {
      return;
    }

    setIsCleaning(true);

    try {
      dispatch(clearCache());
      await DatabaseService.clear();
      await refreshCacheInfo();
    } finally {
      setIsCleaning(false);
    }
  }, [dispatch, isCleaning, refreshCacheInfo]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
        A small settings surface is enough here: theme, cache maintenance, and a couple of live
        stats.
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Theme</Text>
        <Text style={[styles.cardValue, { color: theme.colors.text }]}>{variant}</Text>
        <Pressable
          onPress={toggleTheme}
          style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
            Toggle theme
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Cache</Text>
        <Text style={[styles.cardValue, { color: theme.colors.text }]}>
          {cacheInfo.repositoriesCount} repos cached
        </Text>
        <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>
          Search entries: {cacheInfo.searchCacheCount}
        </Text>
        <Pressable
          onPress={() => {
            void handleRunCleanup();
          }}
          disabled={isCleaning}
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.colors.textInverted }]}>
            {isCleaning ? 'Cleaning cache...' : 'Run cache cleanup'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  body: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  helper: {
    marginTop: 4,
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
