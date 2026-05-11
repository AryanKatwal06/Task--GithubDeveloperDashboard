import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

interface LoadingStateProps {
  label?: string;
}

interface EmptyStateProps {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ErrorStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ label = 'Loading content' }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.centered} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
      <Text style={[styles.caption, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
};

export const EmptyState: React.FC<EmptyStateProps> = ({ title, body, actionLabel, onAction }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.centered} accessibilityRole="summary">
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{body}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={[styles.actionText, { color: theme.colors.textInverted }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export const ErrorState: React.FC<ErrorStateProps> = ({ message, actionLabel, onAction }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.errorContainer,
        { borderColor: theme.colors.error, backgroundColor: theme.colors.surface },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.errorTitle, { color: theme.colors.error }]}>Something went wrong</Text>
      <Text style={[styles.errorBody, { color: theme.colors.textSecondary }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={[styles.secondaryButton, { borderColor: theme.colors.error }]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={[styles.secondaryText, { color: theme.colors.error }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    marginTop: 46,
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  caption: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: 12,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  errorContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  errorBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  secondaryButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  secondaryText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
