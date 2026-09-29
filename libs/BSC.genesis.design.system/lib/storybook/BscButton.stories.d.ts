import type { StoryObj } from '@storybook/react';
import { BscPrimaryButton } from '@bsc/ui-native';
declare const meta: {
    title: string;
    component: typeof BscPrimaryButton;
    argTypes: {
        label: {
            control: "text";
        };
        size: {
            control: "inline-radio";
            options: string[];
        };
        disabled: {
            control: "boolean";
        };
        loading: {
            control: "boolean";
        };
        onPress: {
            control: false;
        };
    };
    args: {
        label: string;
        onPress: () => void;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Primary: Story;
export declare const Secondary: Story;
export declare const Text: Story;
export declare const Small: Story;
export declare const Large: Story;
export declare const Disabled: Story;
export declare const Loading: Story;
