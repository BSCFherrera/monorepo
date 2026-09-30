const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/**
 * Paquetes que deben existir **una sola vez** en el bundle. `@bsc/design-system`
 * los declara como peerDependencies y los instala también para sus pruebas;
 * si algún día su versión se separa de la de la app, pnpm crearía una segunda
 * copia y Metro empaquetaría dos Reacts (hooks rotos) o dos React Natives.
 * Resolverlos siempre desde la app lo impide.
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

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Dentro del monorepo, pnpm enlaza cada dependencia en `node_modules` de la app
 * apuntando a `<raíz>/node_modules/.pnpm`, fuera de esta carpeta. Metro solo
 * vigila el directorio del proyecto por defecto, así que sin `watchFolders` y
 * `nodeModulesPaths` sobre la raíz del workspace no resuelve esos módulos.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [workspaceRoot],
  resolver: {
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
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
