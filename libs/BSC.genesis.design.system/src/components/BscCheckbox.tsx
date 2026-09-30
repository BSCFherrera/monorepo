import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';
import { BscTextStyles } from '../theme/typography';

import { BscIcon } from './BscIcon';

export interface BscCheckboxProps {
  label?: string | undefined;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function BscCheckbox({
  label,
  checked,
  onChange,
  disabled = false,
  children,
  style,
  testID,
}: BscCheckboxProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      onPress={disabled ? undefined : () => onChange(!checked)}
      style={[styles.container, disabled && styles.disabled, style]}
      testID={testID}
    >
      <View style={[styles.box, checked && styles.checked]}>
        {checked ? <BscIcon name="check" size={14} color={BscColors.textOnPrimary} /> : null}
      </View>
      {children ?? (label === undefined ? null : <Text style={styles.label}>{label}</Text>)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.sm,
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: BscColors.border,
    borderRadius: BscRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BscColors.surface,
  },
  checked: {
    borderColor: BscColors.primary,
    backgroundColor: BscColors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
  },
});
