import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BscCheckbox, type BscCheckboxProps } from '@bsc/ui-native';

const meta = {
  title: 'Forms/BscCheckbox',
  component: BscCheckbox,
  args: {
    label: 'Accept terms',
    checked: false,
    onChange: () => {},
  },
} satisfies Meta<typeof BscCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledCheckbox(props: BscCheckboxProps) {
  const [checked, setChecked] = useState(props.checked);
  return <BscCheckbox {...props} checked={checked} onChange={setChecked} />;
}

export const Default: Story = { render: args => <ControlledCheckbox {...args} /> };
export const Checked: Story = { render: args => <ControlledCheckbox {...args} checked /> };
export const Disabled: Story = { args: { disabled: true } };
