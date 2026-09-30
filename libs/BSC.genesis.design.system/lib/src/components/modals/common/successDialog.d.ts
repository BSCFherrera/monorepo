import React from 'react';
import type { CommonDialogProps } from './types';
import type { ModalHandle } from '../surfaces';
export declare const SuccessModal: React.ForwardRefExoticComponent<CommonDialogProps & {
    onContinue?: () => void;
} & React.RefAttributes<ModalHandle>>;
