import { View } from 'react-native-web';

/**
 * Sustitutos de los módulos internos de React Native que no existen en web.
 *
 * Varias librerías del ecosistema —`react-native-safe-area-context`,
 * `react-native-screens`, `react-native-svg`— importan rutas profundas de
 * `react-native/Libraries/...` para declarar sus componentes nativos. En el
 * teléfono esas rutas las resuelve Metro; en el navegador no existen, y React
 * Native Web no las publica.
 *
 * Todo lo que hay aquí es un envoltorio inerte: sirve para que el módulo cargue
 * y el componente se dibuje como una caja normal. **Ninguna de estas piezas
 * llega al paquete del teléfono**: solo las usa la vista previa del navegador.
 */

/** En web un «componente nativo» es simplemente una `View`. */
export function codegenNativeComponent(): typeof View {
  return View;
}

/** Configuración de vista que piden algunas librerías al registrarse. */
export const ReactNativeViewViewConfig = {
  uiViewClassName: 'RCTView',
  validAttributes: {},
  bubblingEventTypes: {},
  directEventTypes: {},
};

/** El contenedor raíz de la app; en web basta con la propia `View`. */
export const AppContainer = View;

export default codegenNativeComponent;
