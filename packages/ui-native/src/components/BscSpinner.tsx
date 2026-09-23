import { ActivityIndicator, type ViewStyle } from 'react-native';

import { BscColors } from '../theme/colors';
import {
  spinnerTokens,
  type SpinnerPlacement,
} from '../componentTokens';

/**
 * Indicador de carga con el diámetro que el original escribe para cada sitio.
 *
 * Existe porque `ActivityIndicator` sin más mide **20×20** y
 * `CircularProgressIndicator` de Flutter **36**, y esa diferencia no la ve
 * nadie leyendo el porte: las dos líneas se parecen mucho. Al pasar por aquí,
 * el tamaño deja de ser el valor por defecto de la plataforma y pasa a ser el
 * del widget Dart, que es lo que se está portando.
 *
 * **Sobre `size` numérico.** React Native solo respeta un número en Android
 * —en iOS `UIActivityIndicatorView` se dibuja a su tamaño propio y el número
 * únicamente reserva la caja—. Es la misma limitación que ya está anotada para
 * la tipografía (P-13): se resuelve cuando exista el equipo macOS. En Android,
 * que es donde hoy se valida, el diámetro es exacto.
 */
export function BscSpinner({
  tamano = 'fullScreen',
  color = BscColors.primary,
  style,
  testID,
}: {
  tamano?: SpinnerPlacement;
  color?: string;
  style?: ViewStyle;
  testID?: string;
}): React.JSX.Element {
  return (
    <ActivityIndicator
      size={spinnerTokens[tamano]}
      color={color}
      style={style}
      testID={testID}
    />
  );
}
