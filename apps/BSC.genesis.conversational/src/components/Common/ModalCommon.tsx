import React, {useMemo} from 'react';
import {Animated, Modal, StyleSheet, Pressable, StyleProp, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useKeyboardOffset} from '@hooks/useKeyboardOffset';
import {SPACING} from '@constants/theme';

interface ModalCommonProps {
  /** Controla la visibilidad del modal */
  visible: boolean;
  /** Función para cerrar el modal (ej. presionar el fondo) */
  onClose: () => void;
  /** Contenido interno que renderizará el modal */
  children: React.ReactNode;
  /** Estilos opcionales para personalizar el contenedor del contenido */
  contentStyle?: StyleProp<ViewStyle>;
  /** Tipo de animación nativa ('slide', 'fade' o 'none'). Por defecto es 'slide' */
  animationType?: 'none' | 'slide' | 'fade';
  /** Si `false`, deshabilita el cierre tocando fuera del modal o con el botón físico/gestual de
   * back de Android; solo queda disponible la vía de cierre que ofrezca el contenido (ej. un
   * botón propio). Por defecto es `true` */
  closeOnBackdropPress?: boolean;
}

export const ModalCommon: React.FC<ModalCommonProps> = ({
  visible,
  onClose,
  children,
  contentStyle,
  animationType = 'slide',
  closeOnBackdropPress = true,
}) => {
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset();

  // Respiro visual fijo (mismo en todos los dispositivos) más el inset de seguridad inferior
  // cuando existe (barra de gestos/home indicator): así el contenido nunca queda pegado al
  // borde, con o sin gestos, en vez de depender de un valor único que sirva de "uno u otro".
  const dynamicPaddingStyle = useMemo(
    () => ({
      paddingBottom: SPACING.md + insets.bottom,
    }),
    [insets.bottom],
  );

  const handleRequestClose = closeOnBackdropPress ? onClose : () => {};

  return (
    <Modal
      transparent
      visible={visible}
      animationType={animationType}
      onRequestClose={handleRequestClose}
      statusBarTranslucent
      navigationBarTranslucent
      hardwareAccelerated>
      <Pressable style={styles.backdrop} onPress={handleRequestClose}>
        <Animated.View style={[styles.keyboardAvoiding, {paddingBottom: keyboardOffset}]}>
          <Pressable
            style={[styles.contentContainer, dynamicPaddingStyle, contentStyle]}
            onPress={e => e.stopPropagation()}>
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoiding: {
    width: '100%',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    width: '100%',
  },
});
