import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { BscSelect } from '../src/components/BscSelect';
import type { SelectOption } from '@bsc/contracts';

const meta: Meta<typeof BscSelect> = {
  title: 'Selection/BscSelect',
  component: BscSelect,
};

export default meta;
type Story = StoryObj<typeof BscSelect>;

const OPTIONS: SelectOption<string>[] = [
  { key: 'checking', label: 'Cuenta corriente', detail: '****1234', value: 'checking' },
  { key: 'savings', label: 'Cuenta de ahorros', detail: '****5678', value: 'savings' },
  { key: 'credit', label: 'Tarjeta de crédito', detail: '****9012', value: 'credit' },
];

function Controlled(): React.JSX.Element {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  return (
    <BscSelect
      title="Selecciona una cuenta"
      placeholder="Elige una cuenta"
      options={OPTIONS}
      selectedKey={selectedKey}
      onSelect={option => setSelectedKey(option.key)}
    />
  );
}

export const Default: Story = {
  render: () => <Controlled />,
  parameters: {
    docs: {
      source: {
        code: `<BscSelect
  title="Selecciona una cuenta"
  placeholder="Elige una cuenta"
  options={OPTIONS}
  selectedKey={null}
  onSelect={() => {}}
/>`,
      },
    },
  },
};

export const WithError: Story = {
  render: () => (
    <BscSelect
      title="Selecciona un destino"
      placeholder="Elige un destino"
      options={OPTIONS}
      selectedKey={null}
      onSelect={() => {}}
      error="Debes elegir un destino"
    />
  ),
};
