import type { Meta, StoryObj } from '@storybook/react';

import { BscSpinner } from '../src/components/BscSpinner';

const meta: Meta<typeof BscSpinner> = {
  title: 'Feedback/BscSpinner',
  component: BscSpinner,
};

export default meta;
type Story = StoryObj<typeof BscSpinner>;

export const FullScreen: Story = { args: { tamano: 'fullScreen' } };

export const InButton: Story = { args: { tamano: 'inButton' } };
