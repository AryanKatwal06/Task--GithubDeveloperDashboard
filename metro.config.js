const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Production-grade configuration with:
 * - Absolute imports via path aliases
 * - Windows Metro watch stability (blockList for expo-modules)
 * - Proper module resolution for TypeScript
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  projectRoot: __dirname,
  watchFolders: [path.resolve(__dirname, 'src')],
  resolver: {
    blockList: [
      // Prevent Metro from watching problematic paths on Windows
      // Fixes: ENOENT watch errors with expo-modules-autolinking
      /expo-modules-autolinking[/\\]build/,
      /node_modules[/\\].*[/\\]node_modules/,
    ],
    // Support TypeScript path aliases
    extraNodeModules: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@database': path.resolve(__dirname, 'src/database'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@theme': path.resolve(__dirname, 'src/theme'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@navigation': path.resolve(__dirname, 'src/navigation'),
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: true,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
