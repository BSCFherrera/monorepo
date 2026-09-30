import type { Meta, StoryObj } from '@storybook/react';
import { BscErrorText } from '@bsc/ui-native';

const meta = {
  title: 'Forms/BscErrorText',
  component: BscErrorText,
  args: {
    children: 'This field is required.',
  },
} satisfies Meta<typeof BscErrorText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Warning: Story = { args: { iconName: 'warning', children: 'Review this value before continuing.' } };
