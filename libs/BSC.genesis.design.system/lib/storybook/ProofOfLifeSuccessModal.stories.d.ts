import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("libs/BSC.genesis.design.system/src/components/modals/onboarding").ProofOfLifeSuccessModalProps & import("react").RefAttributes<import("libs/BSC.genesis.design.system/src/components/modals/surfaces").ModalHandle>>;
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
