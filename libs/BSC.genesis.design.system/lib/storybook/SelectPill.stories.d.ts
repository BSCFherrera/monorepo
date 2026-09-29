import type { StoryObj } from '@storybook/react';
import { SelectPill } from '../src';
declare const meta: {
    title: string;
    component: typeof SelectPill;
    args: {
        onSelect: () => void;
        label: string;
        options: {
            label: string;
            value: string;
            iconName: string;
        }[];
        value: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
