import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { BscPrimaryButton, BscSecondaryButton, BscTextButton } from '../src/components/BscButton';

const meta: Meta<typeof BscPrimaryButton> = {
  title: 'Actions/BscButton',
  component: BscPrimaryButton,
  args: {
    label: 'Continuar',
    onPress: fn(),
  },
  argTypes: {
    size: { control: 'select', options: [undefined, 'sm', 'md', 'lg', 'xl'] },
  },
};

export default meta;
type Story = StoryObj<typeof BscPrimaryButton>;

export const Primary: Story = {};

export const PrimaryLoading: Story = { args: { loading: true } };

export const PrimaryDisabled: Story = { args: { disabled: true } };

export const PrimaryCustomColor: Story = {
  args: { label: 'Cerrar sesión', color: '#DC2626' },
};

export const Secondary: Story = {
  render: args => <BscSecondaryButton {...args} />,
};

export const SecondaryLoading: Story = {
  render: args => <BscSecondaryButton {...args} />,
  args: { loading: true },
};

export const Text: Story = {
  render: args => <BscTextButton {...args} />,
  args: { label: 'Cancelar' },
};
