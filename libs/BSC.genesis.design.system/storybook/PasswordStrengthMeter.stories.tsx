import type { Meta, StoryObj } from '@storybook/react';
import { PasswordStrengthMeter } from '../src';

const meta = {
  title: 'Forms/PasswordStrengthMeter',
  component: PasswordStrengthMeter,
  argTypes: { level: { control: { type: 'range', min: 0, max: 4, step: 1 } } },
  args: { level: 2, label: 'Medium strength' },
} satisfies Meta<typeof PasswordStrengthMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { level: 0, label: '' } };
export const Weak: Story = { args: { level: 1, label: 'Weak' } };
export const Medium: Story = { args: { level: 2, label: 'Medium' } };
export const Strong: Story = { args: { level: 3, label: 'Strong' } };
export const MaxLevel: Story = { args: { level: 4, label: 'Very strong' } };
