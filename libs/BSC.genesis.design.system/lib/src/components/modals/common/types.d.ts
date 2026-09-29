import type { ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { ModalControlProps } from '../surfaces';
export interface CommonDialogProps extends Omit<ModalControlProps, 'visible'> {
    visible?: boolean;
    onClose: () => void;
    title: string;
    message?: ReactNode;
    description?: ReactNode;
    confirmLabel?: string;
    closeButtonLabel?: string;
    onConfirm?: () => void;
    loading?: boolean;
    illustration?: ReactNode;
    icon?: ReactNode;
    iconName?: string;
    iconColor?: string;
    iconSize?: number;
    illustrationSource?: ImageSourcePropType;
    bottomInset?: number;
    canDismiss?: boolean;
    children?: ReactNode;
    actions?: ReactNode;
    /** Compatibility controls for generic adapters; named recipes show actions by default. */
    showConfirm?: boolean;
    showSecondary?: boolean;
}
export type ErrorGenericProps = CommonDialogProps;
export type ErrorGeneralProps = CommonDialogProps;
export type ErrorServiceGeneralProps = CommonDialogProps;
export type ErrorUserWithoutDataProps = CommonDialogProps;
export type TimeoutErrorModalProps = CommonDialogProps;
export type SuccessModalProps = CommonDialogProps;
export interface SuccessModalLegacyProps extends CommonDialogProps {
    onContinue?: () => void;
}
export type SessionExpiredModalProps = CommonDialogProps;
