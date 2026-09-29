import type { StoryObj } from '@storybook/react';
import { Header } from '../src';
declare const meta: {
    title: string;
    parameters: {
        layout: string;
    };
    component: typeof Header;
    args: {
        title: string;
        subtitle: string;
    };
};
export default meta;
export declare const Default: StoryObj<typeof meta>;
export declare const WithBack: StoryObj<typeof meta>;
export declare const TitleOnly: StoryObj<typeof meta>;
