import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';
import { tokens } from '../../tokens';
import type { ReactNode } from 'react';

export interface ButtonProps {
  label: string;
  onPress: NonNullable<PressableProps['onPress']>;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  icon?: ReactNode;
  size?: 'small' | 'medium' | 'large';
  pill?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  testID,
  icon,
  size = 'medium',
  pill = false,
  fullWidth = false,
}: ButtonProps) {
  const blocked = disabled || loading;
  const textColor =
    variant === 'primary' || variant === 'secondary'
      ? tokens.colors.onPrimary
      : tokens.colors.primary;
  const spinnerColor = textColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={blocked ? undefined : onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'text' && styles.text,
        size === 'small' && styles.small,
        size === 'medium' && styles.medium,
        size === 'large' && styles.large,
        pill && styles.pill,
        fullWidth && styles.fullWidth,
        pressed && !blocked && styles.pressed,
        blocked && styles.disabled,
      ]}
    >
      {loading && <ActivityIndicator color={spinnerColor} style={styles.spinner} />}
      {!loading && icon}
      {!loading && <Text style={[styles.label, size === 'small' && styles.labelSmall, size === 'medium' && styles.labelMedium, size === 'large' && styles.labelLarge, { color: textColor }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: tokens.radii.md,
    gap: tokens.spacing.sm,
  },
  primary: {
    backgroundColor: tokens.colors.primary,
  },
  secondary: {
    backgroundColor: tokens.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: tokens.colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
  },
  small: {
    height: tokens.dimensions.buttonHeights.small,
    paddingHorizontal: tokens.spacing.md,
  },
  medium: {
    height: tokens.dimensions.buttonHeights.medium,
    paddingHorizontal: tokens.spacing.lg,
  },
  large: {
    height: tokens.dimensions.buttonHeights.large,
    paddingHorizontal: tokens.spacing.xl,
  },
  pill: {
    borderRadius: tokens.radii.pill,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontWeight: tokens.fontWeights.semibold,
  },
  labelSmall: {
    fontSize: tokens.fontSizes.sm,
  },
  labelMedium: {
    fontSize: tokens.fontSizes.lg,
  },
  labelLarge: {
    fontSize: tokens.fontSizes.xl,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  spinner: {
    marginRight: tokens.spacing.xs,
  },
});
