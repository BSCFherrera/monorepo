import {useCallback} from 'react';
import {BackHandler} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

/**
 * Intercepta el back nativo de Android (botón/gesto) mientras la pantalla está enfocada,
 * evitando el comportamiento por defecto (retroceder o cerrar la app). Útil para bloquear
 * el back en pantallas finales de un flujo. No usar para replicar un "goBack" normal: eso
 * ya lo maneja @react-navigation/native-stack de forma nativa.
 * En iOS no tiene efecto, ya que no existe el botón físico/gestual equivalente.
 */
export const useAndroidBackHandler = (onBackPress: () => void) => {
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        onBackPress();
        return true;
      });

      return () => subscription.remove();
    }, [onBackPress]),
  );
};
