import React, { useEffect } from 'react';
import { Provider } from 'react-redux';

import { AppErrorBoundary } from '@components/feedback/AppErrorBoundary';
import { OfflineBanner } from '@components/feedback/OfflineBanner';
import { initializeAppServices, shutdownAppServices } from './bootstrap';
import { RootNavigator } from '@navigation/RootNavigator';
import { store } from '../store';
import { ThemeProvider } from '@theme/ThemeProvider';

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
        <ThemeProvider>
          <OfflineBanner />
          <RootNavigator />
        </ThemeProvider>
      </Provider>
    </AppErrorBoundary>
  );
}
