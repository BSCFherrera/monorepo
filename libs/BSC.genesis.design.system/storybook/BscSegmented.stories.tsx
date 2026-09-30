import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { BscSegmented } from '../src/components/BscSegmented';

const meta: Meta<typeof BscSegmented> = {
  title: 'Selection/BscSegmented',
  component: BscSegmented,
};

export default meta;
type Story = StoryObj<typeof BscSegmented>;

function Controlled(): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <BscSegmented labels={['Pesos', 'Dólares']} selectedIndex={selectedIndex} onChange={setSelectedIndex} />
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

function ControlledThreeOptions(): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(1);
  return (
    <BscSegmented
      labels={['Día', 'Semana', 'Mes']}
      selectedIndex={selectedIndex}
      onChange={setSelectedIndex}
    />
  );
}

export const ThreeOptions: Story = {
  render: () => <ControlledThreeOptions />,
};
