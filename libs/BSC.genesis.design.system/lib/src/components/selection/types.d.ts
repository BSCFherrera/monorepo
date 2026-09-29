import type { DimensionValue, StyleProp, TextStyle, ViewStyle } from 'react-native';
export interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}
export interface SelectProps {
    label?: string;
    accessibilityLabel?: string;
    options?: readonly SelectOption[];
    data?: readonly (SelectOption | string | number)[];
    value?: string | number | null;
    onChange?: (value: string | number) => void;
    onSelect?: (value: string | number) => void;
    disabled?: boolean;
    readOnly?: boolean;
    error?: boolean;
    placeholder?: string;
    width?: DimensionValue;
    align?: TextStyle['textAlign'];
    containerStyle?: StyleProp<ViewStyle>;
}
export interface SelectPillOption {
    label: string;
    value: string;
    iconName?: string;
}
export interface SelectPillProps {
    options: readonly SelectPillOption[];
    value: string;
    onSelect: (value: string) => void;
    label?: string;
    containerStyle?: StyleProp<ViewStyle>;
}
