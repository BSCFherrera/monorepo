import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { BscColors } from '../theme/colors';
import { BscBorderRadius, BscShadows, BscSpacing } from '../theme/spacing';
import { BscTypography, BscTextStyles } from '../theme/typography';
import type { CardProps } from '@bsc/contracts';

/**
 * Tarjeta de contenido.
 *
 * Portada de `BscCard` en `bsc_ui.dart`. La sombra es deliberadamente suave: en
 * los diseños separa capas, nunca decora.
 */
export interface BscCardProps extends CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function BscCard({
  children,
  onPress,
  style,
  testID,
}: BscCardProps): React.JSX.Element {
  if (onPress === undefined) {
    return (
      <View style={[styles.tarjeta, style]} testID={testID}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tarjeta,
        pressed && styles.presionada,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

/**
 * Encabezado de sección: un título y, a la derecha, un texto informativo
 * («2 pendientes») o una acción («Ver todos»).
 *
 * El margen lateral lo pone quien lo usa, porque en esta app las secciones ya
 * viven dentro de un contenedor con el margen de pantalla.
 */
export function BscSectionHeader({
  title,
  actionLabel,
  onAction,
  trailingText,
  style,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  trailingText?: string;
  style?: ViewStyle;
}): React.JSX.Element {
  return (
    <View style={[styles.encabezado, style]}>
      <Text style={styles.tituloSeccion}>{title}</Text>
      {trailingText !== undefined ? (
        <Text style={styles.textoDerecha}>{trailingText}</Text>
      ) : null}
      {actionLabel !== undefined && onAction !== undefined ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text style={styles.accion}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Estado vacío, de error o de carga con mensaje.
 *
 * Existe como componente propio porque el catálogo de pantallas exige que
 * **cada superficie tenga estos estados definidos**, y tenerlos dispersos es la
 * forma segura de que alguno quede sin hacer.
 */
export function BscPlaceholder({
  title,
  message,
  action,
  tone = 'neutral',
  testID,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
  tone?: 'neutral' | 'error';
  testID?: string;
}): React.JSX.Element {
  return (
    <View style={styles.placeholder} testID={testID}>
      <Text
        style={[
          styles.placeholderTitulo,
          tone === 'error' && styles.placeholderTituloError,
        ]}
      >
        {title}
      </Text>
      {message !== undefined ? (
        <Text style={styles.placeholderMensaje}>{message}</Text>
      ) : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: BscColors.surface,
    borderRadius: BscBorderRadius.card,
    padding: BscSpacing.md,
    ...BscShadows.card,
  },
  presionada: {
    backgroundColor: BscColors.surfaceVariant,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: BscSpacing.sm,
  },
  tituloSeccion: {
    ...BscTypography.titleLarge,
    flex: 1,
  },
  textoDerecha: {
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.textSecondary,
  },
  accion: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.primary,
    marginLeft: BscSpacing.sm,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: BscSpacing.xs,
    paddingVertical: BscSpacing.xxl,
    paddingHorizontal: BscSpacing.lg,
  },
  placeholderTitulo: {
    ...BscTypography.titleMedium,
    textAlign: 'center',
  },
  placeholderTituloError: {
    color: BscColors.error,
  },
  placeholderMensaje: {
    ...BscTypography.bodyMedium,
    textAlign: 'center',
  },
});
