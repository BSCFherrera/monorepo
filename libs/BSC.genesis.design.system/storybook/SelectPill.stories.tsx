import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SelectPill, type SelectPillProps } from '../src';

const meta = {
  title: 'Selection/SelectPill',
  component: SelectPill,
  args: {
    onSelect: () => {},
    label: 'View mode',
    options: [
      { label: 'Personal', value: 'personal', iconName: 'user' },
      { label: 'Business', value: 'business', iconName: 'file-text' },
    ],
    value: 'personal',
  },
} satisfies Meta<typeof SelectPill>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledPill(props: SelectPillProps) {
  const [value, setValue] = useState('personal');
  return <SelectPill {...props} value={value} onSelect={setValue} />;
}

export const Default: Story = { render: (args) => <ControlledPill {...args} /> };
