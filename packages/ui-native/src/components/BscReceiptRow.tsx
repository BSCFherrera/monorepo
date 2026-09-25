import { StyleSheet, Text, View } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, withAlpha } from '../theme/spacing';
import {
  receiptTokens as M,
  RECEIPT_ICON_BACKGROUND_OPACITY,
} from '../componentTokens';

import { BscIcon } from './BscIcon';
import type { ReceiptRowProps } from '@bsc/contracts';
import { fontFamily } from '../theme/typography';

/**
 * La fila de un comprobante: icono en su caja, nombre y número a la izquierda,
 * importe y su etiqueta a la derecha.
 *
 * Es `_receiptRow`, y el original la escribe **idéntica en los dos
 * comprobantes** —el de transferencias y el de pagos—, así que aquí vive una
 * sola vez. Vive en el sistema de diseño y no en una de las dos features
 * porque las dos la necesitan y ninguna debe depender de la otra.
 *
 * **La caja del icono no es decorativa.** Sin ella el icono queda suelto y la
 * fila pierde el peso visual que el original le da; el porte la había omitido
 * en los dos comprobantes y se descubrió comparando en el Pixel.
 */

export type BscReceiptRowProps = ReceiptRowProps;

export function BscReceiptRow({
  icon,
  iconColor = BscColors.secondary,
  title,
  subtitle,
  trailing,
  trailingLabel,
  testID,
}: BscReceiptRowProps): React.JSX.Element {
  return (
    <View style={styles.fila} testID={testID}>
      <View
        style={[
          styles.cajaDelIcono,
          {
            backgroundColor: withAlpha(iconColor, RECEIPT_ICON_BACKGROUND_OPACITY),
          },
        ]}
      >
        <BscIcon name={icon} size={M.row.icon} color={iconColor} />
      </View>

      <View style={styles.textos}>
        <Text style={styles.titulo} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitulo} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.derecha}>
        <Text style={styles.importe}>{trailing}</Text>
        <Text style={styles.etiqueta}>{trailingLabel}</Text>
      </View>
    </View>
  );
}

export const receiptRowStyles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: M.row.gap,
  },
  cajaDelIcono: {
    width: M.row.iconBox,
    height: M.row.iconBox,
    borderRadius: BscRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1 },
  titulo: {
    fontFamily,
    fontSize: M.row.titleFontSize,
    fontWeight: '600',
    color: BscColors.textPrimary,
  },
  subtitulo: {
    fontFamily,
    fontSize: M.row.subtitleFontSize,
    color: BscColors.textSecondary,
  },
  derecha: { alignItems: 'flex-end' },
  importe: {
    fontFamily,
    fontSize: M.row.amountFontSize,
    fontWeight: '700',
    color: BscColors.primary,
  },
  etiqueta: {
    fontFamily,
    fontSize: M.row.tagFontSize,
    color: BscColors.textSecondary,
  },
});

const styles = receiptRowStyles;
