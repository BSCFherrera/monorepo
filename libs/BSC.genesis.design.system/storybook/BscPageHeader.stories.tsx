import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';
import { BscPageHeader, BscPill } from '@bsc/ui-native';

const meta = {
  title: 'Navigation/BscPageHeader',
  parameters: { layout: 'fullscreen' },
  component: BscPageHeader,
  args: {
    title: 'Beneficiaries',
    subtitle: 'Manage saved recipients',
    onBack: () => {},
  },
} satisfies Meta<typeof BscPageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutBack: Story = { args: { onBack: undefined } };
export const WithTrailing: Story = {
  args: {
    trailing: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Edit</Text>,
  },
};
export const WithBottom: Story = {
  args: {
    bottom: <BscPill label="Active" />,
  },
};
