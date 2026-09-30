import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("../src").ProofOfLifeSuccessModalProps & import("react").RefAttributes<import("../src").ModalHandle>>;
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
        onContinue: () => void;
        title: string;
        message: string;
        confirmLabel: string;
    };
};
export default meta;
export declare const Default: StoryObj<typeof meta>;
