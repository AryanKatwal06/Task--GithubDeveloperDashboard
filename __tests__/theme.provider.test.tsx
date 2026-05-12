import React from 'react';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, create } from 'react-test-renderer';

jest.unmock('../src/theme/ThemeProvider');

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

import { useTheme } from '../src/hooks/useTheme';
import { ThemeProvider } from '../src/theme/ThemeProvider';

const asyncStorageMock = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const ThemeProbe: React.FC = () => {
  const { variant, toggleTheme } = useTheme();

  return (
    <Text testID="theme-variant" onPress={toggleTheme}>
      {variant}
    </Text>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    asyncStorageMock.getItem.mockResolvedValue(null);
  });

  it('defaults to light and toggles to dark', async () => {
    let tree: ReturnType<typeof create>;

    await act(async () => {
      tree = create(
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>
      );
    });

    const themeVariant = tree!.root.findByProps({ testID: 'theme-variant' });
    expect(themeVariant.props.children).toBe('light');

    await act(async () => {
      themeVariant.props.onPress();
    });

    expect(tree!.root.findByProps({ testID: 'theme-variant' }).props.children).toBe('dark');
    expect(asyncStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
  });
});
