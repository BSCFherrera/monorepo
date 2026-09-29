import type { StoryObj } from '@storybook/react';
import { InfoCard } from '../src';
declare const meta: {
    title: string;
    component: typeof InfoCard;
    args: {
        title: string;
        subtitle: string;
    };
};
export default meta;
export declare const Default: StoryObj<typeof meta>;
export declare const WithIcon: StoryObj<typeof meta>;
