import React, {useMemo} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  DimensionValue,
} from 'react-native';
import {COLORS} from '@constants/theme';

interface ButtonOutlinedFlatProps {
  /** Contenido del botón (texto o elementos anidados) */
  children: React.ReactNode;
  /** Acción al presionar */
  onPress: () => void;
  /** Color del borde y del texto. Por defecto: COLORS.primary */
  color?: string;
  /** Ancho del botón. Acepta números (ej. 200) o porcentajes (ej. '100%') */
  width?: DimensionValue;
  /** Permite deshabilitar el botón */
  disabled?: boolean;
  /** Estilos adicionales opcionales para el contenedor */
  containerStyle?: StyleProp<ViewStyle>;
  /** Estilos adicionales opcionales para el texto */
  textStyle?: StyleProp<TextStyle>;
}

export const ButtonOutlinedFlat: React.FC<ButtonOutlinedFlatProps> = ({
  children,
  onPress,
  color = COLORS.primary,
  width,
  disabled = false,
  containerStyle,
  textStyle,
}) => {
  const dynamicContainerStyle = useMemo(() => {
    return {
      borderColor: disabled ? COLORS.textDisabled : color,
      width,
    };
  }, [color, disabled, width]);

  const dynamicTextColor = disabled ? COLORS.textDisabled : color;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.baseContainer, dynamicContainerStyle, containerStyle]}>
      <Text style={[styles.baseText, {color: dynamicTextColor}, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: 999,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  baseText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
  },
});
