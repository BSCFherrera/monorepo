const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/**
 * Paquetes que deben existir **una sola vez** en el bundle (misma lista que
 * mobile banking). Las libs compartidas (`libs/shared-*`) los declaran como
 * peerDependencies; resolverlos siempre desde la app evita que Metro empaquete
 * dos Reacts (hooks rotos) o dos React Natives si algún día pnpm crea una copia.
 */
const UNA_SOLA_COPIA = new Set([
  'react',
  'react-native',
  'react-native-svg',
  'react-native-linear-gradient',
  'react-native-safe-area-context',
]);

const nombreDelPaquete = moduleName =>
  moduleName.startsWith('@')
    ? moduleName.split('/').slice(0, 2).join('/')
    : moduleName.split('/')[0];

const defaultConfig = getDefaultConfig(projectRoot);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Dentro del monorepo, pnpm enlaza cada dependencia en `node_modules` de la app
 * apuntando a `<raíz>/node_modules/.pnpm`, fuera de esta carpeta: sin
 * `watchFolders` y `nodeModulesPaths` sobre la raíz, Metro no las resuelve.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    // Permite cargar PDFs locales con require() para react-native-pdf
    assetExts: defaultConfig.resolver.assetExts.includes('pdf')
      ? defaultConfig.resolver.assetExts
      : [...defaultConfig.resolver.assetExts, 'pdf'],
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    resolveRequest: (context, moduleName, platform) => {
      if (UNA_SOLA_COPIA.has(nombreDelPaquete(moduleName))) {
        return context.resolveRequest(
          { ...context, originModulePath: path.join(projectRoot, 'index.js') },
          moduleName,
          platform,
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
  server: {
    enhanceMiddleware: middleware => {
      return middleware;
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
