import type { StoryObj } from '@storybook/react';
import { BscSelect } from '@bsc/ui-native';
declare const meta: {
    title: string;
    component: typeof BscSelect;
    args: {
        title: string;
        placeholder: string;
        options: readonly [{
            readonly key: "never";
            readonly label: "Never";
            readonly value: 0;
        }, {
            readonly key: "weekly";
            readonly label: "Weekly";
            readonly detail: "Every week";
            readonly value: 1;
        }, {
            readonly key: "monthly";
            readonly label: "Monthly";
            readonly detail: "Every month";
            readonly value: 2;
        }];
        selectedKey: null;
        onSelect: () => void;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const Preselected: Story;
export declare const Disabled: Story;
export declare const WithError: Story;
