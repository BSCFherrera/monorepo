import { type ReactNode } from 'react';
import type { CommonDialogProps } from './types';
export declare function Illustration({ illustration, illustrationSource, size, name, color }: Pick<CommonDialogProps, 'illustration' | 'illustrationSource'> & {
    size?: number;
    name?: string;
    color?: string;
}): import("react").JSX.Element;
export declare function resolveCommonDialogProps(props: CommonDialogProps): CommonDialogProps;
export declare function Panel({ children, warning }: {
    children: ReactNode;
    warning?: boolean;
}): import("react").JSX.Element;
export declare function Confirm({ props, pill }: {
    props: CommonDialogProps;
    pill?: boolean;
}): import("react").JSX.Element | null;
