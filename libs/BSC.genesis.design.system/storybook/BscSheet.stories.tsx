import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { BscSheet } from '../src/components/BscSheet';
import { BscPrimaryButton, BscSecondaryButton } from '../src/components/BscButton';

const meta: Meta<typeof BscSheet> = {
  title: 'Modals/Surfaces/BscSheet',
  component: BscSheet,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof BscSheet>;

function Controlled(): React.JSX.Element {
  const [visible, setVisible] = useState(true);
  return (
    <>
      <BscPrimaryButton label="Abrir hoja" onPress={() => setVisible(true)} />
      <BscSheet
        visible={visible}
        title="¿Qué deseas hacer?"
        onClose={() => setVisible(false)}
        footnote="Puedes cambiar esto luego en Ajustes."
      >
        <Text>Contenido de la hoja modal.</Text>
      </BscSheet>
    </>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
  parameters: {
    docs: {
      source: {
        code: `<>
  <BscPrimaryButton label="Abrir hoja" onPress={() => {}} />
  <BscSheet
    visible
    title="¿Qué deseas hacer?"
    onClose={() => {}}
    footnote="Puedes cambiar esto luego en Ajustes."
  >
    <Text>Contenido de la hoja modal.</Text>
  </BscSheet>
</>`,
      },
    },
  },
};

function ControlledWithFooter(): React.JSX.Element {
  const [visible, setVisible] = useState(true);
  return (
    <>
      <BscPrimaryButton label="Abrir hoja" onPress={() => setVisible(true)} />
      <BscSheet
        visible={visible}
        title="Cerrar cuenta"
        onClose={() => setVisible(false)}
        canDismiss={false}
        footer={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <BscSecondaryButton label="Cancelar" onPress={() => setVisible(false)} style={{ flex: 1 }} />
            <BscPrimaryButton label="Confirmar" onPress={() => setVisible(false)} style={{ flex: 1 }} />
          </View>
        }
      >
        <Text>Esta acción no se puede deshacer. ¿Deseas continuar?</Text>
      </BscSheet>
    </>
  );
}

export const WithFooter: Story = {
  render: () => <ControlledWithFooter />,
  parameters: {
    docs: {
      source: {
        code: `<>
  <BscPrimaryButton label="Abrir hoja" onPress={() => {}} />
  <BscSheet
    visible
    title="Cerrar cuenta"
    onClose={() => {}}
    canDismiss={false}
    footer={
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <BscSecondaryButton label="Cancelar" onPress={() => {}} style={{ flex: 1 }} />
        <BscPrimaryButton label="Confirmar" onPress={() => {}} style={{ flex: 1 }} />
      </View>
    }
  >
    <Text>Esta acción no se puede deshacer. ¿Deseas continuar?</Text>
  </BscSheet>
</>`,
      },
    },
  },
};
