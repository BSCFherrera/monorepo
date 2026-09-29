import { type ReactNode } from 'react';
import { type ImageSourcePropType } from 'react-native';
import type { CommonDialogProps } from './types';
import type { ModalHandle } from '../surfaces';
export interface ClientVerifiedModalProps extends CommonDialogProps {
    logo?: ReactNode;
    logoSource?: ImageSourcePropType;
    details: readonly {
        label: string;
        value: string;
    }[];
    secondaryLabel: string;
    onSecondary: () => void;
    backLabel?: string;
}
export declare const ClientVerifiedModal: import("react").ForwardRefExoticComponent<ClientVerifiedModalProps & import("react").RefAttributes<ModalHandle>>;
