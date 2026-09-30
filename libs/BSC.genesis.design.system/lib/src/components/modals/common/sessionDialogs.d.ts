import React from 'react';
import type { CommonDialogProps } from './types';
import type { ModalHandle } from '../surfaces';
export declare const SessionExpiredModal: React.ForwardRefExoticComponent<CommonDialogProps & React.RefAttributes<ModalHandle>>;
export interface WarningSessionModalProps extends CommonDialogProps {
    secondaryLabel: string;
    onSecondary: () => void;
}
export declare const WarningSessionModal: React.ForwardRefExoticComponent<WarningSessionModalProps & React.RefAttributes<ModalHandle>>;
