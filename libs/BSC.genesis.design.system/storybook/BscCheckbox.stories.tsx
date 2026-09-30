import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { BscCheckbox } from '../src/components/BscCheckbox';

const meta: Meta<typeof BscCheckbox> = {
  title: 'Selection/BscCheckbox',
  component: BscCheckbox,
};

export default meta;
type Story = StoryObj<typeof BscCheckbox>;

function Controlled(): React.JSX.Element {
  const [checked, setChecked] = useState(false);
  return <BscCheckbox label="Acepto los términos y condiciones" checked={checked} onChange={setChecked} />;
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const Disabled: Story = {
  args: { label: 'No disponible', checked: false, disabled: true, onChange: () => {} },
};
