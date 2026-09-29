import type { StoryObj } from '@storybook/react';
import { LoadingOverlay } from '../src';
declare const meta: {
    title: string;
    component: typeof LoadingOverlay;
    args: {
        visible: true;
        label: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const Static: Story;
