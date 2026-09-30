import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from '../src';

const meta = {
  title: 'Forms/TextField',
  component: TextField,
  args: { placeholder: 'Type here...' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledField(props: Record<string, unknown>) {
  const [value, setValue] = useState('');
  return <TextField {...props} value={value} onChangeText={setValue} />;
}

export const Default: Story = { render: (args) => <ControlledField {...args} /> };
export const Disabled: Story = { args: { value: 'Disabled content', disabled: true } };
export const WithError: Story = { args: { value: 'Invalid', error: true } };
