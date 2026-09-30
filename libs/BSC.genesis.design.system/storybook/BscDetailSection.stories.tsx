import type { Meta, StoryObj } from '@storybook/react';

import { BscDetailRow, BscDetailSection } from '../src/components/BscDetailSection';

const meta: Meta<typeof BscDetailSection> = {
  title: 'Cards/BscDetailSection',
  component: BscDetailSection,
};

export default meta;
type Story = StoryObj<typeof BscDetailSection>;

export const Default: Story = {
  render: () => (
    <BscDetailSection title="Información de cuenta" icon="info">
      <BscDetailRow label="Número de cuenta" value="****1234" />
      <BscDetailRow label="Tipo" value="Corriente" />
      <BscDetailRow label="Saldo disponible" value="RD$ 12,540.00" emphasized />
    </BscDetailSection>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <BscDetailSection>
      <BscDetailRow label="Estado" value="Activa" valueColor="#059669" />
    </BscDetailSection>
  ),
};
