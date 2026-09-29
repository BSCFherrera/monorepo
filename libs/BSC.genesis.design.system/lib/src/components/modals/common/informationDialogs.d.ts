import { type ReactNode } from 'react';
import type { CommonDialogProps } from './types';
import type { ModalHandle } from '../surfaces';
export declare const ErrorGeneric: import("react").ForwardRefExoticComponent<CommonDialogProps & import("react").RefAttributes<ModalHandle>>;
export declare const ErrorGeneral: import("react").ForwardRefExoticComponent<CommonDialogProps & import("react").RefAttributes<ModalHandle>>;
export declare const ErrorServiceGeneral: import("react").ForwardRefExoticComponent<CommonDialogProps & import("react").RefAttributes<ModalHandle>>;
export declare const ErrorUserWithoutData: import("react").ForwardRefExoticComponent<CommonDialogProps & import("react").RefAttributes<ModalHandle>>;
export interface MaximumIntentsModalProps extends CommonDialogProps {
    warningMessage: ReactNode;
}
export declare const MaximumIntentsModal: import("react").ForwardRefExoticComponent<MaximumIntentsModalProps & import("react").RefAttributes<ModalHandle>>;
export interface NotValidatedClientModalProps extends CommonDialogProps {
    secondaryLabel: string;
    onSecondary: () => void;
}
export declare const NotValidatedClientModal: import("react").ForwardRefExoticComponent<NotValidatedClientModalProps & import("react").RefAttributes<ModalHandle>>;
