import type { StoryObj } from '@storybook/react';
import { PasswordStrengthMeter } from '../src';
declare const meta: {
    title: string;
    component: typeof PasswordStrengthMeter;
    argTypes: {
        level: {
            control: {
                type: "range";
                min: number;
                max: number;
                step: number;
            };
        };
    };
    args: {
        level: 2;
        label: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Empty: Story;
export declare const Weak: Story;
export declare const Medium: Story;
export declare const Strong: Story;
export declare const MaxLevel: Story;
