import type { Meta, StoryObj } from '@storybook/react';

import { BscRadio } from '../src/components/BscRadio';

const meta: Meta<typeof BscRadio> = {
  title: 'Selection/BscRadio',
  component: BscRadio,
};

export default meta;
type Story = StoryObj<typeof BscRadio>;

export const Selected: Story = { args: { selected: true } };

export const Unselected: Story = { args: { selected: false } };
