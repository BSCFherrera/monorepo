import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    parameters: {
        layout: string;
    };
    component: typeof import("../src").BrandHeader;
    args: {
        title: string;
        showMenu: true;
        showProfile: true;
        showNotification: true;
        userInitials: string;
        hasNotification: true;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const NoNotifications: Story;
