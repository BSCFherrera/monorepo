import type { Meta, StoryObj } from '@storybook/react';

import { BscSteps } from '../src/components/BscSteps';

const meta: Meta<typeof BscSteps> = {
  title: 'Cards/BscSteps',
  component: BscSteps,
  args: {
    totalSteps: 4,
    current: 1,
  },
};

export default meta;
type Story = StoryObj<typeof BscSteps>;

export const Default: Story = {};

export const AlmostDone: Story = {
  args: { current: 3 },
};
