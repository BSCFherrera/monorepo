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

export const Payment: Story = {
  args: {
    icon: 'payments',
    title: 'Pago de tarjeta de crédito',
    subtitle: 'Tarjeta ****9012',
    trailing: 'RD$ 8,240.50',
    trailingLabel: 'Pagado',
  },
};

export const LongTitle: Story = {
  args: {
    icon: 'bank',
    title: 'Transferencia interbancaria a Constructora Rivas y Asociados SRL',
    subtitle: 'Banco de Reservas ****4321',
    trailing: 'RD$ 125,000.00',
    trailingLabel: 'Monto',
  },
};
