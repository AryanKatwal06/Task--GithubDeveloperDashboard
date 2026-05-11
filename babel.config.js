module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@services': './src/services',
          '@database': './src/database',
          '@store': './src/store',
          '@theme': './src/theme',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@types': './src/types',
          '@features': './src/features',
          '@navigation': './src/navigation',
        },
      },
    ],
  ],
};
