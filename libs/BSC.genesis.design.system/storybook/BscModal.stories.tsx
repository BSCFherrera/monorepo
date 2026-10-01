import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BscInfoModal } from '../src/components/BscInfoModal';
import { BscModal, type BscModalHandle } from '../src/components/BscModal';
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
  parameters: {
    docs: {
      source: {
        code: `function Example(): React.JSX.Element {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <BscPrimaryButton label="Abrir modal" onPress={() => setVisible(true)} />
      <BscModal
        visible={visible}
        title="Iniciar sesión"
        onClose={() => setVisible(false)}
      >
        <Text>Este modal base acepta cualquier ReactNode como contenido.</Text>
      </BscModal>
    </>
  );
}`,
      },
    },
  },
};

function BackActionModalExample(): React.JSX.Element {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);

  const open = () => {
    setStep(1);
    setVisible(true);
  };

  return (
    <>
      <BscPrimaryButton label="Abrir flujo" onPress={open} />
      <BscModal
        visible={visible}
        title={`Paso ${step}`}
        onBack={step > 1 ? () => setStep(step - 1) : undefined}
        onClose={() => setVisible(false)}
        footer={
          <BscPrimaryButton
            label={step === 1 ? 'Ir al paso 2' : 'Cerrar'}
            onPress={step === 1 ? () => setStep(2) : () => setVisible(false)}
          />
        }
      >
        <Text>{step === 1 ? 'Primer paso del flujo.' : 'Segundo paso con acción de volver.'}</Text>
      </BscModal>
    </>
  );
}

export const BackAction: Story = {
  render: () => <BackActionModalExample />,
  parameters: {
    docs: {
      source: {
        code: `function Example(): React.JSX.Element {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);

  const open = () => {
    setStep(1);
    setVisible(true);
  };

  return (
    <>
      <BscPrimaryButton label="Abrir flujo" onPress={open} />
      <BscModal
        visible={visible}
        title={\`Paso \${step}\`}
        onBack={step > 1 ? () => setStep(step - 1) : undefined}
        onClose={() => setVisible(false)}
        footer={
          <BscPrimaryButton
            label={step === 1 ? 'Ir al paso 2' : 'Cerrar'}
            onPress={step === 1 ? () => setStep(2) : () => setVisible(false)}
          />
        }
      >
        <Text>{step === 1 ? 'Primer paso del flujo.' : 'Segundo paso con acción de volver.'}</Text>
      </BscModal>
    </>
  );
}`,
      },
    },
  },
};

function ImperativeRefModalExample(): React.JSX.Element {
  const modalRef = useRef<BscModalHandle>(null);

  return (
    <>
      <BscPrimaryButton label="Abrir con ref" onPress={() => modalRef.current?.open()} />
      <BscModal
        ref={modalRef}
        title="Uso imperativo"
        footer={
          <BscPrimaryButton label="Cerrar" onPress={() => modalRef.current?.close()} />
        }
      >
        <Text>Usa el ref cuando la pantalla no quiera guardar estado visible.</Text>
      </BscModal>
    </>
  );
}

export const ImperativeRef: Story = {
  render: () => <ImperativeRefModalExample />,
  parameters: {
    docs: {
      source: {
        code: `function Example(): React.JSX.Element {
  const modalRef = useRef<BscModalHandle>(null);

  return (
    <>
      <BscPrimaryButton label="Abrir con ref" onPress={() => modalRef.current?.open()} />
      <BscModal
        ref={modalRef}
        title="Uso imperativo"
        footer={
          <BscPrimaryButton label="Cerrar" onPress={() => modalRef.current?.close()} />
        }
      >
        <Text>Usa el ref cuando la pantalla no quiera guardar estado visible.</Text>
      </BscModal>
    </>
  );
}`,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `function Example(): React.JSX.Element {
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
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text>Una pantalla o bloque completo puede vivir temporalmente dentro de este modal de 90%.</Text>
        </View>
      </BscModal>
    </>
  );
}`,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `function Example(): React.JSX.Element {
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
}`,
      },
    },
  },
};

const styles = StyleSheet.create({
  expandedExample: {
    flex: 1,
    justifyContent: 'center',
  },
});
