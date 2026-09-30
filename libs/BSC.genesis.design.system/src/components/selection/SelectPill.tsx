import { Pressable, Text, View } from 'react-native';
import { tokens } from '../../tokens';
import { renderFeatherIcon } from '../icons';
import { styles } from './styles';
import type { SelectPillProps } from './types';

export function SelectPill({ options, value, onSelect, label, containerStyle }: SelectPillProps) {
  return (
    <View style={containerStyle}>
      {label && <Text style={styles.selectLabel}>{label}</Text>}
      <View style={styles.pillContainer}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(option.value)}
              style={[styles.pill, isSelected ? styles.pillSelected : styles.pillUnselected]}
            >
              {option.iconName &&
                (renderFeatherIcon({
                  name: option.iconName,
                  size: 16,
                  color: isSelected ? '#FFFFFF' : tokens.colors.text,
                }) ?? null)}
              <Text
                style={[
                  styles.pillLabel,
                  isSelected ? styles.pillLabelSelected : styles.pillLabelUnselected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
