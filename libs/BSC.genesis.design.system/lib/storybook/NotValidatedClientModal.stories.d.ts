import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("../src").NotValidatedClientModalProps & import("react").RefAttributes<import("../src").ModalHandle>>;
    args: {
        title: string;
        secondaryLabel: string;
        confirmLabel: string;
        onSecondary: () => void;
        visible: boolean;
        onClose: () => void;
        message: string;
    };
    parameters: {
        layout: string;
    };
};
export default meta;
export declare const Default: StoryObj<typeof meta>;
