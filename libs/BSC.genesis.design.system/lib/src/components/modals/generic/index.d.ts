import React, { type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { type CommonDialogProps, type ClientVerifiedModalProps } from '../common';
import { type DisclaimerModalProps } from '../onboarding';
import type { ModalControlProps, ModalHandle } from '../surfaces';
export { CenteredModal, BottomSheetModal, type CenteredModalProps, type BottomSheetModalProps, type ModalControlProps, type ModalHandle } from '../surfaces';
export interface ContentModalProps extends Omit<ModalControlProps, 'visible'> {
    visible?: boolean;
    onDismiss?: () => void;
    canDismiss?: boolean;
    children?: ReactNode;
    actions?: ReactNode;
    title?: string;
    variant?: 'terms' | 'disclaimer';
    closeLabel?: string;
    acceptLabel?: string;
    onAccept?: () => void;
    bottomInset?: number;
    subtitle?: string;
    requirements?: DisclaimerModalProps['requirements'];
    logo?: ReactNode;
    logoSource?: ImageSourcePropType;
    onExit?: () => void;
    exitLabel?: string;
}
/**
 * @deprecated Compatibility adapter. Prefer TermsAndConditionsModal or DisclaimerModal for named content flows.
 */
export declare const ContentModal: React.ForwardRefExoticComponent<ContentModalProps & React.RefAttributes<ModalHandle>>;
export type FeedbackVariant = 'info' | 'service' | 'contact' | 'userData' | 'maxAttempts' | 'unvalidatedClient' | 'timeout' | 'success' | 'sessionExpired' | 'sessionWarning' | 'blockedLogin' | 'welcome' | 'clientVerified';
export interface FeedbackModalProps extends Omit<ModalControlProps, 'visible'> {
    visible?: boolean;
    onDismiss?: () => void;
    canDismiss?: boolean;
    title: string;
    variant?: FeedbackVariant;
    message?: ReactNode;
    icon?: ReactNode;
    iconName?: string;
    iconColor?: string;
    iconSize?: number;
    children?: ReactNode;
    actions?: ReactNode;
    confirmLabel?: string;
    onConfirm?: () => void;
    confirming?: boolean;
    secondaryLabel?: string;
    onSecondary?: () => void;
    warningMessage?: ReactNode;
    subtitle?: string;
    bottomInset?: number;
    illustrationSource?: ImageSourcePropType;
    logo?: ReactNode;
    logoSource?: ImageSourcePropType;
    details?: ClientVerifiedModalProps['details'];
    detailLabel?: string;
    serviceError?: CommonDialogProps;
    closeLabel?: string;
}
/** Preserve generic callbacks and slots without keeping a second visual implementation. */
export declare const FeedbackModal: React.ForwardRefExoticComponent<FeedbackModalProps & React.RefAttributes<ModalHandle>>;
