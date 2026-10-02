import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { BscSelectableListGroup } from '../src/components/BscSelectableListGroup';

const meta: Meta<typeof BscSelectableListGroup> = {
  title: 'Selection/BscSelectableListGroup',
  component: BscSelectableListGroup,
};

export default meta;
type Story = StoryObj<typeof BscSelectableListGroup>;

const verificationOptions = [
  {
    value: 'email',
    icon: 'mail',
    title: 'Correo electrónico',
    subtitle: 'C*******z@correo.com',
  },
  {
    value: 'sms',
    icon: 'smartphone',
    title: 'Mensaje de texto (SMS)',
    subtitle: '+52** **** **89',
  },
] as const;

function Controlled(): React.JSX.Element {
  const [value, setValue] = useState('email');

  return (
    <BscSelectableListGroup
      options={verificationOptions}
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
  const [value, setValue] = useState('email');

  return (
    <BscSelectableListGroup
      options={[
        {
          value: 'email',
          icon: 'mail',
          title: 'Correo electrónico',
          subtitle: 'C*******z@correo.com',
        },
        {
          value: 'sms',
          icon: 'smartphone',
          title: 'Mensaje de texto (SMS)',
          subtitle: '+52** **** **89',
        },
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

export const WithLabel: Story = {
  args: {
    label: 'Elige un método',
    options: verificationOptions,
    value: 'sms',
    onChange: () => undefined,
  },
};
