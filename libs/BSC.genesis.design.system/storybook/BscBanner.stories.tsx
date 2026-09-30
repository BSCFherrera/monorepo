import type { Meta, StoryObj } from '@storybook/react';

import { BscBanner, type BscBannerTone } from '../src/components/BscBanner';

const meta: Meta<typeof BscBanner> = {
  title: 'Cards/BscBanner',
  component: BscBanner,
  args: {
    title: 'Pago vencido',
    subtitle: 'Regulariza tu tarjeta antes del 15',
    icon: 'warning',
  },
};

export default meta;
type Story = StoryObj<typeof BscBanner>;

export const Success: Story = {
  args: { title: 'Transferencia exitosa', subtitle: undefined, icon: 'check-circle', tone: 'success' },
};

const TONES: BscBannerTone[] = ['success', 'info', 'warning', 'danger', 'neutral'];

export const AllTones: Story = {
  render: () => (
    <>
      {TONES.map(tone => (
        <BscBanner key={tone} title={`Tono: ${tone}`} icon="info" tone={tone} />
      ))}
    </>
  ),
};
