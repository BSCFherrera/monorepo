import type { Meta, StoryObj } from '@storybook/react';
import { BscActionCard } from '@bsc/ui-native';

const meta = {
  title: 'Cards/BscActionCard',
  component: BscActionCard,
  args: { title: 'Explore details', subtitle: 'Tap to view more information' },
} satisfies Meta<typeof BscActionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = { args: { onPress: () => {} } };
export const Registration: Story = { args: { variant: 'registration', title: 'First time here?', subtitle: 'Create your account', iconName: 'person', onPress: () => {} } };
export const Disabled: Story = { args: { disabled: true, onPress: () => {} } };
