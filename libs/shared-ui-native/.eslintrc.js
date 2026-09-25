module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      // `jest.setup.js` corre en el entorno de Jest, donde `jest` es global.
      // Sin esto la regla `no-undef` lo marcaba diecinueve veces y el informe
      // de lint dejaba de servir para detectar errores nuevos.
      files: ['jest.setup.js', '**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
      env: { jest: true },
    },
  ],
};
