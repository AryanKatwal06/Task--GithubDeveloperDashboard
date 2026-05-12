/**
 * Network State Management
 *
 * Monitors device network connectivity
 * Provides way to detect when app goes offline/online
 *
 * Used for:
 * - Showing offline banner
 * - Queueing requests when offline
 * - Retry on reconnect
 */

import NetInfo from '@react-native-community/netinfo';

// ============================================================================
// TYPES
// ============================================================================

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string; // 'wifi', 'cellular', 'none', etc
  isExpensive: boolean;
  isMetered: boolean;
  connectionTimestamp: number;
}

export type NetworkStateListener = (state: NetworkState) => void;

// ============================================================================
// NETWORK MANAGER
// ============================================================================

class NetworkStateManager {
  private listeners: Set<NetworkStateListener> = new Set();
  private currentState: NetworkState = {
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isExpensive: false,
    isMetered: false,
    connectionTimestamp: Date.now(),
  };

  private subscription: (() => void) | null = null;

  /**
   * Initialize network monitoring
   */
  initialize(): void {
    if (this.subscription) {
      return; // Already initialized
    }

    this.subscription = NetInfo.addEventListener((state: any) => {
      this.currentState = {
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
        type: state.type ?? 'unknown',
        isExpensive: state.isExpensive ?? false,
        isMetered: state.isMetered ?? false,
        connectionTimestamp: Date.now(),
      };

      // Notify all listeners
      this.notifyListeners();
    });
  }

  /**
   * Cleanup network monitoring
   */
  destroy(): void {
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
  }

  /**
   * Get current network state
   */
  getState(): NetworkState {
    return this.currentState;
  }

  /**
   * Is app currently online?
   */
  isOnline(): boolean {
    return this.currentState.isConnected && this.currentState.isInternetReachable;
  }

  /**
   * Subscribe to network state changes
   */
  subscribe(listener: NetworkStateListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.currentState);
    });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const networkStateManager = new NetworkStateManager();

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Wait for internet connection
 *
 * Useful for queued requests:
 * When offline, wait for reconnect before retrying
 */
export const waitForConnection = (): Promise<void> => {
  return new Promise((resolve) => {
    if (networkStateManager.isOnline()) {
      resolve();
      return;
    }

    const unsubscribe = networkStateManager.subscribe((state) => {
      if (state.isConnected && state.isInternetReachable) {
        unsubscribe();
        resolve();
      }
    });
  });
};

/**
 * Detect network change
 *
 * Useful for showing banner or retrying requests
 */
export const detectOfflineToOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    let wasOnline = networkStateManager.isOnline();

    const unsubscribe = networkStateManager.subscribe((state) => {
      const isNowOnline = state.isConnected && state.isInternetReachable;

      if (!wasOnline && isNowOnline) {
        // Transitioned from offline to online
        unsubscribe();
        resolve();
      }

      wasOnline = isNowOnline;
    });
  });
};
