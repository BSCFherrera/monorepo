import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { BscEmptyState } from '../src/components/BscEmptyState';

const meta: Meta<typeof BscEmptyState> = {
  title: 'Cards/BscEmptyState',
  component: BscEmptyState,
  args: {
    icon: 'people',
    title: 'Aún no tienes beneficiarios',
    message: 'Agrega uno para empezar a transferir',
  },
};

export default meta;
type Story = StoryObj<typeof BscEmptyState>;

export const NoAction: Story = {};

export const WithAction: Story = {
  args: {
    icon: 'cloud-off',
    title: 'No pudimos cargarlos',
    message: 'Revisa tu conexión e intenta de nuevo',
    actionLabel: 'Reintentar',
    onAction: fn(),
  },
};
