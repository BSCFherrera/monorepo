import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';

import { BscLogo } from '../src/components/BscLogo';

const meta: Meta<typeof BscLogo> = {
  title: 'Actions/BscLogo',
  component: BscLogo,
};

export default meta;
type Story = StoryObj<typeof BscLogo>;

export const OnDark: Story = {
  args: { onDark: true, height: 44 },
  decorators: [
    Story => (
      <View style={{ backgroundColor: '#003594', padding: 24, borderRadius: 12 }}>
        <Story />
      </View>
    ),
  ],
};

export const OnLight: Story = {
  args: { onDark: false, height: 44 },
};
