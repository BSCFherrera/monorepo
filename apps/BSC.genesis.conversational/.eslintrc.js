module.exports = {
  root: true,
  extends: '@react-native',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', '@nx'],
  // Límites de módulos de Nx, compartidos con la configuración raíz y con
  // mobile banking. Es la configuración de ESLint, no código de la app.
  // eslint-disable-next-line @nx/enforce-module-boundaries
  rules: require('../../eslint.module-boundaries.cjs'),
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
      },
    },
    {
      files: ['jest.setup.js'],
      env: {jest: true},
    },
  ],
};
