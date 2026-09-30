import type { Meta, StoryObj } from '@storybook/react';

import { BscErrorText } from '../src/components/BscErrorText';

const meta: Meta<typeof BscErrorText> = {
  title: 'Forms/BscErrorText',
  component: BscErrorText,
  args: {
    text: 'El código ingresado no es válido',
  },
};

export default meta;
type Story = StoryObj<typeof BscErrorText>;

export const Default: Story = {};

export const CustomIcon: Story = {
  args: { text: 'Revisa tu conexión', iconName: 'cloud-off' },
};
