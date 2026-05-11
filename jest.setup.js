/* global jest */

jest.mock('react-redux', () => {
  const React = require('react');

  return {
    __esModule: true,
    Provider: ({ children }) => React.createElement(React.Fragment, null, children),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    GestureHandlerRootView: ({ children, ...props }) => React.createElement(View, props, children),
  };
});

jest.mock('./src/store', () => {
  const store = {
    getState: () => ({}),
    dispatch: jest.fn(),
    subscribe: jest.fn(() => () => undefined),
    replaceReducer: jest.fn(),
  };

  return {
    __esModule: true,
    default: store,
    store,
  };
});

jest.mock('./src/theme/ThemeProvider', () => ({
  __esModule: true,
  ThemeProvider: ({ children }) => children,
}));

jest.mock('@theme/ThemeProvider', () => ({
  __esModule: true,
  ThemeProvider: ({ children }) => children,
}));

jest.mock('./src/navigation/RootNavigator', () => ({
  __esModule: true,
  RootNavigator: () => null,
}));

jest.mock('@navigation/RootNavigator', () => ({
  __esModule: true,
  RootNavigator: () => null,
}));

jest.mock('./src/components/feedback', () => ({
  __esModule: true,
  AppErrorBoundary: ({ children }) => children,
  OfflineBanner: () => null,
}));

jest.mock('@components/feedback/AppErrorBoundary', () => ({
  __esModule: true,
  AppErrorBoundary: ({ children }) => children,
}));

jest.mock('@components/feedback/OfflineBanner', () => ({
  __esModule: true,
  OfflineBanner: () => null,
}));

jest.mock('./src/app/bootstrap', () => ({
  __esModule: true,
  initializeAppServices: jest.fn(() => Promise.resolve()),
  shutdownAppServices: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => () => undefined),
    fetch: jest.fn(() =>
      Promise.resolve({
        type: 'unknown',
        isConnected: null,
        isInternetReachable: null,
        details: null,
      })
    ),
    refresh: jest.fn(() => Promise.resolve()),
    configure: jest.fn(),
  },
  addEventListener: jest.fn(() => () => undefined),
  fetch: jest.fn(() =>
    Promise.resolve({
      type: 'unknown',
      isConnected: null,
      isInternetReachable: null,
      details: null,
    })
  ),
  refresh: jest.fn(() => Promise.resolve()),
  configure: jest.fn(),
}));
