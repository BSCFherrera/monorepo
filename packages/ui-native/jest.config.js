/** @type {import('jest').Config} */
module.exports = {
  displayName: 'ui-native',
  preset: '@react-native/jest-preset',
  roots: ['<rootDir>/src'],
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
      ].join('|') +
      ')/)',
  ],
};
