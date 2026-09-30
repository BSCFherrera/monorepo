import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';

import { BscIcon, type BscIconName } from '../src/components/BscIcon';
import { BscColors } from '../src/theme/colors';

const meta: Meta<typeof BscIcon> = {
  title: 'Actions/BscIcon',
  component: BscIcon,
  args: {
    name: 'home',
    size: 24,
    color: BscColors.primary,
  },
};

export default meta;
type Story = StoryObj<typeof BscIcon>;

export const Single: Story = {};

const SAMPLE_ICONS: BscIconName[] = [
  'home',
  'transfer',
  'card',
  'wallet',
  'bank',
  'person',
  'bell',
  'chevron-right',
  'check-circle',
  'warning',
  'lock',
  'logout',
];

export const Catalog: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      {SAMPLE_ICONS.map(name => (
        <View key={name} style={{ alignItems: 'center', width: 64 }}>
          <BscIcon name={name} size={24} color={BscColors.primary} />
        </View>
      ))}
    </View>
  ),
};
