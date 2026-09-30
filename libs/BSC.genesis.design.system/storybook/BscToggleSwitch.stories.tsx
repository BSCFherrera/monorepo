import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { BscToggleSwitch } from '../src/components/BscToggleSwitch';

const meta: Meta<typeof BscToggleSwitch> = {
  title: 'Selection/BscToggleSwitch',
  component: BscToggleSwitch,
};

export default meta;
type Story = StoryObj<typeof BscToggleSwitch>;

function Controlled(): React.JSX.Element {
  const [value, setValue] = useState(true);
  return <BscToggleSwitch label="Notificaciones push" value={value} onValueChange={setValue} />;
}

export const Default: Story = {
  render: () => <Controlled />,
  parameters: {
    docs: {
      source: {
        code: `<BscToggleSwitch label="Notificaciones push" value={true} onValueChange={() => {}} />`,
      },
    },
  },
};

export const Disabled: Story = {
  args: { label: 'No disponible', value: false, disabled: true, onValueChange: () => {} },
};
