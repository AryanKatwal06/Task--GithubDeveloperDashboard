import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNetworkState } from '../../hooks/useNetworkState';
import { useTheme } from '../../hooks/useTheme';

export const OfflineBanner: React.FC = () => {
  const { isConnected, isInternetReachable } = useNetworkState();
  const { theme } = useTheme();

  const isOnline = isConnected && isInternetReachable;
  if (isOnline) {
    return null;
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: theme.colors.warning }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.text, { color: theme.colors.textInverted }]}>
        Offline mode: showing cached data when available.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
