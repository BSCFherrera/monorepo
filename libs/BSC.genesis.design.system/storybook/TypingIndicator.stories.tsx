import type { Meta, StoryObj } from '@storybook/react';
import { TypingIndicator } from '../src';

const meta = {
  title: 'Conversation/TypingIndicator',
  component: TypingIndicator,
  args: { animated: true },
} satisfies Meta<typeof TypingIndicator>;

export default meta;
export const Animated: StoryObj<typeof meta> = {};
export const Static: StoryObj<typeof meta> = { args: { animated: false } };
