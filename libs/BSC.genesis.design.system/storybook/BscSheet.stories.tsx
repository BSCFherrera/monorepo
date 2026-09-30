import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Text } from 'react-native';

import { BscSheet } from '../src/components/BscSheet';
import { BscPrimaryButton } from '../src/components/BscButton';

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
};
