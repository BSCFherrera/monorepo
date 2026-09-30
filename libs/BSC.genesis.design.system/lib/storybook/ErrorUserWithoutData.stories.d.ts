import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("../src").CommonDialogProps & import("react").RefAttributes<import("../src").ModalHandle>>;
    args: {
        title: string;
        message: import("react").JSX.Element;
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
