import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BscInfoModal } from '../src/components/BscInfoModal';
import { BscModal } from '../src/components/BscModal';
import { BscPrimaryButton } from '../src/components/BscButton';

const meta: Meta<typeof BscModal> = {
  title: 'Modals/Surfaces/BscModal',
  component: BscModal,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof BscModal>;

function BaseModalExample(): React.JSX.Element {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <BscPrimaryButton label="Abrir modal" onPress={() => setVisible(true)} />
      <BscModal visible={visible} title="Iniciar sesión" onClose={() => setVisible(false)}>
        <Text>Este modal base acepta cualquier ReactNode como contenido.</Text>
      </BscModal>
    </>
  );
}

export const Base: Story = {
  render: () => <BaseModalExample />,
};

function ExpandedModalExample(): React.JSX.Element {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <BscPrimaryButton label="Abrir modal expandido" onPress={() => setVisible(true)} />
      <BscModal
        visible={visible}
        presentation="expanded"
        title="Contenido reutilizado"
        onClose={() => setVisible(false)}
        scrollable={false}
      >
        <View style={styles.expandedExample}>
          <Text>Una pantalla o bloque completo puede vivir temporalmente dentro de este modal de 90%.</Text>
        </View>
      </BscModal>
    </>
  );
}

export const Expanded: Story = {
  render: () => <ExpandedModalExample />,
};

function InfoModalExample(): React.JSX.Element {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <BscPrimaryButton label="Abrir modal informativo" onPress={() => setVisible(true)} />
      <BscInfoModal
        visible={visible}
        title="Aun no eres cliente"
        description="Parece que todavía no eres cliente del Banco Santa Cruz. Puedes abrir tu cuenta desde la app en pocos minutos."
        primaryButtonLabel="Hazte cliente"
        secondaryButtonLabel="Volver al inicio"
        onPrimaryPress={() => setVisible(false)}
        onSecondaryPress={() => setVisible(false)}
      />
    </>
  );
}

export const Info: Story = {
  render: () => <InfoModalExample />,
};

const styles = StyleSheet.create({
  expandedExample: {
    flex: 1,
    justifyContent: 'center',
  },
});
