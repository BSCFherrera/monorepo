import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { BscOtpCodeField } from '../src/components/BscOtpCodeField';

const meta: Meta<typeof BscOtpCodeField> = {
  title: 'Verification/BscOtpCodeField',
  component: BscOtpCodeField,
};

export default meta;
type Story = StoryObj<typeof BscOtpCodeField>;

function Controlled(): React.JSX.Element {
  const [otp, setOtp] = useState('');

  return (
    <BscOtpCodeField
      otp={otp}
      changeOtp={setOtp}
      validate={() => {}}
      resend={() => setOtp('')}
      timer={{ finished: false, label: '0:59' }}
    />
  );
}

export const Default: Story = {
  render: () => <Controlled />,
  parameters: {
    docs: {
      source: {
        code: `<BscOtpCodeField
  otp={otp}
  changeOtp={setOtp}
  validate={validate}
  resend={resend}
  timer={{ finished: false, label: '0:59' }}
/>`,
      },
    },
  },
};

export const ResendAvailable: Story = {
  render: () => (
    <BscOtpCodeField otp="" changeOtp={() => {}} resend={() => {}} timer={{ finished: true, label: '0:00' }} />
  ),
};

export const WithError: Story = {
  render: () => (
    <BscOtpCodeField
      otp="1234"
      changeOtp={() => {}}
      hasError
      errorText="El código ingresado no es válido"
      resend={() => {}}
      timer={{ finished: false, label: '0:30' }}
    />
  ),
};
