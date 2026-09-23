/**
 * `react-native` para el navegador.
 *
 * React Native Web cubre los componentes y las APIs que usa la app, pero no
 * publica `TurboModuleRegistry`, que es el registro por el que una librería
 * pide su módulo nativo. `react-native-safe-area-context`,
 * `react-native-screens` y `react-native-svg` lo importan al cargar, aunque en
 * web acaben usando su propia implementación en JavaScript.
 *
 * Este módulo reexporta React Native Web y añade ese registro devolviendo
 * «no hay módulo nativo», que es exactamente lo que esas librerías esperan
 * cuando corren fuera del teléfono. **Solo lo usa la vista previa del
 * navegador**; el paquete del teléfono no lo incluye.
 */

import * as registroDeRecursos from '@react-native/assets-registry/registry';

export * from 'react-native-web';

/**
 * Registro de imágenes empaquetadas. `react-native-svg` lo importa de
 * `react-native` al cargar; React Native Web no lo reexporta, aunque el paquete
 * que lo implementa sí está instalado.
 */
export const AssetRegistry = registroDeRecursos;

export const TurboModuleRegistry = {
  get(): null {
    return null;
  },
  getEnforcing(): Record<string, never> {
    // `getEnforcing` promete no devolver nulo, así que se devuelve un objeto
    // vacío: la librería encuentra el registro y cae a su camino de web.
    return {};
  },
};
