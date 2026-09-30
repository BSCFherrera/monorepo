import type { Meta, StoryObj } from '@storybook/react';
import { InfoCard } from '../src';

const meta = {
  title: 'Cards/InfoCard',
  component: InfoCard,
  args: { title: 'Account summary', subtitle: 'View your latest transactions' },
} satisfies Meta<typeof InfoCard>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
export const WithIcon: StoryObj<typeof meta> = { args: { iconName: 'info' } };
