import type { Meta, StoryObj } from '@storybook/react';

import { BscConnectionBanner } from '../src/components/BscConnectionBanner';

const meta: Meta<typeof BscConnectionBanner> = {
  title: 'Conversation/BscConnectionBanner',
  component: BscConnectionBanner,
  args: {
    state: 'reconnecting',
    title: 'Reconectando…',
    subtitle: 'Estamos recuperando la conexión con tu asistente.',
  },
};

export default meta;
type Story = StoryObj<typeof BscConnectionBanner>;

export const Reconnecting: Story = {};

export const Offline: Story = {
  args: {
    state: 'offline',
    title: 'No pudimos conectar con tu asistente',
    subtitle: 'Revisa tu conexión a internet e inténtalo de nuevo.',
    retryLabel: 'Reintentar',
    onRetry: () => undefined,
  },
};
