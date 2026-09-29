import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("libs/BSC.genesis.design.system/src/components/modals/common/types").CommonDialogProps & import("react").RefAttributes<import("libs/BSC.genesis.design.system/src/components/modals/surfaces").ModalHandle>>;
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
        title: string;
        confirmLabel: string;
        message: import("react").JSX.Element;
    };
};
export default meta;
export declare const Default: StoryObj<typeof meta>;
