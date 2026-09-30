import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("../src").ModalCommonProps & import("react").RefAttributes<import("../src").ModalHandle>>;
    args: {
        visible: true;
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
