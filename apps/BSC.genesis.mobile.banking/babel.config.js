/**
 * Configuración de Babel.
 *
 * El único añadido sobre la plantilla de React Native es quitar las llamadas a
 * `console.*` **en producción** (T-07). Todo lo que pasa por `console` queda en
 * `logcat`, que cualquiera con el teléfono y un cable puede leer, y un
 * `console.log(respuesta)` olvidado en una depuración imprime saldos y números
 * de cuenta. Ver `scripts/babel-quitar-console.js` para qué se conserva y por
 * qué está escrito a mano en vez de traer una dependencia.
 *
 * `env.production` lo aplica Babel cuando `BABEL_ENV` o `NODE_ENV` valen
 * `production`, que es lo que hace el empaquetado de release de React Native.
 * En desarrollo y en las pruebas no se toca nada: ahí `console` es la
 * herramienta de trabajo.
 */
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    production: {
      plugins: ['./scripts/babel-quitar-console.js'],
    },
  },
};
