import type { StoryObj } from '@storybook/react';
import { BscSteps as Steps } from '@bsc/ui-native';
declare const meta: {
    title: string;
    component: typeof Steps;
    args: {
        totalSteps: number;
        current: number;
    };
};
export default meta;
export declare const Default: StoryObj<typeof meta>;
export declare const FirstStep: StoryObj<typeof meta>;
export declare const LastStep: StoryObj<typeof meta>;
export declare const WithLabels: StoryObj<typeof meta>;
