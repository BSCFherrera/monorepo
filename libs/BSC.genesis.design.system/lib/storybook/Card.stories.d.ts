import type { StoryObj } from '@storybook/react';
import { Card } from '../src';
declare const meta: {
    title: string;
    component: typeof Card;
    argTypes: {
        children: {
            control: false;
        };
    };
    args: {
        children: import("react").JSX.Element;
    };
};
export default meta;
export declare const Default: StoryObj<typeof meta>;
