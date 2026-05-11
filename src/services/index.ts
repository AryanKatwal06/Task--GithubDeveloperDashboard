/**
 * Services Module Exports
 *
 * Centralized exports for all services
 */

export { apiClient, getRateLimitInfo } from './apiClient';
export { githubAPI } from './githubAPI';
export {
  networkStateManager,
  waitForConnection,
  detectOfflineToOnline,
} from './networkStateManager';
export type { NetworkState, NetworkStateListener } from './networkStateManager';
