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
import { BscIcon, type BscIconName } from './BscIcon';
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

export interface BscInfoCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconName?: BscIconName;
  iconBackgroundColor?: string;
  children?: ReactNode;
  testID?: string;
  style?: ViewStyle;
}

export interface BscActionCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconName?: BscIconName;
  variant?: 'standard' | 'registration';
  onPress: () => void;
  disabled?: boolean;
  actionLabel?: string;
  testID?: string;
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

export function BscInfoCard({
  title,
  subtitle,
  icon,
  iconName,
  iconBackgroundColor,
  children,
  testID,
  style,
}: BscInfoCardProps): React.JSX.Element {
  const iconContent = icon ?? (iconName !== undefined ? <BscIcon name={iconName} size={24} color={BscColors.primary} /> : null);

  return (
    <View testID={testID} style={[styles.infoCard, style]}>
      {iconContent !== null ? (
        <View style={[styles.infoCardIconCircle, { backgroundColor: iconBackgroundColor ?? BscColors.surface }]}>
          {iconContent}
        </View>
      ) : null}
      <View style={styles.infoCardTextContainer}>
        <Text style={styles.infoCardTitle}>{title}</Text>
        {subtitle !== undefined ? <Text style={styles.infoCardSubtitle}>{subtitle}</Text> : null}
        {children}
      </View>
    </View>
  );
}

export function BscActionCard({
  title,
  subtitle,
  icon,
  iconName,
  variant = 'standard',
  onPress,
  disabled = false,
  actionLabel,
  testID,
}: BscActionCardProps): React.JSX.Element {
  const isRegistration = variant === 'registration';
  const iconColor = isRegistration ? BscColors.secondary : BscColors.primaryLight;
  const chevronColor = isRegistration ? BscColors.secondary : BscColors.primaryLight;
  const backgroundColor = isRegistration ? BscColors.secondarySoft : BscColors.surfaceMuted;
  const iconContent = icon ?? (iconName !== undefined ? <BscIcon name={iconName} size={24} color={iconColor} /> : null);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={actionLabel ?? title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.actionCard,
        { backgroundColor },
        isRegistration ? styles.actionCardRegistration : styles.actionCardStandard,
        pressed && !disabled ? styles.actionCardPressed : null,
        disabled ? styles.actionCardDisabled : null,
      ]}
      testID={testID}
    >
      {iconContent !== null ? <View style={styles.actionCardIconCircle}>{iconContent}</View> : null}
      <View style={styles.actionCardTextContainer}>
        <Text style={styles.actionCardTitle}>{title}</Text>
        {subtitle !== undefined ? <Text style={styles.actionCardSubtitle}>{subtitle}</Text> : null}
      </View>
      <BscIcon name="chevron-right" size={24} color={chevronColor} />
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
  infoCard: {
    marginVertical: BscSpacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BscColors.surfaceMuted,
    borderRadius: BscBorderRadius.card,
    paddingVertical: BscSpacing.md,
    paddingHorizontal: BscSpacing.md,
  },
  infoCardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: BscSpacing.md,
  },
  infoCardTextContainer: {
    flex: 1,
  },
  infoCardTitle: {
    ...BscTextStyles['Body S/14 Bold'],
    color: BscColors.textPrimary,
  },
  infoCardSubtitle: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
    marginTop: 2,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BscBorderRadius.card,
    paddingVertical: BscSpacing.md,
    paddingHorizontal: BscSpacing.xl,
  },
  actionCardStandard: {
    marginVertical: BscSpacing.xs,
  },
  actionCardRegistration: {},
  actionCardPressed: {
    opacity: 0.85,
  },
  actionCardDisabled: {
    opacity: 0.5,
  },
  actionCardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BscColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: BscSpacing.md,
  },
  actionCardTextContainer: {
    flex: 1,
  },
  actionCardTitle: {
    ...BscTextStyles['Body S/14 Bold'],
    color: BscColors.textPrimary,
  },
  actionCardSubtitle: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
    marginTop: 2,
  },
});
