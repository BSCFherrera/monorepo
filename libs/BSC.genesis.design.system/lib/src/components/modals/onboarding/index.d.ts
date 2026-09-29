import { type ReactNode } from 'react';
import { type ImageSourcePropType } from 'react-native';
import { type ClientVerifiedModalProps, type CommonDialogProps } from '../common';
import type { ModalControlProps, ModalHandle } from '../surfaces';
export interface WelcomeModalProps extends Omit<CommonDialogProps, 'onConfirm'> {
    onAccessChat: () => void;
    closeLabel?: string;
}
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer composing ModalCommon or FeedbackModal for new flows.
 */
export declare const WelcomeModal: import("react").ForwardRefExoticComponent<WelcomeModalProps & import("react").RefAttributes<ModalHandle>>;
export type ModalErrorUserBlockedLoginProps = CommonDialogProps;
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer the blockedLogin FeedbackModal variant for new flows.
 */
export declare const ModalErrorUserBlockedLogin: import("react").ForwardRefExoticComponent<CommonDialogProps & import("react").RefAttributes<ModalHandle>>;
export interface ProofOfLifeSuccessModalProps extends Omit<CommonDialogProps, 'onClose' | 'onConfirm'> {
    onContinue: () => void;
}
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer SuccessModal for the shared success layout.
 */
export declare const ProofOfLifeSuccessModal: import("react").ForwardRefExoticComponent<ProofOfLifeSuccessModalProps & import("react").RefAttributes<ModalHandle>>;
export interface OnboardingClientVerifiedModalProps extends ClientVerifiedModalProps {
    /** Host-controlled service result; never invokes a registration service itself. */
    serviceError?: CommonDialogProps;
}
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer ClientVerifiedModal for new client-verification flows.
 */
export declare const OnboardingClientVerifiedModal: import("react").ForwardRefExoticComponent<OnboardingClientVerifiedModalProps & import("react").RefAttributes<ModalHandle>>;
/**
 * @deprecated Typo compatibility alias. Prefer TimeoutErrorModal for new code.
 */
export declare const TimoutErrorModal: import("react").ForwardRefExoticComponent<CommonDialogProps & {
    onGoToHome?: () => void;
} & import("react").RefAttributes<ModalHandle>>;
/** @deprecated Typo compatibility alias. Prefer TimeoutErrorModalProps for new code. */
export type TimoutErrorModalProps = CommonDialogProps;
export interface TermsAndConditionsModalProps extends Omit<ModalControlProps, 'visible'> {
    visible?: boolean;
    onClose: () => void;
    title: string;
    content: ReactNode;
    acceptLabel?: string;
    onAccept: () => void;
    closeLabel?: string;
    bottomInset?: number;
    canDismiss?: boolean;
    actions?: ReactNode;
    showAccept?: boolean;
}
export declare const TermsAndConditionsModal: import("react").ForwardRefExoticComponent<TermsAndConditionsModalProps & import("react").RefAttributes<ModalHandle>>;
export interface DisclaimerModalProps extends Omit<ModalControlProps, 'visible'> {
    visible?: boolean;
    onClose: () => void;
    onBack: () => void;
    onContinue: () => void;
    title: string;
    subtitle: string;
    logo?: ReactNode;
    logoSource?: ImageSourcePropType;
    requirements: readonly {
        label: string;
        icon?: ReactNode;
        iconName?: string;
    }[];
    continueLabel?: string;
    exitLabel?: string;
    backLabel?: string;
    bottomInset?: number;
    canDismiss?: boolean;
    children?: ReactNode;
    actions?: ReactNode;
    showContinue?: boolean;
}
export declare const DisclaimerModal: import("react").ForwardRefExoticComponent<DisclaimerModalProps & import("react").RefAttributes<ModalHandle>>;
