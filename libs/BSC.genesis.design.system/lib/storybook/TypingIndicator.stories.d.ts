import type { StoryObj } from '@storybook/react';
import { BscTypingIndicator as TypingIndicator } from '@bsc/ui-native';
declare const meta: {
    title: string;
    component: typeof TypingIndicator;
    args: {
        animated: true;
    };
};
export default meta;
export declare const Animated: StoryObj<typeof meta>;
export declare const Static: StoryObj<typeof meta>;
