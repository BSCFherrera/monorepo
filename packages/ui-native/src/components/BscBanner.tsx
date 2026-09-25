import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing, withAlpha } from '../theme/spacing';

import { BscIcon } from './BscIcon';
import type { BannerProps, BannerTone } from '@bsc/contracts';
import { BscTextStyles } from '../theme/typography';

/**
 * Aviso en línea con fondo teñido.
 *
 * Portado de `BscBanner` y `BannerTone` en `bsc_ui.dart`. Es la pieza con la
 * que el original anuncia una fecha de vencimiento, un pago vencido o una
 * capacidad que todavía no está en la app, y aparece dentro de tarjetas y de
 * hojas por igual.
 *
 * El tono decide los dos colores a la vez —el texto y el fondo— y nunca se
 * eligen por separado: en el original el fondo es siempre la variante suave del
 * mismo color del texto, que es lo que hace que el aviso se lea como un bloque
 * y no como texto de color sobre un rectángulo.
 *
 * Medidas literales: 14 de relleno horizontal y 12 vertical, icono de 18,
 * título de 13 en seminegrita y subtítulo de 12 al 85 % del mismo color.
 */
export type BscBannerTone = BannerTone;

const TINTES: Record<BscBannerTone, { texto: string; fondo: string }> = {
  success: { texto: BscColors.success, fondo: BscColors.successSoft },
  info: { texto: BscColors.primary, fondo: BscColors.primarySoft },
  warning: { texto: BscColors.warning, fondo: BscColors.warningSoft },
  danger: { texto: BscColors.error, fondo: BscColors.errorSoft },
  neutral: { texto: BscColors.textSecondary, fondo: BscColors.surfaceVariant },
};

export interface BscBannerProps extends BannerProps {
  trailing?: ReactNode;
}

export function BscBanner({
  title,
  subtitle,
  icon,
  tone = 'success',
  trailing,
  onPress,
  testID,
}: BscBannerProps): React.JSX.Element {
  const tinte = TINTES[tone];

  const contenido = (
    <View style={styles.fila}>
      {icon === undefined ? null : (
        <BscIcon name={icon} size={18} color={tinte.texto} />
      )}

      <View style={styles.textos}>
        <Text style={[styles.titulo, { color: tinte.texto }]}>{title}</Text>
        {subtitle === undefined ? null : (
          <Text
            style={[styles.subtitulo, { color: withAlpha(tinte.texto, 0.85) }]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {trailing}
    </View>
  );

  if (onPress === undefined) {
    return (
      <View
        style={[styles.contenedor, { backgroundColor: tinte.fondo }]}
        testID={testID}
      >
        {contenido}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.contenedor,
        { backgroundColor: tinte.fondo },
        pressed ? styles.presionado : null,
      ]}
    >
      {contenido}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    borderRadius: BscRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: BscSpacing.sm,
    /*
      La banda ocupa el ancho de su contenedor **siempre**, y esto no es una
      preferencia estética. Dentro de un padre con `alignItems: 'center'` la
      banda se encogería al tamaño de su contenido; como la columna de textos
      usa `flex: 1`, se quedaría en cero y el aviso se reduciría a su icono.
      Ocurrió en la pantalla del token (V-05) y costó una sesión encontrarlo,
      porque la banda *sí* estaba en el árbol: lo que faltaba era el ancho.
    */
    alignSelf: 'stretch',
  },
  presionado: {
    opacity: 0.85,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.sm,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    ...BscTextStyles['Body S/14 SemiBold'],
  },
  subtitulo: {
    ...BscTextStyles['Caption/12 Regular'],
    marginTop: 2,
  },
});
