import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../src';

const meta = {
  title: 'Forms/Input',
  component: Input,
  argTypes: {
    label: { control: 'text' },
    error: { control: 'text' },
    helperText: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    label: 'Display name',
    helperText: 'Use a public nickname.',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledInput(props: Record<string, unknown>) {
  const [value, setValue] = useState('');
  return <Input {...props} value={value} onChangeText={setValue} />;
}

export const Default: Story = { render: (args) => <ControlledInput {...args} /> };
export const WithError: Story = { args: { error: 'This field is required.', helperText: undefined } };
export const Disabled: Story = { args: { value: 'Read only content', disabled: true } };
export const ReadOnly: Story = { args: { value: 'Reference value', readOnly: true } };
