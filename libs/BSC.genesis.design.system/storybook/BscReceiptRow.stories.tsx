import type { Meta, StoryObj } from '@storybook/react';

import { BscReceiptRow } from '../src/components/BscReceiptRow';

const meta: Meta<typeof BscReceiptRow> = {
  title: 'Cards/BscReceiptRow',
  component: BscReceiptRow,
  args: {
    icon: 'transfer',
    title: 'Transferencia a Juan Pérez',
    subtitle: 'Cuenta ****5678',
    trailing: 'RD$ 1,500.00',
    trailingLabel: 'Monto',
  },
};

export default meta;
type Story = StoryObj<typeof BscReceiptRow>;

export const Default: Story = {};
