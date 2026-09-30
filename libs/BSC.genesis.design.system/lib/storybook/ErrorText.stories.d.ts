import type { StoryObj } from '@storybook/react';
import { ErrorText } from '../src';
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
