import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    <View
      style={[styles.container, { backgroundColor: theme.colors.warning }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.text, { color: theme.colors.textInverted }]}>
        Offline mode: showing cached data when available.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
