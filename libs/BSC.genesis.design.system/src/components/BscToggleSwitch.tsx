import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';
import { BscTextStyles } from '../theme/typography';

export interface BscToggleSwitchProps {
  label?: string | undefined;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function BscToggleSwitch({
  label,
  value,
  onValueChange,
  disabled = false,
  style,
  testID,
}: BscToggleSwitchProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      onPress={disabled ? undefined : () => onValueChange(!value)}
      style={[styles.container, disabled && styles.disabled, style]}
      testID={testID}
    >
      {label === undefined ? null : <Text style={styles.label}>{label}</Text>}
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: BscSpacing.sm,
  },
  label: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
  },
  track: {
    width: 44,
    height: 26,
    borderRadius: BscRadius.pill,
    backgroundColor: BscColors.border,
    padding: 3,
  },
  trackOn: {
    backgroundColor: BscColors.primary,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BscColors.surface,
  },
  thumbOn: {
    transform: [{ translateX: 18 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
