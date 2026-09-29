import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS} from '@constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  icon,
  disabled,
  style,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    fullWidth && styles.buttonFullWidth,
    disabled && styles.buttonDisabled,
    style,
  ].filter(Boolean);

  const textStyle = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.textDisabled,
  ].filter(Boolean);

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'text' ? COLORS.primary : COLORS.textLight}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Variants
  button_primary: {
    backgroundColor: COLORS.primary,
  },
  button_secondary: {
    backgroundColor: COLORS.secondary,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  button_text: {
    backgroundColor: 'transparent',
  },

  // Sizes
  button_small: {
    height: 36,
    paddingHorizontal: SPACING.md,
  },
  button_medium: {
    height: 48,
    paddingHorizontal: SPACING.lg,
  },
  button_large: {
    height: 56,
    paddingHorizontal: SPACING.xl,
  },

  // Text styles
  text: {
    fontWeight: FONT_WEIGHTS.semibold,
  },
  text_primary: {
    color: COLORS.textLight,
  },
  text_secondary: {
    color: COLORS.textLight,
  },
  text_outline: {
    color: COLORS.primary,
  },
  text_text: {
    color: COLORS.primary,
  },
  text_small: {
    fontSize: FONT_SIZES.sm,
  },
  text_medium: {
    fontSize: FONT_SIZES.lg,
  },
  text_large: {
    fontSize: FONT_SIZES.xl,
  },
  textDisabled: {
    opacity: 0.5,
  },
});
