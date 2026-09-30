import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("../src").CommonDialogProps & import("react").RefAttributes<import("../src").ModalHandle>>;
    args: {
        title: string;
        message: import("react").JSX.Element;
        confirmLabel: string;
        visible: boolean;
        onClose: () => void;
    };
    tags: string[];
    parameters: {
        layout: string;
        docs: {
            description: {
                component: string;
            };
        };
    };
};
export default meta;
export declare const Default: StoryObj<typeof meta>;
