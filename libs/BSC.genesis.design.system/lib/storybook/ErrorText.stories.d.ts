import type { StoryObj } from '@storybook/react';
import { BscErrorText as ErrorText } from '@bsc/ui-native';
declare const meta: {
    title: string;
    component: typeof ErrorText;
    args: {
        children: string;
    };
};
export default meta;
export declare const Default: StoryObj<typeof meta>;
export declare const Empty: StoryObj<typeof meta>;
