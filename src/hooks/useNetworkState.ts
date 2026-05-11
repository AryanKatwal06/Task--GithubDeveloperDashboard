/**
 * useNetworkState Hook
 *
 * Provides network connectivity status to React components
 * Subscribes to network changes and triggers re-renders
 *
 * USAGE:
 * const { isOnline, type } = useNetworkState();
 * return isOnline ? <Content /> : <OfflineBanner />;
 */

import { useEffect, useState } from 'react';

import type { NetworkState } from '../services/networkStateManager';
import { networkStateManager } from '../services/networkStateManager';

/**
 * useNetworkState Hook
 *
 * Returns current network state and subscribes to changes
 * Component re-renders when network state changes
 */
export const useNetworkState = (): NetworkState => {
  const [networkState, setNetworkState] = useState<NetworkState>(networkStateManager.getState());

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = networkStateManager.subscribe(setNetworkState);

    // Cleanup on unmount
    return (): void => {
      unsubscribe();
    };
  }, []);

  return networkState;
};
