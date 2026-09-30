import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { BscOtpInput } from '../src/components/BscOtpInput';

const meta: Meta<typeof BscOtpInput> = {
  title: 'Verification/BscOtpInput',
  component: BscOtpInput,
};

export default meta;
type Story = StoryObj<typeof BscOtpInput>;

function Controlled(): React.JSX.Element {
  const [value, setValue] = useState('12');
  return <BscOtpInput value={value} onChangeText={setValue} />;
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithError: Story = {
  render: () => <BscOtpInput value="1234" onChangeText={() => {}} hasError errorMessage="Código incorrecto" />,
};

export const Disabled: Story = {
  render: () => <BscOtpInput value="" onChangeText={() => {}} enabled={false} />,
};
