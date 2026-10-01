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
  const [visible, setVisible] = useState(true);

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

function FullScreenModalExample(): React.JSX.Element {
  const [visible, setVisible] = useState(true);

  return (
    <>
      <BscPrimaryButton label="Abrir pantalla modal" onPress={() => setVisible(true)} />
      <BscModal
        visible={visible}
        presentation="fullScreen"
        title="Pantalla reutilizada"
        onClose={() => setVisible(false)}
        scrollable={false}
      >
        <View style={styles.fullScreenExample}>
          <Text>Una pantalla completa puede vivir temporalmente dentro del modal.</Text>
        </View>
      </BscModal>
    </>
  );
}

export const FullScreen: Story = {
  render: () => <FullScreenModalExample />,
};

export const Info: Story = {
  render: () => (
    <BscInfoModal
      visible
      title="Aun no eres cliente"
      description="Parece que todavía no eres cliente del Banco Santa Cruz. Puedes abrir tu cuenta desde la app en pocos minutos."
      primaryButtonLabel="Hazte cliente"
      secondaryButtonLabel="Volver al inicio"
      onPrimaryPress={() => undefined}
      onSecondaryPress={() => undefined}
    />
  ),
};

const styles = StyleSheet.create({
  fullScreenExample: {
    flex: 1,
    justifyContent: 'center',
  },
});
