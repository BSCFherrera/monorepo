import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { MessageBubble } from '../src';

const meta = {
  title: 'Conversation/MessageBubble',
  component: MessageBubble,
  args: { children: 'How can I help you today?', direction: 'incoming' },
} satisfies Meta<typeof MessageBubble>;

export default meta;
export const Incoming: StoryObj<typeof meta> = {};
export const Outgoing: StoryObj<typeof meta> = { args: { direction: 'outgoing', children: 'Show me the available options.' } };
export const WithTimestamp: StoryObj<typeof meta> = { args: { timestampLabel: '10:00 AM' } };
export const BoldText: StoryObj<typeof meta> = { args: { children: 'Your **account balance** is $1,500.00' } };
export const Conversation: StoryObj = {
  render: () => (
    <View style={{ gap: 4 }}>
      <MessageBubble timestampLabel="10:00">How can I help you?</MessageBubble>
      <MessageBubble direction="outgoing" timestampLabel="10:01">Show me the available options.</MessageBubble>
      <MessageBubble timestampLabel="10:02">Here are your **current options** for assistance.</MessageBubble>
    </View>
  ),
};
