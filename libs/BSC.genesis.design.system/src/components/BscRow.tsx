import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing, withAlpha } from '../theme/spacing';
import { BscTypography, BscTextStyles } from '../theme/typography';

import { BscIcon } from './BscIcon';
import type { IconTileProps, ListRowProps, PillProps } from '@bsc/contracts';

/**
 * Primitivas de fila del sistema de diseño.
 *
 * Portadas de `BscIconTile`, `BscListRow`, `BscRowDivider` y `BscPill` en
 * `bsc_ui.dart`. Están juntas y no repartidas por pantalla porque en el
 * original las comparten el dashboard, el detalle de producto, los movimientos
 * y los listados de beneficiarios: cada vez que una pantalla las redibujaba por
 * su cuenta acababa con un tamaño de icono o un interlineado distinto, y la app
 * dejaba de verse de una pieza.
 *
 * Las medidas se copian tal cual del original —40 del recuadro, 20 del icono,
 * 14 de alto de fila— porque son justamente lo que estaba quedando distinto.
 */

// ─── Recuadro de icono ──────────────────────────────────────────────────────

export type BscIconTileProps = IconTileProps;

export function BscIconTile({
  icon,
  color = BscColors.primary,
  background,
  size = 40,
  iconSize = 20,
}: BscIconTileProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.recuadro,
        {
          width: size,
          height: size,
          backgroundColor: background ?? withAlpha(color, 0.1),
        },
      ]}
    >
      <BscIcon name={icon} size={iconSize} color={color} />
    </View>
  );
}

// ─── Fila de lista ──────────────────────────────────────────────────────────

export interface BscListRowProps extends ListRowProps {
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function BscListRow({
  leading,
  title,
  subtitle,
  trailingLabel,
  trailingSubLabel,
  trailingColor,
  trailing,
  onPress,
  showChevron = false,
  testID,
}: BscListRowProps): React.JSX.Element {
  const contenido = (
    <>
      {leading !== undefined ? (
        <View style={styles.delante}>{leading}</View>
      ) : null}

      <View style={styles.centro}>
        <Text style={styles.titulo} numberOfLines={1}>
          {title}
        </Text>
        {subtitle !== undefined ? (
          <Text style={styles.subtitulo} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {trailing !== undefined ? (
        trailing
      ) : trailingLabel !== undefined ? (
        <View style={styles.derecha}>
          <Text
            style={[
              styles.montoFila,
              trailingColor !== undefined ? { color: trailingColor } : null,
            ]}
            numberOfLines={1}
          >
            {trailingLabel}
          </Text>
          {trailingSubLabel !== undefined ? (
            <Text style={styles.subMonto}>{trailingSubLabel}</Text>
          ) : null}
        </View>
      ) : null}

      {showChevron ? (
        <View style={styles.chevron}>
          <BscIcon
            name="chevron-right"
            size={22}
            color={BscColors.textTertiary}
          />
        </View>
      ) : null}
    </>
  );

  if (onPress === undefined) {
    return (
      <View style={styles.fila} testID={testID}>
        {contenido}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        subtitle === undefined ? title : `${title} ${subtitle}`
      }
      onPress={onPress}
      style={({ pressed }) => [styles.fila, pressed && styles.filaPresionada]}
      testID={testID}
    >
      {contenido}
    </Pressable>
  );
}

// ─── Separador ──────────────────────────────────────────────────────────────

/**
 * Línea de un píxel con el mismo margen lateral que las filas, para que no
 * llegue hasta el borde de la tarjeta.
 */
export function BscRowDivider({
  indent = BscSpacing.md,
}: {
  indent?: number;
}): React.JSX.Element {
  return <View style={[styles.separador, { marginHorizontal: indent }]} />;
}

// ─── Píldora ────────────────────────────────────────────────────────────────

export interface BscPillProps extends PillProps {
  style?: ViewStyle;
}

export function BscPill({
  label,
  color = BscColors.primary,
  background,
  icon,
  style,
}: BscPillProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.pildora,
        { backgroundColor: background ?? withAlpha(color, 0.1) },
        style,
      ]}
    >
      {icon !== undefined ? (
        <BscIcon name={icon} size={13} color={color} />
      ) : null}
      <Text style={[styles.textoPildora, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  recuadro: {
    borderRadius: BscRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: BscSpacing.md,
    paddingVertical: 14,
  },
  filaPresionada: {
    backgroundColor: BscColors.surfaceVariant,
  },
  delante: {
    marginRight: BscSpacing.sm,
  },
  centro: {
    flex: 1,
  },
  titulo: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
  subtitulo: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
    marginTop: 2,
  },
  derecha: {
    alignItems: 'flex-end',
  },
  montoFila: BscTypography.amount,
  subMonto: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textTertiary,
    marginTop: 2,
  },
  chevron: {
    marginLeft: BscSpacing.xs,
  },
  separador: {
    height: 1,
    backgroundColor: BscColors.divider,
  },
  pildora: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BscRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  textoPildora: {
    ...BscTextStyles['Caption/12 SemiBold'],
  },
});
