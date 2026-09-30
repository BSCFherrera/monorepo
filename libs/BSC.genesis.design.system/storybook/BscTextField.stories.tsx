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
  parameters: {
    docs: {
      source: {
        code: `<BscTextField
  label="Correo electrónico"
  placeholder="nombre@banco.com"
  value=""
  onChangeText={() => {}}
/>`,
      },
    },
  },
};

export const WithError: Story = {
  render: () => <Controlled value="correo-invalido" error="Ingresa un correo válido" />,
  parameters: {
    docs: {
      source: {
        code: `<BscTextField
  label="Correo electrónico"
  placeholder="nombre@banco.com"
  value="correo-invalido"
  error="Ingresa un correo válido"
  onChangeText={() => {}}
/>`,
      },
    },
  },
};

export const Secure: Story = {
  render: () => <Controlled label="Contraseña" placeholder="••••••••" secure />,
  parameters: {
    docs: {
      source: {
        code: `<BscTextField
  label="Contraseña"
  placeholder="••••••••"
  value=""
  secure
  onChangeText={() => {}}
/>`,
      },
    },
  },
};

export const Disabled: Story = {
  render: () => <Controlled value="No editable" editable={false} />,
  parameters: {
    docs: {
      source: {
        code: `<BscTextField
  label="Correo electrónico"
  placeholder="nombre@banco.com"
  value="No editable"
  editable={false}
  onChangeText={() => {}}
/>`,
      },
    },
  },
};
