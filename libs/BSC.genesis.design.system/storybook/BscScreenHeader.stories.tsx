import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';
import { BscScreenHeader } from '@bsc/ui-native';

const meta = {
  title: 'Navigation/BscScreenHeader',
  parameters: { layout: 'fullscreen' },
  component: BscScreenHeader,
  args: {
    title: 'Account Details',
    onBack: () => {},
  },
} satisfies Meta<typeof BscScreenHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TitleOnly: Story = { args: { onBack: undefined } };
export const WithContent: Story = {
  args: {
    children: <Text style={{ color: '#FFFFFF', textAlign: 'center', paddingBottom: 16 }}>Available balance: RD$ 25,000</Text>,
  },
};
