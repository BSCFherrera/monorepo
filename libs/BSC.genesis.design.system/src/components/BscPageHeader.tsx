import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';

import { BscGradientSurface } from './BscGradientBackdrop';
import { BscIcon } from './BscIcon';
import { text } from '../tokens';
import type { PageHeaderProps } from '@bsc/contracts';
import { BscTextStyles } from '../theme/typography';

/**
 * Cabecera de las pantallas de primer nivel.
 *
 * Portada de `BscPageHeader` en `bsc_ui.dart`, y **no es la misma que
 * `BscScreenHeader`**. La diferencia es deliberada en el original y conviene
 * conservarla: `BscScreenHeader` es la barra de una pantalla de detalle —56 de
 * alto, título de 17 centrado— mientras que esta es una portada, con el título
 * a 24 alineado a la izquierda y un subtítulo debajo. Pantallas como
 * Beneficiarios o Tasa de cambio llegan desde un listado y se presentan; el
 * detalle de un producto continúa una navegación y solo se rotula.
 *
 * Medidas literales del original: margen de 20 a los lados, 16 arriba sobre el
 * área segura y 20 abajo; flecha de 32×32 con 8 de separación.
 */

export interface BscPageHeaderProps extends PageHeaderProps {
  /** Contenido a la derecha del título. */
  trailing?: ReactNode;
  /** Contenido bajo el título, separado por 16: un buscador, unas píldoras. */
  bottom?: ReactNode;
}

export function BscPageHeader({
  title,
  subtitle,
  onBack,
  trailing,
  bottom,
  testID,
}: BscPageHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <BscGradientSurface
      style={[styles.fondo, { paddingTop: insets.top + BscSpacing.md }]}
    >
      <View style={styles.fila}>
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
              size={19}
              color={BscColors.textOnDark}
            />
          </Pressable>
        ) : null}

        <View style={styles.textos}>
          <Text style={styles.titulo} numberOfLines={1}>
            {title}
          </Text>
          {subtitle !== undefined ? (
            <Text style={styles.subtitulo} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {trailing}
      </View>

      {bottom !== undefined ? <View style={styles.abajo}>{bottom}</View> : null}
    </BscGradientSurface>
  );
}

const styles = StyleSheet.create({
  fondo: {
    borderBottomLeftRadius: BscRadius.sheet,
    borderBottomRightRadius: BscRadius.sheet,
    paddingHorizontal: BscSpacing.gutter,
    paddingBottom: BscSpacing.lg,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volver: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: BscSpacing.xs,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    color: BscColors.textOnDark,
    ...BscTextStyles['Title XS/24 Bold'],
  },
  subtitulo: {
    marginTop: 2,
    color: text.onDarkMuted,
    ...BscTextStyles['Body S/14 Regular'],
  },
  abajo: {
    marginTop: BscSpacing.md,
  },
});
