import type { StoryObj } from '@storybook/react';
import { OtpVerificationField } from '../src';
declare const meta: {
    title: string;
    component: typeof OtpVerificationField;
    args: {
        value: string;
        onChange: () => void;
        onVerify: () => void;
        options: {
            label: string;
            value: number;
        }[];
        selectedValue: number;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const WithError: Story;
export declare const SentState: Story;
export declare const Resend: Story;
