import type { StoryObj } from '@storybook/react';
import { MessageBubble } from '../src';
declare const meta: {
    title: string;
    component: typeof MessageBubble;
    args: {
        children: string;
        direction: "incoming";
    };
};
export default meta;
export declare const Incoming: StoryObj<typeof meta>;
export declare const Outgoing: StoryObj<typeof meta>;
export declare const WithTimestamp: StoryObj<typeof meta>;
export declare const BoldText: StoryObj<typeof meta>;
export declare const Conversation: StoryObj;
