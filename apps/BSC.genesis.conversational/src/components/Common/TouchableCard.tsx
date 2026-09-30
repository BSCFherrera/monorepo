import React from 'react';
import {
  DIMENSIONS,
  COLORS,
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SPACING,
} from '@constants/theme';
import {
  TouchableOpacity,
  View,
  Text,
  TouchableOpacityProps,
  StyleSheet,
  StyleProp,
  TextStyle,
} from 'react-native';
import Icon, {FeatherIconName} from '@react-native-vector-icons/feather';

/**
 * Extiende las propiedades completas de un TouchableOpacity
 * evitando la carga masiva de props innecesarias, y añade propiedades específicas para el Card.
 */
interface TouchableCardProps extends TouchableOpacityProps {
  title?: string;
  subtitle?: string;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  iconName?: FeatherIconName; // Nombre del ícono de Feather a mostrar en el círculo
}

export const TouchableCard = (props: TouchableCardProps) => {
  const {onPress, style, titleStyle, subtitleStyle, title, subtitle, iconName, ...rest} = props;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.container, style]}
      {...rest}>
      {iconName && (
        <View style={styles.iconCircle}>
          <Icon name={iconName} size={DIMENSIONS.iconSize.md} color={COLORS.primaryLight} />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={DIMENSIONS.iconSize.md} color={COLORS.primaryLight} />
    </TouchableOpacity>
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
    paddingHorizontal: SPACING.lg,
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
