import type { Meta, StoryObj } from '@storybook/react';

import { BscMessageBubble } from '../src/components/BscMessageBubble';

const meta: Meta<typeof BscMessageBubble> = {
  title: 'Conversation/BscMessageBubble',
  component: BscMessageBubble,
};

export default meta;
type Story = StoryObj<typeof BscMessageBubble>;

export const Incoming: Story = {
  args: {
    direction: 'incoming',
    children: 'Hola, ¿en qué te puedo ayudar hoy?',
    timestampLabel: '10:32 a.m.',
  },
};

export const Outgoing: Story = {
  args: {
    direction: 'outgoing',
    children: 'Quiero hacer una transferencia',
    timestampLabel: '10:33 a.m.',
  },
};

export const WithBoldText: Story = {
  args: {
    direction: 'incoming',
    children: 'Tu saldo disponible es **RD$ 12,540.00**',
  },
};
