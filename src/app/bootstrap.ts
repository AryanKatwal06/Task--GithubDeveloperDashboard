import { DatabaseService } from '../services/database';
import { performCacheMaintenance } from '../services/database/cacheSyncMiddleware';
import { networkStateManager } from '../services/networkStateManager';

let bootstrapPromise: Promise<void> | null = null;

export const initializeAppServices = (): Promise<void> => {
  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async (): Promise<void> => {
    networkStateManager.initialize();

    try {
      await DatabaseService.initialize();
      await performCacheMaintenance();
    } catch (error) {
      if (__DEV__) {
        console.warn('[App] Service bootstrap failed:', error);
      }
    }
  })().finally(() => {
    bootstrapPromise = null;
  });

  return bootstrapPromise;
};

export const shutdownAppServices = async (): Promise<void> => {
  networkStateManager.destroy();

  try {
    await DatabaseService.close();
  } catch (error) {
    if (__DEV__) {
      console.warn('[App] Service shutdown failed:', error);
    }
  }
};
