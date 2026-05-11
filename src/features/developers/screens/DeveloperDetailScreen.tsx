import React, { useEffect } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { useTheme } from '../../../hooks/useTheme';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getDeveloperDetails, selectDeveloperById } from '../../../store/slices/developers';
import type { DevelopersStackScreenProps } from '../../../types/navigation';

export const DeveloperDetailScreen: React.FC<DevelopersStackScreenProps<'DeveloperDetail'>> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { login } = route.params ?? { login: '' };
  const developer = useAppSelector((state) => selectDeveloperById(state, login));

  useEffect(() => {
    navigation.setOptions({ title: login });
  }, [login, navigation]);

  useEffect(() => {
    if (!developer) {
      void dispatch(getDeveloperDetails(login));
    }
  }, [developer, dispatch, login]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{developer?.login || login}</Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
        {developer?.bio || 'GitHub profile details load here when the user has been fetched.'}
      </Text>

      <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>Followers</Text>
      <Text style={[styles.value, { color: theme.colors.text }]}>{developer?.followers ?? 0}</Text>

      <Pressable
        onPress={() => navigation.navigate('DeveloperRepositories', { login })}
        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={[styles.primaryButtonText, { color: theme.colors.textInverted }]}>
          View repositories
        </Text>
      </Pressable>

      {developer?.html_url ? (
        <Pressable
          onPress={() => void Linking.openURL(developer.html_url)}
          style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
            Open GitHub profile
          </Text>
        </Pressable>
      ) : null}
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
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
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
