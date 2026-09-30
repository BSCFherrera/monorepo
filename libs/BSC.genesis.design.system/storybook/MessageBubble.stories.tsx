import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { BscMessageBubble } from '@bsc/ui-native';

const meta = {
  title: 'Conversation/BscMessageBubble',
  component: BscMessageBubble,
  args: { children: 'How can I help you today?', direction: 'incoming' },
} satisfies Meta<typeof BscMessageBubble>;

export default meta;
export const Incoming: StoryObj<typeof meta> = {};
export const Outgoing: StoryObj<typeof meta> = { args: { direction: 'outgoing', children: 'Show me the available options.' } };
export const WithTimestamp: StoryObj<typeof meta> = { args: { timestampLabel: '10:00 AM' } };
export const BoldText: StoryObj<typeof meta> = { args: { children: 'Your **account balance** is $1,500.00' } };
export const Conversation: StoryObj = {
  render: () => (
    <View style={{ gap: 4 }}>
      <BscMessageBubble timestampLabel="10:00">How can I help you?</BscMessageBubble>
      <BscMessageBubble direction="outgoing" timestampLabel="10:01">Show me the available options.</BscMessageBubble>
      <BscMessageBubble timestampLabel="10:02">Here are your **current options** for assistance.</BscMessageBubble>
    </View>
  ),
};
