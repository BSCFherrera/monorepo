import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BscColors,
  BscIconTile,
  BscBorderRadius,
  BscShadows,
  BscSpacing,
  BscTypography,
} from '@bsc/ui-native';
import type { BscIconName } from '@bsc/ui-native';

/**
 * Acciones rápidas.
 *
 * Portado de `quick_actions.dart`. Es una tarjeta blanca que **se monta sobre
 * la cabecera**, invadiendo el gradiente: ese solape es lo que da la sensación
 * de dos capas y es fácil perderlo al portar, porque en código no se ve.
 *
 * Cuatro acciones y la última es «Más», no una quinta acción concreta. El
 * original lo resuelve así porque cinco iconos en el ancho de un teléfono
 * quedan apretados y el cliente falla el toque.
 */

export interface AccionRapida {
  clave: string;
  etiqueta: string;
  icono: BscIconName;
  onPress?: (() => void) | undefined;
}

export interface QuickActionsProps {
  acciones: AccionRapida[];
  style?: object;
}

export function QuickActions({
  acciones,
  style,
}: QuickActionsProps): React.JSX.Element {
  return (
    <View style={[styles.tarjeta, style]} testID="acciones-rapidas">
      {acciones.map(accion => (
        <Pressable
          key={accion.clave}
          accessibilityRole="button"
          accessibilityLabel={accion.etiqueta}
          onPress={accion.onPress}
          style={({ pressed }) => [styles.accion, pressed && styles.presionada]}
          testID={`accion-${accion.clave}`}
        >
          <BscIconTile icon={accion.icono} size={42} iconSize={21} />
          <Text style={styles.etiqueta} numberOfLines={2}>
            {accion.etiqueta}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    backgroundColor: BscColors.surface,
    borderRadius: BscBorderRadius.card,
    // El original aprieta la tarjeta a ocho píxeles por lado: cada acción
    // pone su propio aire vertical.
    paddingVertical: BscSpacing.xs,
    paddingHorizontal: BscSpacing.xs,
    ...BscShadows.card,
  },
  accion: {
    alignItems: 'center',
    gap: BscSpacing.xs,
    flex: 1,
    paddingVertical: BscSpacing.sm,
    paddingHorizontal: 2,
  },
  presionada: {
    opacity: 0.6,
  },
  etiqueta: {
    ...BscTypography.actionLabel,
    textAlign: 'center',
  },
});
