import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { BscPrimaryButton } from '@bsc/ui-native';
import { BottomSheetModal, type ModalHandle } from '../src';

const meta = {
  title: 'Modals/Surfaces/BottomSheetModal',
  component: BottomSheetModal,
  args: { visible: false, onDismiss: () => {} },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Use controlled `visible` when the sheet is part of app state or navigation. Use the imperative `ref` for local actions where callers only need to open or close the sheet.' } },
  },
} satisfies Meta<typeof BottomSheetModal>;

export default meta;
type Story = StoryObj<typeof meta>;

function SheetExample() {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: 16 }}>
      <BscPrimaryButton label="Open bottom sheet" onPress={() => setVisible(true)} />
      <BottomSheetModal visible={visible} onDismiss={() => setVisible(false)} title="Bottom Sheet">
        <Text>A bottom-aligned modal without drag gestures.</Text>
      </BottomSheetModal>
    </View>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [visible, setVisible] = useState(false);

<>
  <BscPrimaryButton label="Open bottom sheet" onPress={() => setVisible(true)} />
  <BottomSheetModal
    visible={visible}
    onDismiss={() => setVisible(false)}
    title="Bottom Sheet"
  >
    <Text>A bottom-aligned modal without drag gestures.</Text>
  </BottomSheetModal>
</>`,
      },
    },
  },
  render: () => <SheetExample />,
};
export const ImperativeRef: Story = {
  parameters: {
    docs: {
      source: {
        code: `const modalRef = useRef<ModalHandle>(null);

<>
  <BscPrimaryButton label="Open with ref" onPress={() => modalRef.current?.open()} />
  <BscPrimaryButton label="Close with ref" onPress={() => modalRef.current?.close()} />
  <BottomSheetModal
    ref={modalRef}
    title="Imperative Sheet"
    onDismiss={() => modalRef.current?.close()}
  >
    <Text>Sheet content supplied by the host.</Text>
  </BottomSheetModal>
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
        <BottomSheetModal ref={modalRef} title="Imperative Sheet" onDismiss={() => modalRef.current?.close()}>
          <Text>The host uses ModalHandle for a local bottom-sheet trigger without keeping `visible` in state.</Text>
        </BottomSheetModal>
      </View>
    );
  },
};
