import type { StoryObj } from '@storybook/react';
import { BscTextField } from '@bsc/ui-native';
declare const meta: {
    title: string;
    component: typeof BscTextField;
    args: {
        label: string;
        placeholder: string;
        value: string;
        onChangeText: () => void;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const Secure: Story;
export declare const Disabled: Story;
export declare const WithError: Story;
