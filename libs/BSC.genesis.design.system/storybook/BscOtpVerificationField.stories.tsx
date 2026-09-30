import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { BscOtpVerificationField, type BscOtpVerificationOption } from '../src/components/BscOtpVerificationField';

const meta: Meta<typeof BscOtpVerificationField> = {
  title: 'Verification/BscOtpVerificationField',
  component: BscOtpVerificationField,
};

export default meta;
type Story = StoryObj<typeof BscOtpVerificationField>;

const OPTIONS: BscOtpVerificationOption[] = [
  { label: 'Correo ****@banco.com', value: 'email' },
  { label: 'SMS ****1234', value: 'sms' },
];

function Controlled(): React.JSX.Element {
  const [selectedValue, setSelectedValue] = useState<string | number | null>('sms');
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState('');

  return (
    <BscOtpVerificationField
      options={OPTIONS}
      selectedValue={selectedValue}
      onSelect={setSelectedValue}
      codeSent={codeSent}
      onSend={() => setCodeSent(true)}
      otp={otp}
      onChange={setOtp}
      onResend={() => setOtp('')}
      timer={{ finished: true, label: '' }}
      sentText="Enviamos un código a tu destino"
    />
  );
}

export const Default: Story = {
  render: () => <Controlled />,
  parameters: {
    docs: {
      source: {
        code: `<BscOtpVerificationField
  options={OPTIONS}
  selectedValue="sms"
  onSelect={() => {}}
  codeSent={false}
  onSend={() => {}}
  otp=""
  onChange={() => {}}
  onResend={() => {}}
  timer={{ finished: true, label: '' }}
  sentText="Enviamos un código a tu destino"
/>`,
      },
    },
  },
};

export const Verified: Story = {
  render: () => (
    <BscOtpVerificationField
      options={OPTIONS}
      selectedValue="sms"
      codeSent
      otp="123456"
      verified
      timer={{ finished: true, label: '' }}
    />
  ),
};

export const WithError: Story = {
  render: () => (
    <BscOtpVerificationField
      options={OPTIONS}
      selectedValue="sms"
      codeSent
      otp="1234"
      hasError
      errorText="El código ingresado no es válido"
      timer={{ finished: false, label: '00:45' }}
    />
  ),
};
