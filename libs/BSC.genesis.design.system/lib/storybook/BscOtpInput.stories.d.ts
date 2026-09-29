import type { StoryObj } from '@storybook/react';
import { BscOtpInput } from '@bsc/ui-native';
declare const meta: {
    title: string;
    component: typeof BscOtpInput;
    args: {
        length: number;
        value: string;
        onChangeText: () => void;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const WithError: Story;
export declare const Disabled: Story;
export declare const FourDigits: Story;
