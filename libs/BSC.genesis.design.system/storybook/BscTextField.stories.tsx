import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { BscTextField, type BscTextFieldProps } from '../src/components/BscTextField';

const meta: Meta<typeof BscTextField> = {
  title: 'Forms/BscTextField',
  component: BscTextField,
};

export default meta;
type Story = StoryObj<typeof BscTextField>;

function Controlled(props: Partial<BscTextFieldProps>): React.JSX.Element {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <BscTextField
      label="Correo electrónico"
      placeholder="nombre@banco.com"
      {...props}
      value={value}
      onChangeText={setValue}
    />
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithError: Story = {
  render: () => <Controlled value="correo-invalido" error="Ingresa un correo válido" />,
};

export const Secure: Story = {
  render: () => <Controlled label="Contraseña" placeholder="••••••••" secure />,
};

export const Disabled: Story = {
  render: () => <Controlled value="No editable" editable={false} />,
};
