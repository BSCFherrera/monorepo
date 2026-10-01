import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';
import { BscTextStyles } from '../theme/typography';

import { BscRadio } from './BscRadio';
import type { RadioGroupOption, RadioGroupProps } from '@bsc/contracts';

export interface BscRadioGroupProps extends RadioGroupProps {
  /** Dirección visual de las opciones. */
  direction?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
}

export type BscRadioGroupOption = RadioGroupOption;

export function BscRadioGroup({
  label,
  options,
  value,
  onChange,
  disabled = false,
  direction = 'horizontal',
  style,
  testID,
}: BscRadioGroupProps): React.JSX.Element {
  const horizontal = direction === 'horizontal';

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label === undefined ? null : <Text style={styles.label}>{label}</Text>}
      <View
        accessibilityRole="radiogroup"
        style={[styles.options, horizontal ? styles.horizontal : styles.vertical]}
        testID={testID === undefined ? undefined : `${testID}-options`}
      >
        {options.map(option => {
          const selected = option.value === value;
          const optionDisabled = disabled || option.disabled === true;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: optionDisabled }}
              accessibilityLabel={option.label}
              onPress={optionDisabled ? undefined : () => onChange(option.value)}
              style={[
                styles.option,
                horizontal ? styles.horizontalOption : null,
                selected ? styles.selectedOption : null,
                optionDisabled ? styles.disabledOption : null,
              ]}
              testID={testID === undefined ? undefined : `${testID}-${option.value}`}
            >
              <BscRadio selected={selected} />
              <Text style={[styles.optionLabel, selected ? styles.selectedLabel : null]} numberOfLines={1}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: BscSpacing.xs,
  },
  label: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  options: {
    gap: BscSpacing.xs,
  },
  horizontal: {
    flexDirection: 'row',
  },
  vertical: {
    flexDirection: 'column',
  },
  horizontalOption: {
    flex: 1,
  },
  option: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
    paddingHorizontal: BscSpacing.md,
    paddingVertical: BscSpacing.sm,
    borderRadius: BscRadius.sm,
    borderWidth: 1,
    borderColor: BscColors.border,
    backgroundColor: BscColors.surface,
  },
  selectedOption: {
    borderColor: BscColors.primary,
    backgroundColor: BscColors.primarySoft,
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionLabel: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
  },
  selectedLabel: {
    color: BscColors.primary,
  },
});
