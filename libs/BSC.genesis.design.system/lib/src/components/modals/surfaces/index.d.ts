import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
export interface ModalHandle {
    open(): void;
    close(): void;
    toggle(nextVisible?: boolean): void;
    isOpen(): boolean;
}
export interface ModalControlProps {
    visible?: boolean;
    defaultVisible?: boolean;
    onOpenChange?: (visible: boolean) => void;
}
export interface CenteredModalProps extends ModalControlProps {
    contentStyle?: StyleProp<ViewStyle>;
    animationType?: 'none' | 'slide' | 'fade';
    onDismiss?: () => void;
    canDismiss?: boolean;
    children?: ReactNode;
    actions?: ReactNode;
    title?: string;
    bottomInset?: number;
}
export type BottomSheetModalProps = CenteredModalProps;
export declare const CenteredModal: import("react").ForwardRefExoticComponent<CenteredModalProps & import("react").RefAttributes<ModalHandle>>;
export declare const BottomSheetModal: import("react").ForwardRefExoticComponent<CenteredModalProps & import("react").RefAttributes<ModalHandle>>;
