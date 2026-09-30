import type { Meta, StoryObj } from '@storybook/react';

import { BscLoadingOverlay } from '../src/components/BscLoadingOverlay';

const meta: Meta<typeof BscLoadingOverlay> = {
  title: 'Feedback/BscLoadingOverlay',
  component: BscLoadingOverlay,
  parameters: { layout: 'fullscreen' },
  args: {
    visible: true,
  },
};

export default meta;
type Story = StoryObj<typeof BscLoadingOverlay>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: 'Procesando transferencia…' },
};
