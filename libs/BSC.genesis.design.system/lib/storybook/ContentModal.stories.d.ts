import type { StoryObj } from '@storybook/react';
import { type ModalHandle } from '../src';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("libs/BSC.genesis.design.system/src/components/modals/generic").ContentModalProps & import("react").RefAttributes<ModalHandle>>;
    args: {
        visible: false;
        onDismiss: () => void;
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
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const ImperativeRef: Story;
export declare const Disclaimer: Story;
