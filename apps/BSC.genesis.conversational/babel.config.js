const path = require('path');

// Rutas ancladas a esta carpeta y no al directorio de trabajo: Metro corre desde la app, pero
// `nx run BSC.genesis.conversational:test` corre Jest desde la raíz del monorepo, y con rutas
// relativas (`./src`) los alias se resolvían contra la raíz y ningún módulo se encontraba.
const desdeLaApp = relativePath => path.resolve(__dirname, relativePath);

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: [desdeLaApp('./src')],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': desdeLaApp('./src/components'),
          '@screens': desdeLaApp('./src/screens'),
          '@services': desdeLaApp('./src/services'),
          '@store': desdeLaApp('./src/store'),
          '@utils': desdeLaApp('./src/utils'),
          '@hooks': desdeLaApp('./src/hooks'),
          '@/types': desdeLaApp('./src/types'),
          '@constants': desdeLaApp('./src/constants'),
          '@styles': desdeLaApp('./src/styles'),
          '@i18n': desdeLaApp('./src/i18n'),
          '@assets': desdeLaApp('./assets'),
        },
      },
    ],
  ],
};
