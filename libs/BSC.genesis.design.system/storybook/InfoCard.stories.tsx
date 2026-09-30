import type { Meta, StoryObj } from '@storybook/react';
import { BscInfoCard } from '@bsc/ui-native';

const meta = {
  title: 'Cards/BscInfoCard',
  component: BscInfoCard,
  args: { title: 'Account summary', subtitle: 'View your latest transactions' },
} satisfies Meta<typeof BscInfoCard>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
export const WithIcon: StoryObj<typeof meta> = { args: { iconName: 'info' } };
