import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import type {
  SelectableListGroupOption,
  SelectableListGroupProps,
} from '@bsc/contracts';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';
import { BscTextStyles } from '../theme/typography';

import { BscRadio } from './BscRadio';
import { BscIconTile } from './BscRow';

export interface BscSelectableListGroupProps<
  TValue extends string = string,
> extends SelectableListGroupProps<TValue> {
  style?: StyleProp<ViewStyle>;
}

export type BscSelectableListGroupOption<TValue extends string = string> =
  SelectableListGroupOption<TValue>;

export function BscSelectableListGroup<TValue extends string = string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  style,
  testID,
}: BscSelectableListGroupProps<TValue>): React.JSX.Element {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {label === undefined ? null : <Text style={styles.label}>{label}</Text>}
      <View
        accessibilityRole="radiogroup"
        style={styles.options}
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
              accessibilityLabel={
                option.subtitle === undefined
                  ? option.title
                  : `${option.title} ${option.subtitle}`
              }
              onPress={
                optionDisabled ? undefined : () => onChange(option.value)
              }
              style={[
                styles.option,
                selected ? styles.selectedOption : null,
                optionDisabled ? styles.disabledOption : null,
              ]}
              testID={
                testID === undefined ? undefined : `${testID}-${option.value}`
              }
            >
              <BscIconTile icon={option.icon} />
              <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                  {option.title}
                </Text>
                {option.subtitle === undefined ? null : (
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {option.subtitle}
                  </Text>
                )}
              </View>
              <BscRadio
                selected={selected}
                testID={
                  testID === undefined
                    ? undefined
                    : `${testID}-${option.value}-radio`
                }
              />
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
    gap: BscSpacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.sm,
    paddingHorizontal: BscSpacing.md,
    paddingVertical: BscSpacing.md,
    borderRadius: BscRadius.sm,
    borderWidth: 1,
    borderColor: BscColors.border,
    backgroundColor: BscColors.surface,
  },
  selectedOption: {
    borderColor: BscColors.primary,
  },
  disabledOption: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  title: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
  subtitle: {
    marginTop: BscSpacing.xxs,
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
});
