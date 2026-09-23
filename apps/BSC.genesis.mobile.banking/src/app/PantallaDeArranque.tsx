import { Image, StyleSheet, View } from 'react-native';

import { BscColors, BscLogo, BscSpacing, BscSpinner } from '@bsc/ui-native';

import fondoDeAcceso from '../features/auth/assets/fondo-de-acceso.jpg';

/**
 * Lo que se ve mientras la aplicación decide si hay sesión.
 *
 * **Qué pasa en esos instantes.** Antes de poder enseñar nada, el arranque lee
 * el nombre recordado, la marca del último acceso, la versión instalada y las
 * capacidades biométricas del teléfono, y si hay un token guardado lo valida
 * contra el banco. Eso último es un viaje de red: en una conexión mala se nota.
 * Antes aquí había un indicador de carga girando sobre el fondo gris del
 * sistema, que es lo que trae cualquier aplicación a medio hacer.
 *
 * **Por qué el logotipo y no solo el indicador.** El arranque es la primera
 * pantalla del producto y la única que el cliente ve siempre, tenga sesión o no.
 * Con la foto de la pantalla de acceso y el logotipo, esa espera se lee como
 * parte de la banca; con un indicador suelto, como una pantalla que aún no
 * cargó.
 *
 * **El fondo es el de la pantalla de lanzamiento y el de la de acceso**: la
 * misma `fondo-de-acceso.jpg`, con su velo ya aplicado. Así el cliente ve una
 * sola imagen desde que toca el icono hasta que puede entrar.
 *
 * **Tiene un gemelo nativo en Android.** `res/drawable/fondo_de_arranque.xml`
 * dibuja la misma foto y el logotipo a 64 dp centrado, porque Android pinta el
 * fondo de la ventana antes de que exista React Native. **Si se cambia el alto
 * del logotipo aquí, hay que cambiarlo también allí.**
 */
export function PantallaDeArranque(): React.JSX.Element {
  return (
    <View style={styles.fondo}>
      <Image source={fondoDeAcceso} resizeMode="cover" style={styles.foto} />
      <View style={styles.centro} testID="arranque">
        <BscLogo height={ALTO_DEL_LOGOTIPO} />
        <BscSpinner
          tamano="fullScreen"
          color={BscColors.textOnDark}
          style={styles.indicador}
        />
      </View>
    </View>
  );
}

/** En dp, y **replicado** en `fondo_de_arranque.xml`. */
const ALTO_DEL_LOGOTIPO = 64;

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    // El promedio de la foto con su velo, mientras la imagen se decodifica.
    backgroundColor: '#1A1718',
  },
  // Ancho y alto explícitos: los de la imagen importada ganarían a
  // `absoluteFill` (ver la misma nota en LoginScreen.tsx).
  foto: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // El indicador va debajo del logotipo y no encima ni en su lugar: el
  // logotipo es el que ancla la pantalla, y el indicador solo dice que algo
  // sigue ocurriendo.
  indicador: {
    marginTop: BscSpacing.xl,
  },
});
