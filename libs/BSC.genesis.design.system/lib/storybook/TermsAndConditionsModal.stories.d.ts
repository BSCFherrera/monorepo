import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("../src").TermsAndConditionsModalProps & import("react").RefAttributes<import("../src").ModalHandle>>;
    args: {
        visible: true;
        onClose: () => void;
        onAccept: () => void;
        title: string;
        content: string;
    };
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
