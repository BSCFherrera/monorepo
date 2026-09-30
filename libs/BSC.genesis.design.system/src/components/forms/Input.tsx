import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { tokens } from '../../tokens';
import { renderFeatherIcon } from '../icons';
import { styles } from './styles';
import type { InputProps } from './types';

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled,
  readOnly,
  editable,
  onFocus,
  onBlur,
  onChangeText,
  onCopyRequest,
  onCopy,
  copyable,
  copyLabel = 'Copy',
  containerStyle,
  style,
  value,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const blocked = disabled || readOnly || editable === false;

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View
        style={[
          styles.inputField,
          focused && styles.inputFieldFocused,
          error ? styles.inputFieldError : undefined,
          disabled ? styles.inputFieldDisabled : undefined,
        ]}
      >
        {leftIcon}
        <TextInput
          {...props}
          accessibilityLabel={props.accessibilityLabel ?? label}
          accessibilityState={{ ...props.accessibilityState, disabled: !!disabled }}
          editable={!blocked}
          readOnly={readOnly}
          value={value}
          style={[styles.inputInput, style]}
          onChangeText={(text) => {
            if (!blocked) onChangeText?.(text);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
        {rightIcon}
        {(copyable || onCopyRequest || onCopy) && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copyLabel}
            disabled={disabled}
            onPress={disabled ? undefined : () => (onCopyRequest ?? onCopy)?.(String(value ?? ''))}
          >
            {renderFeatherIcon({ name: 'copy', size: 20, color: tokens.colors.border })}
          </Pressable>
        )}
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.helperText, { color: tokens.colors.error }]}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}
