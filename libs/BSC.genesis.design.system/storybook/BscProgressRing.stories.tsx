import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';

import { BscProgressRing } from '../src/components/BscProgressRing';
import { BscTypography } from '../src/theme/typography';

const meta: Meta<typeof BscProgressRing> = {
  title: 'Cards/BscProgressRing',
  component: BscProgressRing,
  args: {
    value: 0.65,
  },
};

export default meta;
type Story = StoryObj<typeof BscProgressRing>;

export const Default: Story = {};

export const WithCenterContent: Story = {
  args: {
    center: <Text style={BscTypography.titleMedium}>65%</Text>,
  },
};

export const Empty: Story = {
  args: { value: 0 },
};
