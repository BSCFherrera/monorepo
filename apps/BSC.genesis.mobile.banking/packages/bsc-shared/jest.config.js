/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],

  // Umbrales de `07-test-strategy.md`: este paquete es lógica pura, barata de
  // cubrir, y un error aquí rechaza o autoriza dinero indebidamente.
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts', '!src/**/__tests__/**'],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 95,
      functions: 100,
      lines: 100,
    },
  },
};
