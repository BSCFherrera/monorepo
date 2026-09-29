import {BORDER_RADIUS, COLORS, DIMENSIONS, FONT_SIZES, SPACING} from '@constants/theme';
import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, StyleProp, ViewStyle} from 'react-native';
import Icon from '@react-native-vector-icons/feather';

interface CheckboxProps {
  /** Valor actual del checkbox */
  value: boolean;
  /** Función que se ejecuta al cambiar el valor */
  onValueChange: (value: boolean) => void;
  /** Texto a mostrar junto al checkbox */
  label?: string;
  /** Contenido personalizado para el label (permite texto con negritas, etc.) */
  children?: React.ReactNode;
  /** Si es true, el checkbox está deshabilitado */
  disabled?: boolean;
  /** Estilos adicionales para el contenedor principal */
  containerStyle?: StyleProp<ViewStyle>;
  /** Color del checkbox cuando está marcado. Por defecto: COLORS.primary */
  checkedColor?: string;
  /** Color del checkbox cuando no está marcado. Por defecto: COLORS.border */
  uncheckedColor?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  value,
  onValueChange,
  label,
  children,
  disabled = false,
  containerStyle,
  checkedColor,
  uncheckedColor,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const dynamicBoxStyle: ViewStyle = {
    borderColor: value ? checkedColor || COLORS.primary : uncheckedColor || COLORS.border,
    backgroundColor: value ? checkedColor || COLORS.primary : 'transparent',
  };

  const dynamicTextStyle = {
    color: disabled ? COLORS.textDisabled : COLORS.textPrimary,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[styles.container, containerStyle]}
      disabled={disabled}>
      <View style={[styles.checkbox, dynamicBoxStyle]}>
        {value && (
          <Icon name="check" size={DIMENSIONS.iconSize.xs} color={COLORS.backgroundLight} />
        )}
      </View>
      {children ? (
        <View style={styles.labelContainer}>
          {typeof children === 'string' ? (
            <Text style={[styles.label, dynamicTextStyle]}>{children}</Text>
          ) : (
            children
          )}
        </View>
      ) : (
        label && <Text style={[styles.label, dynamicTextStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: DIMENSIONS.iconSize.md,
    height: DIMENSIONS.iconSize.md,
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
  },
  labelContainer: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
});
