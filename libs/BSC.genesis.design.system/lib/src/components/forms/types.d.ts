import type { ReactNode } from 'react';
import type { DimensionValue, StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';
export interface ErrorTextProps {
    children?: ReactNode;
    text?: ReactNode;
    color?: string;
    iconName?: string;
    containerStyle?: StyleProp<ViewStyle>;
}
export interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    disabled?: boolean;
    onCopyRequest?: (value: string) => void;
    onCopy?: (value: string) => void;
    copyable?: boolean;
    copyLabel?: string;
    containerStyle?: StyleProp<ViewStyle>;
}
export interface TextFieldProps extends TextInputProps {
    error?: boolean;
    disabled?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    onCopyRequest?: (value: string) => void;
    iconName?: string;
    iconPosition?: 'left' | 'right';
    iconColor?: string;
    textColor?: string;
    onIconPress?: () => void;
    rightElement?: ReactNode;
    copyable?: boolean;
    onCopy?: (value: string) => void;
    width?: DimensionValue;
    align?: TextStyle['textAlign'];
    containerStyle?: StyleProp<ViewStyle>;
}
export interface CheckboxProps {
    label?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    children?: ReactNode;
}
export interface ToggleSwitchProps {
    label?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
}
export interface PasswordStrengthMeterProps {
    level: 0 | 1 | 2 | 3 | 4;
    label: string;
}
