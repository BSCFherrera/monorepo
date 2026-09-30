import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../src';

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  argTypes: { checked: { control: 'boolean' }, disabled: { control: 'boolean' } },
  args: { label: 'Receive updates', checked: false, onChange: () => {} },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledCheckbox(props: Record<string, unknown>) {
  const [checked, setChecked] = useState(false);
  return <Checkbox {...props} checked={checked} onChange={setChecked} />;
}

export const Default: Story = { render: (args) => <ControlledCheckbox {...args} /> };
export const Checked: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
