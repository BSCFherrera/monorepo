import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("libs/BSC.genesis.design.system/src/components/modals/common/informationDialogs").NotValidatedClientModalProps & import("react").RefAttributes<import("libs/BSC.genesis.design.system/src/components/modals/surfaces").ModalHandle>>;
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
