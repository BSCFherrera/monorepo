import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select, type SelectProps } from '../src';

const meta = {
  title: 'Selection/Select',
  component: Select,
  args: {
    onChange: () => {},
    label: 'Frequency',
    placeholder: 'Choose an option',
    options: [
      { label: 'Never', value: 0 },
      { label: 'Weekly', value: 1 },
      { label: 'Monthly', value: 2 },
      { label: 'Unavailable', value: 3, disabled: true },
    ],
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledSelect(props: SelectProps) {
  const [value, setValue] = useState<string | number | null>(null);
  return <Select {...props} value={value} onChange={setValue} />;
}

export const Default: Story = { render: (args) => <ControlledSelect {...args} /> };
export const Disabled: Story = { args: { disabled: true } };
export const WithError: Story = { render: (args) => <ControlledSelect {...args} error /> };
