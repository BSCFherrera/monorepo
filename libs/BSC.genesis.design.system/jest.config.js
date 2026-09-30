module.exports = {
  displayName: 'BSC.genesis.design.system',
  preset: '@react-native/jest-preset',
  testMatch: ['<rootDir>/tests/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.tsx'],
  moduleNameMapper: {
    '^react-native-safe-area-context$': '<rootDir>/tests/mocks/safeAreaContext.tsx',
  },
  // pnpm stores real packages under `node_modules/.pnpm/<pkg>@<version>/node_modules/<pkg>/`.
  // Keep React Native packages transformable in both hoisted and pnpm-real paths.
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(' +
      [
        '@react-native',
        'react-native',
        'react-native-gesture-handler',
        'react-native-linear-gradient',
        'react-native-reanimated',
        'react-native-safe-area-context',
        'react-native-svg',
        'react-native-worklets',
      ].join('|') +
      ')/)',
  ],
};
