import React from 'react';
import {StyleSheet, View, StyleProp, ViewStyle} from 'react-native';
import {BORDER_RADIUS, COLORS, SPACING} from '@constants/theme';

interface StepsProps {
  /** Cantidad total de pasos del flujo */
  totalSteps: number;
  /** Paso actual (1-indexado). Los pasos anteriores se consideran completados */
  currentStep: number;
  /** Estilos adicionales para el contenedor principal */
  containerStyle?: StyleProp<ViewStyle>;
}

export const Steps: React.FC<StepsProps> = ({totalSteps, currentStep, containerStyle}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {Array.from({length: totalSteps}).map((_, index) => {
        // Los pasos completados y el paso actual comparten el mismo color
        const isReached = index < currentStep;
        return (
          <View
            key={index}
            style={[styles.step, {backgroundColor: isReached ? COLORS.primary : COLORS.border}]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  step: {
    flex: 1,
    height: 4,
    borderRadius: BORDER_RADIUS.round,
  },
});
