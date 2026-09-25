import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BscColors,
  BscIcon,
  BscRadius,
  BscShadows,
  withAlpha,
  type BscIconName,
  BscTextStyles,
} from '@bsc/ui-native';

/**
 * La barra y las acciones que el detalle de un producto pone alrededor de su
 * contenido.
 *
 * Portadas de `ProductActionBar` y `ProductBrandAction` en
 * `product_detail_chrome.dart`.
 *
 * La barra mezcla a propósito dos cosas que suelen ir separadas: **pestañas y
 * acciones**. Las pestañas cambian lo que se ve —resumen o actividad— y las
 * acciones abren una hoja. Por eso una entrada marcada como acción nunca se
 * dibuja seleccionada, aunque se acabe de tocar: quedaría encendida indicando
 * una pestaña que no existe.
 *
 * Medidas literales del original: 62 de alto de barra, icono de 21 dentro de
 * una cápsula de 12×3, texto de 10, y el recuadro de la acción de marca de 42
 * con el icono a 20 sobre blanco al 16 % y borde al 22 %.
 */

export interface ProductActionItem {
  label: string;
  icon: BscIconName;
  /**
   * Abre una hoja en vez de cambiar de pestaña. Nunca se dibuja seleccionada.
   */
  isAction?: boolean;
}

export interface ProductActionBarProps {
  items: readonly ProductActionItem[];
  currentIndex: number;
  onPress: (index: number) => void;
  testID?: string;
}

export function ProductActionBar({
  items,
  currentIndex,
  onPress,
  testID,
}: ProductActionBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.barra, { paddingBottom: insets.bottom }]}
      testID={testID}
    >
      <View style={styles.filaDeBarra}>
        {items.map((item, indice) => {
          const activo = item.isAction !== true && indice === currentIndex;
          const color = activo ? BscColors.primary : BscColors.textTertiary;

          return (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: activo }}
              accessibilityLabel={item.label}
              onPress={() => onPress(indice)}
              style={styles.celda}
              testID={
                testID === undefined ? undefined : `${testID}-${item.label}`
              }
            >
              <View
                style={[styles.capsula, activo ? styles.capsulaActiva : null]}
              >
                <BscIcon name={item.icon} size={21} color={color} />
              </View>
              <Text
                style={[
                  styles.etiquetaDeBarra,
                  { color },
                  activo ? styles.etiquetaActiva : null,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export interface ProductBrandActionProps {
  icon: BscIconName;
  label: string;
  /** Línea pequeña bajo la etiqueta: «1,240 pts». */
  caption?: string | undefined;
  onPress: () => void;
  testID?: string;
}

/**
 * Acción blanca sobre el degradado, dentro de la cabecera del producto.
 *
 * Lleva su propio `flex: 1` porque en el original es un `Expanded`: las cuatro
 * acciones reparten el ancho por igual.
 */
export function ProductBrandAction({
  icon,
  label,
  caption,
  onPress,
  testID,
}: ProductBrandActionProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.accionDeMarca}
      testID={testID}
    >
      <View style={styles.recuadroDeMarca}>
        <BscIcon name={icon} size={20} color={BscColors.textOnDark} />
      </View>
      <Text style={styles.etiquetaDeMarca} numberOfLines={1}>
        {label}
      </Text>
      {caption === undefined ? null : (
        <Text style={styles.leyendaDeMarca} numberOfLines={1}>
          {caption}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  barra: {
    backgroundColor: BscColors.surface,
    borderTopLeftRadius: BscRadius.lg,
    borderTopRightRadius: BscRadius.lg,
    ...BscShadows.bar,
  },
  filaDeBarra: {
    flexDirection: 'row',
    height: 62,
  },
  celda: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsula: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: BscRadius.pill,
  },
  capsulaActiva: {
    backgroundColor: BscColors.primarySoft,
  },
  etiquetaDeBarra: {
    marginTop: 3,
    ...BscTextStyles['Caption/12 Medium'],
  },
  etiquetaActiva: {
    fontWeight: '600',
  },
  accionDeMarca: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  recuadroDeMarca: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BscRadius.sm,
    backgroundColor: withAlpha('#FFFFFF', 0.16),
    borderWidth: 1,
    borderColor: withAlpha('#FFFFFF', 0.22),
  },
  etiquetaDeMarca: {
    marginTop: 6,
    color: BscColors.textOnDark,
    ...BscTextStyles['Caption/12 Medium'],
  },
  leyendaDeMarca: {
    color: withAlpha('#FFFFFF', 0.7),
    ...BscTextStyles['Caption/12 Regular'],
  },
});

/**
 * Aire al final del contenido, para que la barra flotante no tape la última
 * fila. Son los 110 que reserva el original con su último `SliverToBoxAdapter`.
 */
export const ESPACIO_BAJO_LA_BARRA = 110;
