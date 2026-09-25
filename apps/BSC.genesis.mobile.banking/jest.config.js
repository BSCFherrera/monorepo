/** @type {import('jest').Config} */
module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],

  // El paquete compartido trae sus propias pruebas y sus propios umbrales de
  // cobertura; aquí se ejecutan junto a las de la app para que `npm test` diga
  // la verdad completa en una sola corrida.
  roots: ['<rootDir>/__tests__', '<rootDir>/src', '<rootDir>/packages'],

  // `@bsc/shared` es un enlace del workspace hacia código TypeScript sin
  // compilar. Resolverlo directamente a la fuente evita tener que publicar un
  // build solo para poder ejecutar las pruebas.
  moduleNameMapper: {
    '^@bsc/shared$': '<rootDir>/packages/bsc-shared/src/index.ts',
  },

  // Varias librerías de React Native se publican como módulos de ECMAScript sin
  // transpilar, y Jest ignora `node_modules` por defecto. Hay que dejarlas
  // pasar por Babel o el conjunto de pruebas ni siquiera arranca.
  //
  // Con pnpm el paquete real vive en `node_modules/.pnpm/<pkg>@<ver>/node_modules/
  // <pkg>/`, así que el prefijo opcional deja pasar también esa ruta.
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(' +
      [
        '@react-native',
        'react-native',
        'react-native-linear-gradient',
        'react-native-safe-area-context',
        'react-native-svg',
        'react-native-screens',
        '@react-navigation',
        'zustand',
      ].join('|') +
      ')/)',
  ],
};
