import React from 'react';
import {StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';

import {COLORS} from '@constants/theme';

interface ToggleSwitchProps {
  /** Valor actual del switch */
  value: boolean;
  /** Función que se ejecuta al cambiar el valor */
  onValueChange: (value: boolean) => void;
  /** Si es true, el switch está deshabilitado */
  disabled?: boolean;
  /** Estilos adicionales para el contenedor principal */
  containerStyle?: StyleProp<ViewStyle>;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  containerStyle,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.track,
        {backgroundColor: value ? COLORS.primary : COLORS.border},
        disabled && styles.disabled,
        containerStyle,
      ]}>
      <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.backgroundLight,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  knobOff: {
    alignSelf: 'flex-start',
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
});
