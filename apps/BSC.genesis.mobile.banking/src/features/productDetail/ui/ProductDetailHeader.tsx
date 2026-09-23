import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BscColors,
  BscGradientSurface,
  BscGradients,
  BscIcon,
  BscRadius,
  BscSpacing,
  withAlpha,
  BscTextStyles,
  fontFamily,
} from '@bsc/ui-native';
import type { BscGradient } from '@bsc/ui-native';

/**
 * Cabecera con degradado del detalle de producto.
 *
 * Portada de `ProductDetailHeader` en `product_detail_chrome.dart`, que todas
 * las pantallas de detalle comparten. Su forma: la flecha a la izquierda con el
 * título centrado, y debajo el número del producto, la etiqueta del saldo y el
 * saldo grande con los centavos pequeños.
 *
 * El degradado cambia según la moneda —azul para pesos, azul y verde para
 * dólares— porque es lo único que distingue de un vistazo una cuenta en dólares
 * de una en pesos cuando el número está enmascarado.
 */

export interface ProductDetailHeaderProps {
  title: string;
  /** El número enmascarado del producto. */
  subtitle?: string | undefined;
  /** Saldo ya formateado. Sin él la cabecera queda solo con el título. */
  balance?: string | undefined;
  balanceLabel?: string;
  gradient?: BscGradient;
  onBack: () => void;
  /**
   * A la derecha de la barra superior. Es donde la tarjeta de crédito pone su
   * selector de moneda, y por eso el hueco espejo del botón atrás crece cuando
   * hay algo: con 48 fijos el selector no cabe.
   */
  trailing?: ReactNode;
  /**
   * Contenido propio sobre el degradado, bajo el saldo. La tarjeta de crédito
   * mete aquí su tarjeta de resumen y sus acciones de marca, que es lo que
   * hace que floten sobre el azul en vez de empezar la página en blanco.
   */
  children?: ReactNode;
}

/**
 * Separa los centavos, igual que en el dashboard: el saldo se lee como una
 * cifra y no como una ristra de dígitos.
 */
function partirMonto(formateado: string): { entero: string; centavos: string } {
  const punto = formateado.lastIndexOf('.');
  if (punto === -1) return { entero: formateado, centavos: '' };
  return {
    entero: formateado.slice(0, punto),
    centavos: formateado.slice(punto),
  };
}

const HERO = 34;

export function ProductDetailHeader({
  title,
  subtitle,
  balance,
  balanceLabel = 'Saldo disponible',
  gradient = BscGradients.accountCard,
  onBack,
  trailing,
  children,
}: ProductDetailHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const partes = balance === undefined ? null : partirMonto(balance);

  return (
    <BscGradientSurface
      gradient={gradient}
      style={[styles.fondo, { paddingTop: insets.top + BscSpacing.xs }]}
    >
      <View style={styles.barra}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={onBack}
          hitSlop={12}
          style={styles.hueco}
          testID="detalle-volver"
        >
          <BscIcon name="chevron-left" size={22} color={BscColors.textOnDark} />
        </Pressable>

        <View style={styles.centro}>
          <Text style={styles.titulo} numberOfLines={1}>
            {title}
          </Text>
          {/* Cuando hay saldo, el número va debajo junto a él; si no lo hay,
              acompaña al título para que la cabecera no quede coja. */}
          {subtitle !== undefined && balance === undefined ? (
            <Text style={styles.subtituloEnBarra} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Espejo del botón: sin él el título queda descentrado. Crece cuando
            lleva contenido, que es lo que hace el original con su
            `ConstrainedBox(minWidth: 48)`. */}
        {trailing === undefined ? (
          <View style={styles.hueco} />
        ) : (
          <View style={styles.huecoConContenido}>{trailing}</View>
        )}
      </View>

      {partes !== null ? (
        <View style={styles.bloqueSaldo}>
          {subtitle !== undefined ? (
            <Text style={styles.numero}>{subtitle}</Text>
          ) : null}

          <Text style={styles.etiquetaSaldo}>{balanceLabel}</Text>

          <View style={styles.filaMonto}>
            <Text style={styles.montoEntero} testID="detalle-saldo">
              {partes.entero}
            </Text>
            <Text style={styles.montoCentavos}>{partes.centavos}</Text>
          </View>
        </View>
      ) : null}

      {children !== undefined ? (
        <View style={styles.contenidoPropio}>{children}</View>
      ) : null}
    </BscGradientSurface>
  );
}

const styles = StyleSheet.create({
  fondo: {
    borderBottomLeftRadius: BscRadius.sheet,
    borderBottomRightRadius: BscRadius.sheet,
    paddingBottom: BscSpacing.lg,
  },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: BscSpacing.xs,
  },
  hueco: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: {
    flex: 1,
    alignItems: 'center',
  },
  titulo: {
    color: BscColors.textOnDark,
    ...BscTextStyles['Body MD/16 SemiBold'],
  },
  subtituloEnBarra: {
    color: withAlpha('#FFFFFF', 0.72),
    ...BscTextStyles['Caption/12 Regular'],
  },
  bloqueSaldo: {
    alignItems: 'center',
    marginTop: BscSpacing.md,
  },
  numero: {
    color: withAlpha('#FFFFFF', 0.72),
    ...BscTextStyles['Caption/12 Regular'],
    marginBottom: BscSpacing.sm,
  },
  etiquetaSaldo: {
    color: withAlpha('#FFFFFF', 0.78),
    ...BscTextStyles['Caption/12 Regular'],
    marginBottom: 2,
  },
  filaMonto: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: BscSpacing.lg,
  },
  montoEntero: {
    color: BscColors.textOnDark,
    fontFamily,
    fontSize: HERO,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: HERO * 1.1,
  },
  montoCentavos: {
    color: BscColors.textOnDark,
    fontFamily,
    fontSize: HERO * 0.62,
    fontWeight: '600',
    letterSpacing: -1,
  },
  huecoConContenido: {
    minWidth: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: BscSpacing.xs,
  },
  contenidoPropio: {
    paddingHorizontal: BscSpacing.gutter,
    marginTop: BscSpacing.sm,
  },
});
