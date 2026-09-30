import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { BscToast } from '../src/components/BscToast';
import { BscPrimaryButton } from '../src/components/BscButton';

const meta: Meta<typeof BscToast> = {
  title: 'Feedback/BscToast',
  component: BscToast,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof BscToast>;

function Controlled(): React.JSX.Element {
  const [message, setMessage] = useState<string | null>('Número copiado');
  return (
    <>
      <BscPrimaryButton label="Copiar número de cuenta" onPress={() => setMessage('Número copiado')} />
      <BscToast message={message} onHide={() => setMessage(null)} />
    </>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

function ControlledLongMessage(): React.JSX.Element {
  const [message, setMessage] = useState<string | null>(
    'No pudimos completar la transferencia. Verifica tu conexión e inténtalo de nuevo.',
  );
  return <BscToast message={message} onHide={() => setMessage(null)} durationMs={8_000} />;
}

export const LongMessage: Story = {
  render: () => <ControlledLongMessage />,
};
