import type { StoryObj } from '@storybook/react';
import { type ModalHandle } from '../src';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("../src").FeedbackModalProps & import("react").RefAttributes<ModalHandle>>;
    args: {
        visible: false;
        onDismiss: () => void;
        title: string;
    };
    parameters: {
        layout: string;
        docs: {
            description: {
                component: string;
            };
        };
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Info: Story;
export declare const ImperativeRef: Story;
export declare const Service: Story;
export declare const Contact: Story;
export declare const UserData: Story;
export declare const Success: Story;
export declare const Timeout: Story;
export declare const SessionExpired: Story;
export declare const SessionWarning: Story;
export declare const BlockedLogin: Story;
export declare const Welcome: Story;
export declare const MaxAttempts: Story;
export declare const UnvalidatedClient: Story;
export declare const ClientVerified: Story;
