import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { BscPrimaryButton } from '@bsc/ui-native';
import { CenteredModal, type ModalHandle } from '../src';

const meta = {
  title: 'Modals/Surfaces/CenteredModal',
  component: CenteredModal,
  args: { visible: false, onDismiss: () => {} },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Use controlled `visible` when application state owns the modal lifecycle, for example navigation, persisted flows, or analytics. Use the imperative `ref` for local UI triggers such as “open details”, demos, and escape hatches where the parent does not need to store visibility.' } },
  },
} satisfies Meta<typeof CenteredModal>;

export default meta;
type Story = StoryObj<typeof meta>;

function CenteredExample() {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: 16 }}>
      <BscPrimaryButton label="Open centered modal" onPress={() => setVisible(true)} />
      <CenteredModal visible={visible} onDismiss={() => setVisible(false)} title="Example Dialog">
        <Text>Centered content supplied by the host.</Text>
      </CenteredModal>
    </View>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [visible, setVisible] = useState(false);

<>
  <BscPrimaryButton label="Open centered modal" onPress={() => setVisible(true)} />
  <CenteredModal
    visible={visible}
    onDismiss={() => setVisible(false)}
    title="Example Dialog"
  >
    <Text>Centered content supplied by the host.</Text>
  </CenteredModal>
</>`,
      },
    },
  },
  render: () => <CenteredExample />,
};
export const ImperativeRef: Story = {
  parameters: {
    docs: {
      source: {
        code: `const modalRef = useRef<ModalHandle>(null);

<>
  <BscPrimaryButton label="Open with ref" onPress={() => modalRef.current?.open()} />
  <BscPrimaryButton label="Close with ref" onPress={() => modalRef.current?.close()} />
  <CenteredModal
    ref={modalRef}
    title="Imperative Dialog"
    onDismiss={() => modalRef.current?.close()}
  >
    <Text>Modal content supplied by the host.</Text>
  </CenteredModal>
</>`,
      },
    },
  },
  render: () => {
    const modalRef = useRef<ModalHandle>(null);
    return (
      <View style={{ gap: 16 }}>
        <BscPrimaryButton label="Open with ref" onPress={() => modalRef.current?.open()} />
        <BscPrimaryButton label="Close with ref" onPress={() => modalRef.current?.close()} />
        <CenteredModal ref={modalRef} title="Imperative Dialog" onDismiss={() => modalRef.current?.close()}>
          <Text>The host uses ModalHandle.open() and ModalHandle.close() instead of storing `visible` state.</Text>
        </CenteredModal>
      </View>
    );
  },
};
export const NonDismissable: Story = {
  parameters: {
    docs: {
      source: {
        code: `<CenteredModal
  visible={visible}
  onDismiss={handleClose}
  canDismiss={false}
  title="Confirm action"
>
  <Text>This modal cannot be dismissed by tapping outside.</Text>
  <BscPrimaryButton label="Close" onPress={handleClose} />
</CenteredModal>`,
      },
    },
  },
  render: () => {
    const [visible, setVisible] = useState(false);
    return (
      <View style={{ gap: 16 }}>
        <BscPrimaryButton label="Open non-dismissable" onPress={() => setVisible(true)} />
        <CenteredModal visible={visible} onDismiss={() => setVisible(false)} canDismiss={false} title="Confirm action">
          <Text>This modal cannot be dismissed by tapping outside.</Text>
          <BscPrimaryButton label="Close" onPress={() => setVisible(false)} />
        </CenteredModal>
      </View>
    );
  },
};
