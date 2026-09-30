import type { Meta, StoryObj } from '@storybook/react';
import { BscMeterBar } from '@bsc/ui-native';

const meta = {
  title: 'Display/BscMeterBar',
  component: BscMeterBar,
  args: {
    label: 'Security',
    value: 0.72,
    valueLabel: '72%',
  },
} satisfies Meta<typeof BscMeterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Complete: Story = { args: { label: 'Completion', value: 1, valueLabel: '100%' } };
