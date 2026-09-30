import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { BscLoadingOverlay } from '@bsc/ui-native';

const meta = {
  title: 'Feedback/BscLoadingOverlay',
  component: BscLoadingOverlay,
  args: { visible: true, label: 'Loading...' },
} satisfies Meta<typeof BscLoadingOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <View style={{ height: 300, width: '100%', position: 'relative' }}>
      <BscLoadingOverlay {...args} />
    </View>
  ),
};
export const Static: Story = {
  render: (args) => (
    <View style={{ height: 300, width: '100%', position: 'relative' }}>
      <BscLoadingOverlay {...args} animated={false} />
    </View>
  ),
};
