import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View, StyleProp, ViewStyle} from 'react-native';
import {BORDER_RADIUS, COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import Icon from '@react-native-vector-icons/feather';

export interface SelectPillOption {
  label: string;
  value: string;
  iconName: React.ComponentProps<typeof Icon>['name'];
}

interface SelectPillProps {
  /** Opciones a mostrar, una junto a la otra */
  options: SelectPillOption[];
  /** Valor actualmente seleccionado */
  value: string;
  /** Función que se ejecuta al seleccionar una opción */
  onSelect: (value: string) => void;
  /** Estilos adicionales para el contenedor principal */
  containerStyle?: StyleProp<ViewStyle>;
}

export const SelectPill: React.FC<SelectPillProps> = ({
  options,
  value,
  onSelect,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {options.map(option => {
        const isSelected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.7}
            onPress={() => onSelect(option.value)}
            style={[styles.pill, isSelected ? styles.pillSelected : styles.pillUnselected]}>
            <Icon
              name={option.iconName}
              size={DIMENSIONS.iconSize.xs}
              color={isSelected ? COLORS.backgroundLight : COLORS.textPrimary}
            />
            <Text style={[styles.label, isSelected ? styles.labelSelected : styles.labelUnselected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundLight,
    padding: 4,
    gap: SPACING.sm,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DIMENSIONS.inputHeight - 8,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.sm,
  },
  pillSelected: {
    backgroundColor: COLORS.primary,
  },
  pillUnselected: {
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  labelSelected: {
    color: COLORS.backgroundLight,
  },
  labelUnselected: {
    color: COLORS.textPrimary,
  },
});
