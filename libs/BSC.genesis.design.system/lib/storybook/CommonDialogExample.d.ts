import { type ReactNode } from 'react';
export declare const dialogArgs: {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    confirmLabel: string;
};
export declare function CommonDialogExample({ children }: {
    children: (visible: boolean, close: () => void) => ReactNode;
}): import("react").JSX.Element;
export declare const supportMessage: import("react").JSX.Element;
