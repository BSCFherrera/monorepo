import { StyleSheet, View } from 'react-native';

import type {
  ConnectionBannerProps,
  ConnectionBannerState,
} from '@bsc/contracts';

import { BscColors } from '../theme/colors';
import { BscSpacing, screenPadding } from '../theme/spacing';

import { BscBanner } from './BscBanner';
import { BscTextButton } from './BscButton';
import { BscSpinner } from './BscSpinner';

/**
 * Aviso del estado de una conexión en tiempo real (p. ej. el chat).
 *
 * Vive fuera del historial de mensajes a propósito: un corte de red no es algo
 * que el asistente «dijo», así que no se escribe como burbuja ni queda en la
 * conversación. Aparece mientras dura el problema y desaparece solo cuando la
 * conexión vuelve.
 *
 * - `reconnecting`: tono informativo con el indicador de carga girando: la app
 *   lo está resolviendo sola y el cliente no tiene que hacer nada.
 * - `offline`: tono de peligro con icono —el estado nunca se comunica solo con
 *   color— y, si se pasa, la acción para reintentar.
 *
 * Compone `BscBanner`, `BscSpinner` y `BscTextButton`; no añade medidas
 * propias salvo el margen de pantalla y el aire vertical alrededor del aviso.
 */
export type BscConnectionBannerState = ConnectionBannerState;

export type BscConnectionBannerProps = ConnectionBannerProps;

export function BscConnectionBanner({
  state,
  title,
  subtitle,
  onRetry,
  retryLabel,
  testID,
}: BscConnectionBannerProps): React.JSX.Element {
  const reconectando = state === 'reconnecting';

  const accion = reconectando ? (
    <BscSpinner
      tamano="besideField"
      color={BscColors.primary}
      testID={testID === undefined ? undefined : `${testID}-spinner`}
    />
  ) : onRetry !== undefined && retryLabel !== undefined ? (
    <BscTextButton
      label={retryLabel}
      onPress={onRetry}
      color={BscColors.error}
      size="lg"
      testID={testID === undefined ? undefined : `${testID}-retry`}
    />
  ) : undefined;

  return (
    <View style={styles.contenedor} accessibilityLiveRegion="polite">
      <BscBanner
        tone={reconectando ? 'info' : 'danger'}
        icon={reconectando ? undefined : 'cloud-off'}
        title={title}
        subtitle={subtitle}
        trailing={accion}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    ...screenPadding,
    paddingVertical: BscSpacing.xs,
  },
});
