import type { Meta, StoryObj } from '@storybook/react';

import { BscMeterBar } from '../src/components/BscMeterBar';
import { BscColors } from '../src/theme/colors';

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

export const Low: Story = {
  args: { label: 'Transporte', value: 0.08, valueLabel: '8%' },
};

export const OverBudget: Story = {
  args: {
    label: 'Entretenimiento',
    value: 1,
    valueLabel: '104%',
    color: BscColors.error,
  },
};
