import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("libs/BSC.genesis.design.system/src/components/modals/onboarding").TermsAndConditionsModalProps & import("react").RefAttributes<import("libs/BSC.genesis.design.system/src/components/modals/surfaces").ModalHandle>>;
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
