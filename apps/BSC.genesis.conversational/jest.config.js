module.exports = {
  preset: '@react-native/jest-preset',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Con pnpm el paquete real vive en `node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>/`;
  // el prefijo opcional deja pasar también esa ruta (igual que en mobile banking).
  // `react-native-linear-gradient` y `react-native-svg` se suman porque
  // `@bsc/design-system` los usa internamente (p. ej. `BscGradientBackdrop`) y
  // se publican como ESM sin transpilar.
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(react-native|@react-native|@react-navigation|react-native-linear-gradient|react-native-svg)/)',
  ],
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@i18n/(.*)$': '<rootDir>/src/i18n/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/**/*',
  ],
};
