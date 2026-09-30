import { Pressable, Text, View } from 'react-native';

import { styles } from './styles';
import type { ToggleSwitchProps } from './types';

export function ToggleSwitch({ label, value, onValueChange, disabled = false }: ToggleSwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : () => onValueChange(!value)}
      style={styles.toggleContainer}
    >
      {label && <Text style={styles.toggleLabel}>{label}</Text>}
      <View
        style={[
          styles.toggleTrack,
          value ? styles.toggleTrackOn : styles.toggleTrackOff,
          disabled ? { opacity: 0.5 } : undefined,
        ]}
      >
        <View style={[styles.toggleKnob, value ? styles.toggleKnobOn : styles.toggleKnobOff]} />
      </View>
    </Pressable>
  );
}
