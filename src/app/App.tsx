import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { AppErrorBoundary } from '../components/feedback/AppErrorBoundary';
import { OfflineBanner } from '../components/feedback/OfflineBanner';
import { NetworkErrorModal } from '../components/feedback/NetworkErrorModal';
import { initializeAppServices, shutdownAppServices } from './bootstrap';
import { RootNavigator } from '../navigation/RootNavigator';
import { store } from '../store';
import { ThemeProvider } from '../theme/ThemeProvider';

export default function App() {
  useEffect(() => {
    void initializeAppServices();

    return () => {
      void shutdownAppServices();
    };
  }, []);

  return (
    <AppErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics ?? undefined}>
          <ThemeProvider>
            <OfflineBanner />
            <NetworkErrorModal />
            <RootNavigator />
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>
    </AppErrorBoundary>
  );
}
