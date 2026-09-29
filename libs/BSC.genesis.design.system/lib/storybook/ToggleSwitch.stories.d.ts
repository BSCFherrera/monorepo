import type { StoryObj } from '@storybook/react';
import { BscToggleSwitch as ToggleSwitch } from '@bsc/ui-native';
declare const meta: {
    title: string;
    component: typeof ToggleSwitch;
    args: {
        label: string;
        value: false;
        onValueChange: () => void;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const On: Story;
export declare const Disabled: Story;
