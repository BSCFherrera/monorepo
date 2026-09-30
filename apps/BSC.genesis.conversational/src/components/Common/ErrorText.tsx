import {COLORS, FONT_SIZES, SPACING} from '@constants/theme';
import React from 'react';
import {StyleSheet, Text, View, StyleProp, ViewStyle} from 'react-native';
import Icon from '@react-native-vector-icons/feather';

// Extraemos el tipo exacto de los nombres de los iconos
type FeatherIconNames = React.ComponentProps<typeof Icon>['name'];

interface ErrorTextProps {
  /** Texto de error a mostrar */
  text: string;
  /** Color del texto. Por defecto: COLORS.error */
  color?: string;
  /** Nombre del icono de feather (opcional). Por defecto: 'info' */
  iconName?: FeatherIconNames;
  /** Estilos adicionales para el contenedor principal */
  containerStyle?: StyleProp<ViewStyle>;
}

export const ErrorText: React.FC<ErrorTextProps> = ({
  text,
  color = COLORS.error,
  iconName = 'info', // 👈 Asignamos 'info' como valor por defecto en los parámetros
  containerStyle,
}) => {
  const dynamicTextStyle = {
    color,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/*
        Como iconName ahora siempre tendrá un string ('info' o el que pasen por props),
        se renderizará siempre a menos que en un futuro añadas lógica para ocultarlo.
      */}
      <Icon name={iconName} size={FONT_SIZES.sm} color={color} style={styles.icon} />
      <Text style={[styles.text, dynamicTextStyle]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
});
