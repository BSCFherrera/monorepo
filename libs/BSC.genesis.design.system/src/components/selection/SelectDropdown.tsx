import { Animated, FlatList, Modal, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native';
import type { SelectOption } from './types';
import { styles } from './styles';

interface SelectDropdownProps {
  visible: boolean;
  options: readonly SelectOption[];
  value?: string | number | null;
  position: { top: number; left: number; width: number };
  windowHeight: number;
  animatedOpacity: Animated.Value;
  animatedScale: Animated.Value;
  isBlocked: () => boolean;
  onRequestClose: () => void;
  onChange: (value: string | number) => void;
  onDismissAfterSelect: () => void;
}

export function SelectDropdown({
  visible,
  options,
  value,
  position,
  windowHeight,
  animatedOpacity,
  animatedScale,
  isBlocked,
  onRequestClose,
  onChange,
  onDismissAfterSelect,
}: SelectDropdownProps) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onRequestClose}>
      <TouchableWithoutFeedback onPress={onRequestClose}>
        <View style={styles.selectModalOverlay}>
          <Animated.View
            style={[
              styles.selectDropdown,
              {
                top: position.top,
                left: position.left,
                width: position.width,
                maxHeight: Math.max(48, Math.min(260, windowHeight - position.top - 4)),
                opacity: animatedOpacity,
                transform: [{ scaleY: animatedScale }],
              },
            ]}
          >
            <FlatList
              data={options as SelectOption[]}
              keyExtractor={(item) => String(item.value)}
              bounces={false}
              renderItem={({ item: option }) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected: isSelected, disabled: !!option.disabled }}
                    disabled={option.disabled}
                    style={[styles.selectOption, isSelected ? styles.selectOptionSelected : undefined]}
                    onPress={() => {
                      if (!option.disabled && !isBlocked()) {
                        onChange(option.value);
                        onDismissAfterSelect();
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        isSelected ? styles.selectOptionTextSelected : undefined,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
