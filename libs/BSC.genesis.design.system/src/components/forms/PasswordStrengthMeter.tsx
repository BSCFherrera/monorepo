import { Text, View } from 'react-native';

import { BscColors } from '@bsc/ui-native';
import { styles } from './styles';
import type { PasswordStrengthMeterProps } from './types';

export function PasswordStrengthMeter({ level, label }: PasswordStrengthMeterProps) {
  // THREE segments: level 1 = weak (1 bar), 2 = medium (2 bars), 3+ = strong (3 bars)
  const segments = level === 0 ? 0 : level <= 1 ? 1 : level <= 2 ? 2 : 3;
  const color = level === 0 ? BscColors.border : level <= 1 ? BscColors.error : level <= 2 ? BscColors.warning : BscColors.success;

  if (level === 0) return null;

  return (
    <View style={styles.meterContainer}>
      <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 3, now: segments }} style={styles.meterRow}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.meterSegment,
              { backgroundColor: i < segments ? color : BscColors.border },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.meterLabel, { color }]}>{label}</Text>
    </View>
  );
}
