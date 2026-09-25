import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import {
  BscColors,
  BscGradients,
  BscIcon,
  BscRadius,
  BscShadows,
  coloredShadow,
  BscTextStyles,
} from '@bsc/ui-native';
import type { BscIconName } from '@bsc/ui-native';

/**
 * Barra de navegación inferior.
 *
 * Portada de `bsc_bottom_nav.dart`. Cuatro destinos y **una acción central
 * elevada en forma de diamante**, que no es un quinto destino sino el acceso a
 * la acción principal.
 *
 * El diamante lleva el gradiente corto de marca y sobresale por encima de la
 * barra. Es el elemento más reconocible de la navegación y perderlo cambia por
 * completo cómo se ve la app.
 *
 * Las medidas son las del original y van escritas a mano allí donde él también
 * las escribe: 64 de alto, píldora de 14×4, círculo de 56 elevado catorce
 * píxeles. Un token cercano cambiaría el equilibrio de la barra, que es la
 * pieza que más se mira de la app.
 */

export type DestinoNav = 'inicio' | 'transferir' | 'pagos' | 'perfil';

interface Destino {
  clave: DestinoNav;
  etiqueta: string;
  icono: BscIconName;
}

const DESTINOS: readonly Destino[] = [
  { clave: 'inicio', etiqueta: 'Inicio', icono: 'home' },
  { clave: 'transferir', etiqueta: 'Transferir', icono: 'transfer' },
  { clave: 'pagos', etiqueta: 'Pagos', icono: 'receipt' },
  { clave: 'perfil', etiqueta: 'Perfil', icono: 'person' },
];

export interface BscBottomNavProps {
  activo: DestinoNav;
  onSelect: (destino: DestinoNav) => void;
  onAccionCentral?: (() => void) | undefined;
}

export function BscBottomNav({
  activo,
  onSelect,
  onAccionCentral,
}: BscBottomNavProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  // Los dos primeros destinos van a la izquierda del diamante y los dos últimos
  // a la derecha, para que quede centrado.
  const izquierda = DESTINOS.slice(0, 2);
  const derecha = DESTINOS.slice(2);

  return (
    <View style={[styles.contenedor, { paddingBottom: insets.bottom }]}>
      <View style={styles.fila}>
        {izquierda.map(destino => (
          <Boton
            key={destino.clave}
            destino={destino}
            activo={activo === destino.clave}
            onPress={() => onSelect(destino.clave)}
          />
        ))}

        {/* Hueco donde se asienta el diamante. */}
        <View style={styles.hueco} />

        {derecha.map(destino => (
          <Boton
            key={destino.clave}
            destino={destino}
            activo={activo === destino.clave}
            onPress={() => onSelect(destino.clave)}
          />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Acciones"
        onPress={onAccionCentral}
        style={styles.diamante}
        testID="nav-accion-central"
      >
        <LinearGradient
          colors={[...BscGradients.diamond.colors]}
          start={BscGradients.diamond.start}
          end={BscGradients.diamond.end}
          style={styles.diamanteFondo}
        >
          <BscIcon name="diamond" size={24} color={BscColors.textOnDark} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function Boton({
  destino,
  activo,
  onPress,
}: {
  destino: Destino;
  activo: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const color = activo ? BscColors.primary : BscColors.textTertiary;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: activo }}
      accessibilityLabel={destino.etiqueta}
      onPress={onPress}
      style={styles.boton}
      testID={`nav-${destino.clave}`}
    >
      <View style={[styles.iconoBoton, activo && styles.iconoActivo]}>
        <BscIcon name={destino.icono} size={22} color={color} />
      </View>
      <Text
        style={[styles.etiqueta, activo && styles.etiquetaActiva, { color }]}
        numberOfLines={1}
      >
        {destino.etiqueta}
      </Text>
    </Pressable>
  );
}

/** El circulo del centro: 56 de diametro, elevado catorce sobre la barra. */
const TAMANO_DIAMANTE = 56;
const ELEVACION_DIAMANTE = 14;

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: BscColors.surface,
    borderTopLeftRadius: BscRadius.lg,
    borderTopRightRadius: BscRadius.lg,
    ...BscShadows.bar,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
  },
  boton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoBoton: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: BscRadius.pill,
  },
  iconoActivo: {
    backgroundColor: BscColors.primarySoft,
  },
  etiqueta: {
    ...BscTextStyles['Caption/12 Medium'],
    marginTop: 3,
  },
  etiquetaActiva: {
    fontWeight: '600',
  },
  hueco: {
    width: 76,
  },
  diamante: {
    position: 'absolute',
    alignSelf: 'center',
    // Sobresale por encima de la barra: es lo que lo hace reconocible.
    top: -ELEVACION_DIAMANTE,
    width: TAMANO_DIAMANTE,
    height: TAMANO_DIAMANTE,
    borderRadius: TAMANO_DIAMANTE / 2,
    backgroundColor: BscColors.surface,
    padding: 4,
    // Sombra tenida de azul, no gris: en el original el diamante flota con el
    // color de la marca debajo.
    ...coloredShadow(BscColors.primary),
  },
  diamanteFondo: {
    flex: 1,
    borderRadius: TAMANO_DIAMANTE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
