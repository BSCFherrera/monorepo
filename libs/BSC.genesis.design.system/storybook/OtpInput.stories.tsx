import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { OtpInput } from '../src';

const meta = {
  title: 'Verification/OtpInput',
  component: OtpInput,
  args: { length: 6, value: '', onChange: () => {} },
} satisfies Meta<typeof OtpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledOtp(props: Record<string, unknown>) {
  const [value, setValue] = useState('');
  return <OtpInput {...props} value={value} onChange={setValue} />;
}

export const Default: Story = { render: (args) => <ControlledOtp {...args} /> };
export const WithError: Story = { render: (args) => <ControlledOtp {...args} error /> };
export const Success: Story = { args: { value: '123456', success: true } };
export const Disabled: Story = { args: { value: '123456', disabled: true } };
export const FourDigits: Story = { render: (args) => <ControlledOtp {...args} length={4} /> };
