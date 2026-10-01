import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { BscRadioGroup } from '../src/components/BscRadioGroup';

const meta: Meta<typeof BscRadioGroup> = {
  title: 'Selection/BscRadioGroup',
  component: BscRadioGroup,
};

export default meta;
type Story = StoryObj<typeof BscRadioGroup>;

const documentOptions = [
  { label: 'Cédula', value: 'cedula' },
  { label: 'Pasaporte', value: 'pasaporte' },
] as const;

function Controlled(): React.JSX.Element {
  const [value, setValue] = useState('cedula');

  return (
    <BscRadioGroup
      label="Tipo de documento"
      options={documentOptions}
      value={value}
      onChange={setValue}
    />
  );
}

export const Default: Story = {
  render: () => <Controlled />,
  parameters: {
    docs: {
      source: {
        code: `function Example(): React.JSX.Element {
  const [value, setValue] = useState('cedula');

  return (
    <BscRadioGroup
      label="Tipo de documento"
      options={[
        { label: 'Cédula', value: 'cedula' },
        { label: 'Pasaporte', value: 'pasaporte' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
}`,
      },
    },
  },
};

export const Vertical: Story = {
  args: {
    label: 'Tipo de documento',
    direction: 'vertical',
    options: documentOptions,
    value: 'pasaporte',
    onChange: () => undefined,
  },
};
