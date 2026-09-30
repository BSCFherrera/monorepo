import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToggleSwitch } from '../src';

const meta = {
  title: 'Forms/ToggleSwitch',
  component: ToggleSwitch,
  args: { label: 'Notifications', value: false, onValueChange: () => {} },
} satisfies Meta<typeof ToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledToggle(props: Record<string, unknown>) {
  const [value, setValue] = useState(false);
  return <ToggleSwitch {...props} value={value} onValueChange={setValue} />;
}

export const Default: Story = { render: (args) => <ControlledToggle {...args} /> };
export const On: Story = { args: { value: true } };
export const Disabled: Story = { args: { disabled: true } };
