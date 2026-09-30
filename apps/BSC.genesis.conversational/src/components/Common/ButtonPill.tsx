import React, {useMemo} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  DimensionValue, // Importamos el tipo exacto para dimensiones
} from 'react-native';

interface ButtonPillProps {
  /** Contenido del botón (texto o elementos anidados) */
  children: React.ReactNode;
  /** Acción al presionar */
  onPress: () => void;
  /** Color de fondo del botón. Por defecto: el azul del sistema */
  backgroundColor?: string;
  /** Color del texto. Por defecto: blanco */
  textColor?: string;
  /** Ancho del botón. Acepta números (ej. 200) o porcentajes (ej. '100%') */
  width?: DimensionValue;
  /** Permite deshabilitar el botón */
  disabled?: boolean;
  /** Estilos adicionales opcionales para el contenedor */
  containerStyle?: StyleProp<ViewStyle>;
  /** Estilos adicionales opcionales para el texto */
  textStyle?: StyleProp<TextStyle>;
}

export const ButtonPill: React.FC<ButtonPillProps> = ({
  children,
  onPress,
  backgroundColor = '#007AFF',
  textColor = '#FFFFFF',
  width,
  disabled = false,
  containerStyle,
  textStyle,
}) => {
  const dynamicContainerStyle = useMemo(() => {
    return {
      backgroundColor,
      // Al deshabilitar, se atenúa el mismo color recibido (más opaco/tenue) en vez de usar gris
      opacity: disabled ? 0.5 : 1,
      width, // Se lo inyectamos directamente al estilo del contenedor
    };
  }, [backgroundColor, disabled, width]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.baseContainer, dynamicContainerStyle, containerStyle]}>
      {/* Pasamos el color directamente aquí para evitar crear otro useMemo solo para una variable */}
      <Text style={[styles.baseText, {color: textColor}, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    // Valores base para que el botón siempre tenga consistencia interna
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  baseText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
