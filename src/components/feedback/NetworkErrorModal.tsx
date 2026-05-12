import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View, Pressable } from 'react-native';
import { useNetworkState } from '../../hooks/useNetworkState';
import { useTheme } from '../../hooks/useTheme';

export const NetworkErrorModal: React.FC = () => {
  const { isConnected, isInternetReachable } = useNetworkState();
  const { theme } = useTheme();
  const [dismissed, setDismissed] = useState(false);

  const isOnline = isConnected && isInternetReachable;

  useEffect(() => {
    if (isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={!isOnline && !dismissed}
      onRequestClose={() => setDismissed(true)}
    >
      <View style={styles.backdrop}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>No internet connection</Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            You're currently offline. Some features may be unavailable and cached data will be
            shown.
          </Text>
          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => setDismissed(true)}
              style={[styles.dismissButton, { borderColor: theme.colors.borderLight }]}
            >
              <Text style={[styles.dismissText, { color: theme.colors.textSecondary }]}>
                Dismiss
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 12,
    padding: 20,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dismissButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
