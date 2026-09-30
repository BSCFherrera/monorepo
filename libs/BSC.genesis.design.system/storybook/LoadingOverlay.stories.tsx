import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { LoadingOverlay } from '../src';

const meta = {
  title: 'Feedback/LoadingOverlay',
  component: LoadingOverlay,
  args: { visible: true, label: 'Loading...' },
} satisfies Meta<typeof LoadingOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <View style={{ height: 300, width: '100%', position: 'relative' }}>
      <LoadingOverlay {...args} />
    </View>
  ),
};
export const Static: Story = {
  render: (args) => (
    <View style={{ height: 300, width: '100%', position: 'relative' }}>
      <LoadingOverlay {...args} animated={false} />
    </View>
  ),
};
