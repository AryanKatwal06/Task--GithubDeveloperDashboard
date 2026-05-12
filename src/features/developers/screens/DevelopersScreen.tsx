import React, { useState } from 'react';
import { FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../../../hooks/useTheme';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  searchDevelopers,
  selectError,
  selectIsLoading,
  selectSearchResults,
} from '../../../store/slices/developers';
import type { DevelopersStackScreenProps } from '../../../types/navigation';

export const DevelopersScreen: React.FC<DevelopersStackScreenProps<'DevelopersList'>> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const developers = useAppSelector(selectSearchResults);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const [query, setQuery] = useState('react native');

  const handleSearch = (): void => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    Keyboard.dismiss();
    void dispatch(searchDevelopers({ query: trimmed, page: 1 }));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Developers</Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
        Search GitHub users and open a profile when you need more detail.
      </Text>

      <View
        style={[
          styles.searchBox,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search developers"
          placeholderTextColor={theme.colors.textTertiary}
          style={[styles.input, { color: theme.colors.text }]}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          onPress={handleSearch}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={[styles.buttonText, { color: theme.colors.textInverted }]}>Search</Text>
        </Pressable>
      </View>

      {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

      <FlatList
        data={developers}
        keyExtractor={(item) => item.login}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('DeveloperDetail', { login: item.login })}
            style={[
              styles.card,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {item.login}
            </Text>
            <Text
              style={[styles.cardBody, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.bio || item.company || 'No bio available.'}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          isLoading ? (
            <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>
              Loading developers...
            </Text>
          ) : (
            <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>
              Search to see developer results.
            </Text>
          )
        }
      />
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
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  searchBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    gap: 8,
    marginTop: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 8,
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  error: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 20,
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
  helper: {
    marginTop: 12,
    fontSize: 13,
  },
});
