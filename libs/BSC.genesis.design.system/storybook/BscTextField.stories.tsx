import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BscTextField, type BscTextFieldProps } from '@bsc/ui-native';

const meta = {
  title: 'Forms/BscTextField',
  component: BscTextField,
  args: {
    label: 'Display name',
    placeholder: 'Type here...',
    value: '',
    onChangeText: () => {},
  },
} satisfies Meta<typeof BscTextField>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledField(props: BscTextFieldProps) {
  const [value, setValue] = useState(props.value ?? '');
  return <BscTextField {...props} value={value} onChangeText={setValue} />;
}

export const Default: Story = { render: args => <ControlledField {...args} /> };
export const Secure: Story = { render: args => <ControlledField {...args} secure label="Password" /> };
export const WithError: Story = { render: args => <ControlledField {...args} value="Invalid" error="This field is required." /> };
export const Disabled: Story = { args: { value: 'Read only content', editable: false } };
