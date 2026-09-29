import React from 'react';
import {Animated, Modal, StyleSheet, Pressable, StyleProp, ViewStyle} from 'react-native';
import {useKeyboardOffset} from '@hooks/useKeyboardOffset';

interface ModalCenteredProps {
  /** Controla la visibilidad del modal */
  visible: boolean;
  /** Función para cerrar el modal (ej. presionar el fondo) */
  onClose: () => void;
  /** Contenido interno que renderizará el modal */
  children: React.ReactNode;
  /** Estilos opcionales para personalizar el contenedor del contenido */
  contentStyle?: StyleProp<ViewStyle>;
  /** Tipo de animación nativa ('slide', 'fade' o 'none'). Por defecto es 'fade' */
  animationType?: 'none' | 'slide' | 'fade';
}

export const ModalCentered: React.FC<ModalCenteredProps> = ({
  visible,
  onClose,
  children,
  contentStyle,
  animationType = 'fade',
}) => {
  const keyboardOffset = useKeyboardOffset();

  return (
    <Modal
      transparent
      visible={visible}
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
      hardwareAccelerated>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.keyboardAvoiding, {paddingBottom: keyboardOffset}]}>
          <Pressable
            style={[styles.contentContainer, contentStyle]}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardAvoiding: {
    width: '100%',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    maxWidth: '100%',
  },
});
