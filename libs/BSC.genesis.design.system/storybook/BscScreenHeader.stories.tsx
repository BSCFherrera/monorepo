import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { BscScreenHeader } from '../src/components/BscScreenHeader';

const meta: Meta<typeof BscScreenHeader> = {
  title: 'Navigation/BscScreenHeader',
  component: BscScreenHeader,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Detalle de cuenta',
    onBack: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof BscScreenHeader>;

export const Default: Story = {};

export const WithoutBack: Story = {
  args: { onBack: undefined },
};
