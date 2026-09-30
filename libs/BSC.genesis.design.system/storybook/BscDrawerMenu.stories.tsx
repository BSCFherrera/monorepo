import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from '@storybook/test';

import { BscDrawerMenu, type BscDrawerMenuGroup } from '../src/components/BscDrawerMenu';
import { BscPrimaryButton } from '../src/components/BscButton';

const meta: Meta<typeof BscDrawerMenu> = {
  title: 'Navigation/BscDrawerMenu',
  component: BscDrawerMenu,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof BscDrawerMenu>;

const GROUPS: readonly BscDrawerMenuGroup[] = [
  {
    title: 'NAVEGACIÓN',
    items: [
      { id: 'chat', label: 'Asistente principal', onPress: fn() },
      { id: 'transactions', label: 'Transacciones', onPress: fn() },
      { id: 'products', label: 'Productos', onPress: fn() },
      { id: 'profile', label: 'Editar perfil', onPress: fn() },
    ],
  },
];

function Controlled(): React.JSX.Element {
  const [visible, setVisible] = useState(true);
  return (
    <>
      <BscPrimaryButton label="Abrir menú" onPress={() => setVisible(true)} />
      <BscDrawerMenu
        visible={visible}
        onClose={() => setVisible(false)}
        groups={GROUPS}
        selectedId="chat"
        onLogout={fn()}
        history={[
          { id: 'h1', title: 'Transferencia a contacto', preview: 'Consulta de límite', onPress: fn() },
          { id: 'h2', title: 'Solicitud de tarjeta', preview: 'Documentos para tarjeta', onPress: fn() },
        ]}
      />
    </>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

function ControlledNoHistory(): React.JSX.Element {
  const [visible, setVisible] = useState(true);
  return (
    <>
      <BscPrimaryButton label="Abrir menú" onPress={() => setVisible(true)} />
      <BscDrawerMenu
        visible={visible}
        onClose={() => setVisible(false)}
        groups={GROUPS}
        selectedId="transactions"
        onLogout={fn()}
        history={[]}
      />
    </>
  );
}

export const NoHistory: Story = {
  render: () => <ControlledNoHistory />,
};
