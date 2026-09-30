import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Vista previa en el navegador.
 *
 * **Esto no es un objetivo de despliegue.** La app se entrega para Android y
 * iOS; esta configuración existe solo para poder ver una pantalla y compararla
 * contra la app Flutter sin pasar por el ciclo de compilar, tunelizar e
 * instalar, que en esta máquina son varios minutos por cambio. Nada de lo que
 * hay aquí entra en el paquete del teléfono: todas las dependencias que usa son
 * de desarrollo.
 *
 * Lo que no se puede dar por verificado aquí, y hay que seguir probando en el
 * teléfono: biometría, llaves en StrongBox, almacenamiento cifrado,
 * `FLAG_SECURE` y el botón atrás de Android. El navegador no los tiene.
 */
export default defineConfig({
  root: path.resolve(__dirname, 'web'),
  plugins: [react()],
  resolve: {
    // En lista y con expresiones regulares, no como objeto: un alias suelto de
    // `react-native` también reescribe `react-native/Libraries/...`, que varias
    // librerías importan, y el resultado es una ruta que no existe. El ancla de
    // fin de cadena es lo que separa el paquete de sus rutas internas.
    alias: [
      {
        find: /^react-native\/Libraries\/Utilities\/codegenNativeComponent$/,
        replacement: path.resolve(__dirname, 'web/shims/reactNativeInternals.tsx'),
      },
      {
        find: /^react-native\/Libraries\/Components\/View\/ReactNativeViewViewConfig$/,
        replacement: path.resolve(__dirname, 'web/shims/reactNativeInternals.tsx'),
      },
      {
        find: /^react-native\/Libraries\/ReactNative\/AppContainer$/,
        replacement: path.resolve(__dirname, 'web/shims/reactNativeInternals.tsx'),
      },
      // React Native Web traduce `View`, `Text` y `StyleSheet` a etiquetas del
      // navegador. Es el mismo proyecto que mantiene Necolas desde hace años y
      // el camino que usa la propia documentación de React Native para web. Va
      // envuelto porque le falta `TurboModuleRegistry`; ver el propio archivo.
      {
        find: /^react-native$/,
        replacement: path.resolve(__dirname, 'web/shims/reactNative.ts'),
      },
      // El degradado es la excepción: `react-native-linear-gradient` es un
      // módulo nativo y no tiene implementación web propia.
      // Ruta absoluta y no el nombre suelto: los componentes viven ahora en
      // `@bsc/design-system`, y un nombre suelto se resuelve desde el archivo que
      // lo importa, donde esta dependencia (solo de desarrollo, de la app) no
      // está instalada.
      {
        find: /^react-native-linear-gradient$/,
        replacement: path.resolve(
          __dirname,
          'node_modules/react-native-web-linear-gradient',
        ),
      },
      {
        find: /^@bsc\/shared$/,
        replacement: path.resolve(__dirname, 'packages/bsc-shared/src/index.ts'),
      },
      { find: /^@\//, replacement: `${path.resolve(__dirname, 'src')}/` },
    ],
    // Las variantes `.web.*` van primero: varias librerías del ecosistema
    // —`react-native-svg` entre ellas— publican su implementación de navegador
    // en archivos `.web.js` junto a la nativa, y sin esto se carga la nativa y
    // el componente se dibuja vacío en vez de fallar, que es peor.
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
    ],
  },
  define: {
    // Varias librerías del ecosistema lo consultan y en el navegador no existe.
    global: 'globalThis',
    __DEV__: 'true',
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  optimizeDeps: {
    esbuildOptions: {
      // Los paquetes de React Native se publican en JSX sin transpilar dentro
      // de archivos `.js`, que esbuild no interpreta como JSX por defecto.
      loader: { '.js': 'jsx' },
      // esbuild resuelve las dependencias por su cuenta al pre-empaquetarlas y
      // **no hereda `resolve.extensions`**. Sin repetir la lista aquí,
      // `react-native-svg` carga su implementación nativa y los iconos salen
      // como cajas vacías, sin ningún error que lo delate.
      resolveExtensions: [
        '.web.tsx',
        '.web.ts',
        '.web.jsx',
        '.web.js',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.json',
      ],
    },
  },
  server: {
    // 5173 lo ocupa el servidor de desarrollo del portal Nuxt en esta máquina.
    port: 5273,
    strictPort: true,
  },
});
