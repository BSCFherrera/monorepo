import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("../src").WelcomeModalProps & import("react").RefAttributes<import("../src").ModalHandle>>;
    tags: string[];
    parameters: {
        layout: string;
        docs: {
            description: {
                component: string;
            };
        };
    };
    args: {
        visible: true;
        onClose: () => void;
        onAccessChat: () => void;
        title: string;
        confirmLabel: string;
        message: import("react").JSX.Element;
    };
};
export default meta;
export declare const Default: StoryObj<typeof meta>;
