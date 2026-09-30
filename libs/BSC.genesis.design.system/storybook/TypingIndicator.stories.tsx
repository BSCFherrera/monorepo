import type { Meta, StoryObj } from '@storybook/react';
import { BscTypingIndicator } from '@bsc/ui-native';

const meta = {
  title: 'Conversation/BscTypingIndicator',
  component: BscTypingIndicator,
  args: { animated: true },
} satisfies Meta<typeof BscTypingIndicator>;

export default meta;
export const Animated: StoryObj<typeof meta> = {};
export const Static: StoryObj<typeof meta> = { args: { animated: false } };
