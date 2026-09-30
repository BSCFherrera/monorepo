import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { fn } from '@storybook/test';

import { BscIconTile, BscListRow, BscPill, BscRowDivider } from '../src/components/BscRow';

const meta: Meta<typeof BscListRow> = {
  title: 'Actions/BscRow',
  component: BscListRow,
};

export default meta;
type Story = StoryObj<typeof BscListRow>;

export const ListRow: Story = {
  args: {
    title: 'Cuenta corriente',
    subtitle: '****1234',
    trailingLabel: 'RD$ 12,540.00',
    showChevron: true,
    onPress: fn(),
  },
};

export const ListRowWithLeading: Story = {
  args: {
    title: 'Transferencia enviada',
    subtitle: 'Hoy, 10:32 a.m.',
    trailingLabel: '-RD$ 500.00',
    trailingSubLabel: 'Completada',
    leading: <BscIconTile icon="arrow-out" />,
  },
};

export const IconTile: Story = {
  render: () => <BscIconTile icon="wallet" />,
};

export const Divider: Story = {
  render: () => (
    <View style={{ width: 240 }}>
      <BscRowDivider />
    </View>
  ),
};

export const Pill: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <BscPill label="Activa" icon="check-circle" />
      <BscPill label="Vencida" color="#B91C1C" icon="warning" />
    </View>
  ),
};
