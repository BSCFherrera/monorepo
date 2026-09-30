import React from 'react';
import type { CommonDialogProps } from './types';
import type { ModalHandle } from '../surfaces';
export declare const TimeoutErrorModal: React.ForwardRefExoticComponent<CommonDialogProps & {
    onGoToHome?: () => void;
} & React.RefAttributes<ModalHandle>>;
