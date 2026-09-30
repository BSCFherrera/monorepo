import { Pressable, Text, View } from 'react-native';

import { tokens } from '../../tokens';
import { renderFeatherIcon } from '../icons';
import { styles } from './styles';
import type { CheckboxProps } from './types';

export function Checkbox({ label, checked, onChange, disabled = false, children }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : () => onChange(!checked)}
      style={styles.checkboxContainer}
    >
      <View
        style={[
          styles.checkboxBox,
          checked ? styles.checkboxBoxChecked : undefined,
        ]}
      >
        {checked && renderFeatherIcon({ name: 'check', size: 16, color: '#FFFFFF' })}
      </View>
      {children ? (
        <View style={styles.checkboxLabelContainer}>
          {typeof children === 'string' ? (
            <Text style={styles.checkboxLabel}>{children}</Text>
          ) : (
            children
          )}
        </View>
      ) : (
        label && <Text style={[styles.checkboxLabel, disabled && { color: tokens.colors.textDisabled }]}>{label}</Text>
      )}
    </Pressable>
  );
}
