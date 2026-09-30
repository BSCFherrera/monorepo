import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';
import { fn } from '@storybook/test';

import {
  BscActionCard,
  BscCard,
  BscInfoCard,
  BscPlaceholder,
  BscSectionHeader,
} from '../src/components/BscCard';

const meta: Meta<typeof BscCard> = {
  title: 'Cards/BscCard',
  component: BscCard,
};

export default meta;
type Story = StoryObj<typeof BscCard>;

export const Default: Story = {
  args: {
    children: <Text>Contenido de la tarjeta</Text>,
  },
};

export const Pressable: Story = {
  args: {
    children: <Text>Tarjeta presionable</Text>,
    onPress: fn(),
  },
};

export const InfoCard: Story = {
  render: () => (
    <BscInfoCard title="Saldo disponible" subtitle="Cuenta corriente" iconName="wallet" />
  ),
};

export const ActionCardStandard: Story = {
  render: () => (
    <BscActionCard
      title="Transferir"
      subtitle="Entre tus cuentas"
      iconName="transfer"
      onPress={fn()}
    />
  ),
};

export const ActionCardRegistration: Story = {
  render: () => (
    <BscActionCard
      title="Completar registro"
      subtitle="Verifica tu identidad"
      iconName="verified"
      variant="registration"
      onPress={fn()}
    />
  ),
};

export const SectionHeader: Story = {
  render: () => (
    <BscSectionHeader title="Movimientos recientes" actionLabel="Ver todos" onAction={fn()} />
  ),
};

export const Placeholder: Story = {
  render: () => (
    <BscPlaceholder title="No hay movimientos" message="Aún no registras transacciones" />
  ),
};

export const PlaceholderError: Story = {
  render: () => (
    <BscPlaceholder title="No pudimos cargar tus datos" message="Intenta de nuevo" tone="error" />
  ),
};
