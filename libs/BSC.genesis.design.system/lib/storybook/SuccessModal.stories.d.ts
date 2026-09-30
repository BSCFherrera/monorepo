import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("../src").CommonDialogProps & {
        onContinue?: () => void;
    } & import("react").RefAttributes<import("../src").ModalHandle>>;
    args: {
        title: string;
        message: string;
        visible: boolean;
        onClose: () => void;
        confirmLabel: string;
    };
    parameters: {
        layout: string;
    };
};
export default meta;
export declare const Default: StoryObj<typeof meta>;
