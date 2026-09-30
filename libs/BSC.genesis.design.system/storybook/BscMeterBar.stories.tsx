import type { Meta, StoryObj } from '@storybook/react';

import { BscMeterBar } from '../src/components/BscMeterBar';

const meta: Meta<typeof BscMeterBar> = {
  title: 'Cards/BscMeterBar',
  component: BscMeterBar,
  args: {
    label: 'Alimentación',
    value: 0.42,
    valueLabel: '42%',
  },
};

export default meta;
type Story = StoryObj<typeof BscMeterBar>;

export const Default: Story = {};
