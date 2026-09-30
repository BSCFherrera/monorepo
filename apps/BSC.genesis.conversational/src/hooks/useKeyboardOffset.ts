import {useEffect, useRef} from 'react';
import {Animated, Keyboard, Platform} from 'react-native';

// Android no reporta una duración fiable en sus eventos de teclado ('Did', no 'Will');
// este valor fijo evita saltos bruscos al animar en esa plataforma.
const ANDROID_ANIM_DURATION = 220;

/**
 * Alternativa a `KeyboardAvoidingView`: anima un valor a la altura real del teclado
 * (tomada del propio evento nativo) en vez de depender de su cálculo interno de
 * altura/padding, que en Android con edge-to-edge (targetSdk 35) queda desincronizado
 * tras un ciclo de apertura/cierre y deja un espacio residual debajo del contenido.
 * Aplicar el valor devuelto como `paddingBottom` del contenedor que debe encogerse
 * hace que el reposo (teclado cerrado) siempre vuelva exactamente a 0.
 */
export const useKeyboardOffset = () => {
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, event => {
      Animated.timing(keyboardOffset, {
        toValue: event.endCoordinates?.height ?? 0,
        duration: event.duration || ANDROID_ANIM_DURATION,
        useNativeDriver: false,
      }).start();
    });

    const hideSubscription = Keyboard.addListener(hideEvent, event => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: event?.duration || ANDROID_ANIM_DURATION,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardOffset]);

  return keyboardOffset;
};
