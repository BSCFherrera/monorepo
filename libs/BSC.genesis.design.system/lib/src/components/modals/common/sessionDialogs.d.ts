import type { CommonDialogProps } from './types';
import type { ModalHandle } from '../surfaces';
export declare const SessionExpiredModal: import("react").ForwardRefExoticComponent<CommonDialogProps & import("react").RefAttributes<ModalHandle>>;
export interface WarningSessionModalProps extends CommonDialogProps {
    secondaryLabel: string;
    onSecondary: () => void;
}
export declare const WarningSessionModal: import("react").ForwardRefExoticComponent<WarningSessionModalProps & import("react").RefAttributes<ModalHandle>>;
