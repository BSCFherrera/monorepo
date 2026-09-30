import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BscToggleSwitch, type BscToggleSwitchProps } from '@bsc/ui-native';

const meta = {
  title: 'Forms/BscToggleSwitch',
  component: BscToggleSwitch,
  args: {
    label: 'Enable notifications',
    value: false,
    onValueChange: () => {},
  },
} satisfies Meta<typeof BscToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledSwitch(props: BscToggleSwitchProps) {
  const [value, setValue] = useState(props.value);
  return <BscToggleSwitch {...props} value={value} onValueChange={setValue} />;
}

export const Default: Story = { render: args => <ControlledSwitch {...args} /> };
export const On: Story = { render: args => <ControlledSwitch {...args} value /> };
export const Disabled: Story = { args: { disabled: true } };
