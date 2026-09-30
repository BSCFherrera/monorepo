import React from 'react';
import {StyleSheet, Text, View, StyleProp, ViewStyle} from 'react-native';
import {useTranslation} from 'react-i18next';

import {COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {getPasswordStrength, PasswordStrengthLevel} from '@utils/helpers';

const TOTAL_SEGMENTS = 3;

const STRENGTH_CONFIG: Record<PasswordStrengthLevel, {color: string; segments: number}> = {
  weak: {color: COLORS.error, segments: 1},
  medium: {color: COLORS.warning, segments: 2},
  strong: {color: COLORS.success, segments: 3},
};

interface PasswordStrengthMeterProps {
  /** Contraseña a evaluar */
  password: string;
  /** Estilos adicionales para el contenedor principal */
  containerStyle?: StyleProp<ViewStyle>;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  containerStyle,
}) => {
  const {t} = useTranslation('onboarding');

  if (!password) {
    return null;
  }

  const strength = getPasswordStrength(password);
  const {color, segments} = STRENGTH_CONFIG[strength];

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.segmentsRow}>
        {Array.from({length: TOTAL_SEGMENTS}).map((_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              {backgroundColor: index < segments ? color : COLORS.borderDark},
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, {color}]}>
        {t('createUser.passwordStrength.label', {
          level: t(`createUser.passwordStrength.${strength}`),
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.sm,
  },
  segmentsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: SPACING.xs,
    textTransform: 'uppercase',
  },
});
