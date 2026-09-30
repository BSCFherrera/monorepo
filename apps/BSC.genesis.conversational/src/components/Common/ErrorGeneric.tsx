import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {ModalCommon} from '@components/Common/ModalCommon';
import {Button} from '@components/Button';
import {BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

interface ErrorGenericProps {
  visible: boolean;
  onClose: () => void;
  /** Título del modal */
  title: string;
  /** Texto que va dentro del recuadro informativo */
  description: string;
  /** Ícono o imagen a mostrar arriba del título (ej. un ícono de `@react-native-vector-icons/feather` o una `Image`) */
  icon: React.ReactNode;
  /** Texto del botón de cierre. Por defecto: "Cerrar" */
  closeButtonLabel?: string;
}

/**
 * Modal de error genérico y reutilizable: título + recuadro de descripción + ícono/imagen
 * personalizables. A diferencia de `ErrorGeneral`/`ErrorServiceGeneral`, no está atado a ningún
 * flujo ni texto fijo, y su única acción es cerrarse (botón o toque fuera del modal).
 */
export const ErrorGeneric: React.FC<ErrorGenericProps> = ({
  visible,
  onClose,
  title,
  description,
  icon,
  closeButtonLabel = 'Cerrar',
}) => {
  return (
    <ModalCommon visible={visible} onClose={onClose}>
      <View style={styles.iconContainer}>{icon}</View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>{description}</Text>
      </View>

      <Button title={closeButtonLabel} fullWidth onPress={onClose} />
    </ModalCommon>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  messageBox: {
    backgroundColor: '#F6FBFF',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});
