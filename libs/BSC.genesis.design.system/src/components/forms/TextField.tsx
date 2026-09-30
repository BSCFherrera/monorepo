import { Pressable, TextInput, View } from 'react-native';

import { tokens } from '../../tokens';
import { renderFeatherIcon } from '../icons';
import { styles } from './styles';
import type { TextFieldProps } from './types';

export function TextField({
  error,
  disabled,
  readOnly,
  editable,
  leftIcon,
  rightIcon,
  onCopyRequest,
  iconName,
  iconPosition = 'left',
  iconColor = tokens.colors.borderDark,
  textColor,
  onIconPress,
  rightElement,
  copyable,
  onCopy,
  width,
  align,
  containerStyle,
  style,
  value,
  onChangeText,
  ...props
}: TextFieldProps) {
  const blocked = disabled || readOnly || editable === false;
  const copyHandler = onCopyRequest ?? onCopy;
  const legacyIcon = iconName
    ? renderFeatherIcon({ name: iconName, size: 20, color: disabled ? tokens.colors.textDisabled : iconColor })
    : null;
  const maybePressableIcon = legacyIcon && onIconPress ? (
    <Pressable accessibilityRole="button" accessibilityLabel={iconName} disabled={disabled} onPress={disabled ? undefined : onIconPress}>
      {legacyIcon}
    </Pressable>
  ) : legacyIcon;
  const resolvedLeftIcon = leftIcon ?? (iconPosition === 'left' ? maybePressableIcon : null);
  const resolvedRightIcon = rightElement ?? rightIcon ?? (iconPosition === 'right' ? maybePressableIcon : null);

  return (
    <View
      style={[
        styles.textFieldContainer,
        width != null ? { width } : undefined,
        error ? styles.inputFieldError : undefined,
        disabled ? styles.inputFieldDisabled : undefined,
        containerStyle,
      ]}
    >
      {resolvedLeftIcon}
      <TextInput
        {...props}
        accessibilityState={{ ...props.accessibilityState, disabled: !!disabled }}
        editable={!blocked}
        readOnly={readOnly}
        value={value}
        style={[
          styles.textFieldInput,
          align ? { textAlign: align } : undefined,
          textColor ? { color: textColor } : undefined,
          disabled && { color: tokens.colors.textDisabled },
          style,
        ]}
        onChangeText={text => { if (!blocked) onChangeText?.(text); }}
      />
      {resolvedRightIcon}
      {(copyable || copyHandler) && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copy"
          disabled={disabled}
          onPress={disabled ? undefined : () => copyHandler?.(String(value ?? ''))}
        >
          {renderFeatherIcon({ name: 'copy', size: 20, color: tokens.colors.borderDark })}
        </Pressable>
      )}
    </View>
  );
}
