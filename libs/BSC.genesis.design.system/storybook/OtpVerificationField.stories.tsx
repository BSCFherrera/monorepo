import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { OtpVerificationField, type OtpVerificationFieldProps } from '../src';

const meta = {
  title: 'Verification/OtpVerificationField', component: OtpVerificationField,
  args: { value: '', onChange: () => {}, onVerify: () => {}, options: [{ label: 'Demo destination A', value: 0 }, { label: 'Demo destination B', value: 1 }], selectedValue: 0 },
} satisfies Meta<typeof OtpVerificationField>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example(props: OtpVerificationFieldProps) {
  const [value, setValue] = useState(props.value);
  const [sent, setSent] = useState(props.codeSent ?? false);
  const [verified, setVerified] = useState(false);
  const [destination, setDestination] = useState<string | number>(0);
  return <OtpVerificationField {...props} value={value} onChange={setValue} codeSent={sent} verified={verified} selectedValue={destination} onSelect={setDestination} onSend={() => setSent(true)} onResend={() => setValue('')} onVerify={() => setVerified(true)} sentText="A demo code was prepared for the selected destination." />;
}
export const Default: Story = {
  parameters: { docs: { source: { code: `<OtpVerificationField
  value={code}
  onChange={setCode}
  options={[
    { label: 'Destination A', value: 0 },
    { label: 'Destination B', value: 1 },
  ]}
  selectedValue={destination}
  onSelect={setDestination}
  codeSent={codeSent}
  onSend={handleSend}
  onVerify={handleVerify}
/>` } } },
  render: args => <Example {...args} />,
};
export const WithError: Story = {
  args: { codeSent: true, error: true, errorText: 'Please check the six-digit demo code.' },
  parameters: { docs: { source: { code: `<OtpVerificationField
  value={code}
  onChange={setCode}
  options={options}
  selectedValue={destination}
  onSelect={setDestination}
  codeSent
  error
  errorText="Please check the six-digit demo code."
  onVerify={handleVerify}
/>` } } },
  render: args => <Example {...args} />,
};
export const SentState: Story = {
  args: { codeSent: true, timer: { finished: false, label: '00:45' } },
  parameters: { docs: { source: { code: `<OtpVerificationField
  value={code}
  onChange={setCode}
  options={options}
  selectedValue={destination}
  onSelect={setDestination}
  codeSent
  timer={{ finished: false, label: '00:45' }}
  onVerify={handleVerify}
/>` } } },
  render: args => <Example {...args} />,
};
export const Resend: Story = {
  args: { codeSent: true },
  parameters: { docs: { source: { code: `<OtpVerificationField
  value={code}
  onChange={setCode}
  options={options}
  selectedValue={destination}
  onSelect={setDestination}
  codeSent
  onResend={handleResend}
  onVerify={handleVerify}
/>` } } },
  render: args => <Example {...args} />,
};
