import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Button } from '../src';

const meta = {
  title: 'Actions/Button',
  component: Button,
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'text'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    pill: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    onPress: { control: false },
  },
  args: {
    label: 'Save',
    onPress: () => action('Button pressed')(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const TextVariant: Story = { args: { variant: 'text', label: 'Text button' } };
export const Small: Story = { args: { size: 'small' } };
export const Large: Story = { args: { size: 'large' } };
export const Pill: Story = { args: { pill: true, label: 'Pill button' } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
