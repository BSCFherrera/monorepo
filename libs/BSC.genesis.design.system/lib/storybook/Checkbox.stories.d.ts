import type { StoryObj } from '@storybook/react';
import { Checkbox } from '../src';
declare const meta: {
    title: string;
    component: typeof Checkbox;
    argTypes: {
        checked: {
            control: "boolean";
        };
        disabled: {
            control: "boolean";
        };
    };
    args: {
        label: string;
        checked: false;
        onChange: () => void;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const Checked: Story;
export declare const Disabled: Story;
