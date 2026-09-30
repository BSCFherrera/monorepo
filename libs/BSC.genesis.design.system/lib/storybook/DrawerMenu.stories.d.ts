import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: typeof import("../src").DrawerMenu;
    args: {
        visible: false;
        onDismiss: () => void;
    };
    parameters: {
        layout: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
