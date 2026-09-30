import type { Meta, StoryObj } from '@storybook/react';

import { BscTypingIndicator } from '../src/components/BscTypingIndicator';

const meta: Meta<typeof BscTypingIndicator> = {
  title: 'Conversation/BscTypingIndicator',
  component: BscTypingIndicator,
};

export default meta;
type Story = StoryObj<typeof BscTypingIndicator>;

export const Animated: Story = {};

export const Static: Story = {
  args: { animated: false },
};
