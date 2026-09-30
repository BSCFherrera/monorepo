import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    parameters: {
        layout: string;
    };
    component: typeof import("../src").AppHeader;
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const WithBackButton: Story;
