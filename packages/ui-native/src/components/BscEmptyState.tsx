import { StyleSheet, Text, View } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscSpacing } from '../theme/spacing';
import { BscTypography } from '../theme/typography';

import { BscPrimaryButton } from './BscButton';
import { BscIcon } from './BscIcon';
import type { EmptyStateProps } from '@bsc/contracts';

/**
 * Estado vacío o de error, con su icono y su salida.
 *
 * Portado de `BscEmptyState` en `bsc_ui.dart`. Se distingue de
 * `BscPlaceholder`, que es texto sin más: este lleva el círculo de 72 con el
 * icono de 32 dentro y, cuando hay algo que reintentar, un botón de 200 de
 * ancho y 46 de alto. Las tres medidas son del original.
 *
 * La acción es opcional a propósito. «Aún no tienes beneficiarios» no tiene
 * botón porque no hay nada que reintentar; «no pudimos cargarlos» sí.
 */

export type BscEmptyStateProps = EmptyStateProps;

export function BscEmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  testID,
}: BscEmptyStateProps): React.JSX.Element {
  return (
    <View style={styles.centro} testID={testID}>
      <View style={styles.circulo}>
        <BscIcon name={icon} size={32} color={BscColors.textTertiary} />
      </View>

      <Text style={styles.titulo}>{title}</Text>

      {message !== undefined ? (
        <Text style={styles.mensaje}>{message}</Text>
      ) : null}

      {actionLabel !== undefined && onAction !== undefined ? (
        <View style={styles.zonaBoton}>
          <BscPrimaryButton
            label={actionLabel}
            onPress={onAction}
            style={styles.boton}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: BscSpacing.xxl,
  },
  circulo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BscColors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    ...BscTypography.titleMedium,
    marginTop: BscSpacing.md,
    textAlign: 'center',
  },
  mensaje: {
    ...BscTypography.bodyMedium,
    marginTop: BscSpacing.xs,
    textAlign: 'center',
  },
  zonaBoton: {
    marginTop: BscSpacing.lg,
    width: 200,
  },
  boton: {
    height: 46,
  },
});
