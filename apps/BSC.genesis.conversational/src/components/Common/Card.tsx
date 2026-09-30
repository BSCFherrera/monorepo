import React from 'react';
import {
  DIMENSIONS,
  COLORS,
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SPACING,
} from '@constants/theme';
import {View, Text, StyleSheet, StyleProp, TextStyle, ViewProps} from 'react-native';
import Icon, {FeatherIconName} from '@react-native-vector-icons/feather';

/**
 * Extiende las propiedades completas de un View
 * evitando la carga masiva de props innecesarias, y añade propiedades específicas para el Card.
 */
interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  iconName?: FeatherIconName; // Nombre del ícono de Feather a mostrar en el círculo
  iconBackgroundColor?: string;
}

export const Card = (props: CardProps) => {
  const {
    style,
    iconBackgroundColor,
    titleStyle,
    subtitleStyle,
    title,
    subtitle,
    iconName,
    ...rest
  } = props;
  return (
    <View style={[styles.container, style]} {...rest}>
      {iconName && (
        <View style={[styles.iconCircle, {backgroundColor: iconBackgroundColor}]}>
          <Icon name={iconName} size={DIMENSIONS.iconSize.md} color={COLORS.primary} />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F6',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
