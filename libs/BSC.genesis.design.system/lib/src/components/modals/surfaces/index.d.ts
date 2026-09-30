import React, { type ReactNode } from 'react';
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
export interface BottomSheetModalProps extends CenteredModalProps {
    footer?: ReactNode;
    footnote?: string;
    maxHeightFactor?: number;
    testID?: string;
}
export declare const CenteredModal: React.ForwardRefExoticComponent<CenteredModalProps & React.RefAttributes<ModalHandle>>;
export declare const BottomSheetModal: React.ForwardRefExoticComponent<BottomSheetModalProps & React.RefAttributes<ModalHandle>>;
