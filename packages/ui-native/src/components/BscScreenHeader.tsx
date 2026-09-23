import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BscColors } from '../theme/colors';
import { BscRadius } from '../theme/spacing';

import { BscGradientSurface } from './BscGradientBackdrop';
import { BscIcon } from './BscIcon';
import type { ScreenHeaderProps } from '@bsc/contracts';
import { BscTextStyles } from '../theme/typography';

/**
 * Barra superior de las pantallas de detalle.
 *
 * Portada del `_buildAppBar` que repiten las pantallas de segundo nivel de la
 * app Flutter: cincuenta y seis de alto, la flecha a la izquierda y **el título
 * centrado de verdad**, con un hueco del mismo ancho a la derecha para que el
 * texto no se desplace.
 *
 * Va sobre el degradado de marca con la esquina inferior redondeada, igual que
 * la cabecera del dashboard, de modo que las dos se lean como la misma familia.
 */

export interface BscScreenHeaderProps extends ScreenHeaderProps {
  /** Contenido extra bajo el título: saldos, pestañas, lo que haga falta. */
  children?: ReactNode;
}

export function BscScreenHeader({
  title,
  onBack,
  children,
  testID,
}: BscScreenHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <BscGradientSurface style={[styles.fondo, { paddingTop: insets.top }]}>
      <View style={styles.barra}>
        {onBack !== undefined ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={onBack}
            hitSlop={12}
            style={styles.volver}
            testID={testID ?? 'volver'}
          >
            <BscIcon
              name="chevron-left"
              size={24}
              color={BscColors.textOnDark}
            />
          </Pressable>
        ) : (
          <View style={styles.volver} />
        )}

        <Text style={styles.titulo} numberOfLines={1}>
          {title}
        </Text>

        {/* Mismo ancho que el botón: sin él, el título queda descentrado. */}
        <View style={styles.volver} />
      </View>

      {children}
    </BscGradientSurface>
  );
}

const styles = StyleSheet.create({
  fondo: {
    borderBottomLeftRadius: BscRadius.sheet,
    borderBottomRightRadius: BscRadius.sheet,
  },
  barra: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  volver: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    flex: 1,
    textAlign: 'center',
    color: BscColors.textOnDark,
    ...BscTextStyles['Body L/18 SemiBold'],
  },
});
