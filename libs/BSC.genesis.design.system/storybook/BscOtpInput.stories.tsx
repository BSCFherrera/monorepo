import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BscOtpInput, type BscOtpInputProps } from '@bsc/ui-native';

const meta = {
  title: 'Verification/BscOtpInput',
  component: BscOtpInput,
  args: {
    length: 6,
    value: '',
    onChangeText: () => {},
  },
} satisfies Meta<typeof BscOtpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledOtp(props: BscOtpInputProps) {
  const [value, setValue] = useState(props.value);
  return <BscOtpInput {...props} value={value} onChangeText={setValue} />;
}

export const Default: Story = { render: args => <ControlledOtp {...args} /> };
export const WithError: Story = { render: args => <ControlledOtp {...args} value="123" hasError errorMessage="Invalid verification code." /> };
export const Disabled: Story = { args: { value: '123456', enabled: false } };
