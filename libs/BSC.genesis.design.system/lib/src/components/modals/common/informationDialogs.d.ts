import React, { type ReactNode } from 'react';
import type { CommonDialogProps } from './types';
import type { ModalHandle } from '../surfaces';
export declare const ErrorGeneric: React.ForwardRefExoticComponent<CommonDialogProps & React.RefAttributes<ModalHandle>>;
export declare const ErrorGeneral: React.ForwardRefExoticComponent<CommonDialogProps & React.RefAttributes<ModalHandle>>;
export declare const ErrorServiceGeneral: React.ForwardRefExoticComponent<CommonDialogProps & React.RefAttributes<ModalHandle>>;
export declare const ErrorUserWithoutData: React.ForwardRefExoticComponent<CommonDialogProps & React.RefAttributes<ModalHandle>>;
export interface MaximumIntentsModalProps extends CommonDialogProps {
    warningMessage: ReactNode;
}
export declare const MaximumIntentsModal: React.ForwardRefExoticComponent<MaximumIntentsModalProps & React.RefAttributes<ModalHandle>>;
export interface NotValidatedClientModalProps extends CommonDialogProps {
    secondaryLabel: string;
    onSecondary: () => void;
}
export declare const NotValidatedClientModal: React.ForwardRefExoticComponent<NotValidatedClientModalProps & React.RefAttributes<ModalHandle>>;
