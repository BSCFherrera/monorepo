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
    {
      // Texto visible sin traducir. Solo en lo que ya pasó a `@bsc/i18n`: cada
      // funcionalidad se añade a esta lista cuando se migra, y a partir de ahí
      // un texto escrito a mano en la pantalla es un error de lint.
      //
      // Se revisan el texto dentro del JSX y los atributos que el cliente ve o
      // escucha; `testID`, `resizeMode` y demás no son texto para nadie.
      files: ['src/features/auth/**/*.tsx', 'src/app/PantallaDeArranque.tsx'],
      excludedFiles: ['**/__tests__/**'],
      plugins: ['i18next'],
      rules: {
        'i18next/no-literal-string': [
          'error',
          {
            mode: 'jsx-only',
            'jsx-attributes': {
              include: [
                'label',
                'placeholder',
                'accessibilityLabel',
                'accessibilityHint',
                'title',
                'error',
                'etiqueta',
              ],
            },
            message:
              'Texto visible sin traducir: usa t() con una clave de src/locales (ver libs/shared-i18n/README.md).',
          },
        ],
      },
    },
  ],
};
