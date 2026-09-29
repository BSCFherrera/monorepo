import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("libs/BSC.genesis.design.system/src/components/modals/common/clientVerifiedDialog").ClientVerifiedModalProps & import("react").RefAttributes<import("libs/BSC.genesis.design.system/src/components/modals/surfaces").ModalHandle>>;
    args: {
        title: string;
        message: string;
        details: {
            label: string;
            value: string;
        }[];
        secondaryLabel: string;
        onSecondary: () => void;
        logo: import("react").JSX.Element;
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
