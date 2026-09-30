import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { BscPrimaryButton } from '@bsc/ui-native';
import { ContentModal, type ModalHandle } from '../src';

const meta = {
  title: 'Modals/Compatibility/ContentModal',
  component: ContentModal,
  args: { visible: false, onDismiss: () => {} },
  tags: ['compatibility'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility adapter for terms/disclaimer-style content. Prefer TermsAndConditionsModal or DisclaimerModal for named recipes. Use controlled `visible` when host state owns acceptance; use the imperative `ref` for local preview/demo triggers.' } } },
} satisfies Meta<typeof ContentModal>;

export default meta;
type Story = StoryObj<typeof meta>;

function TermsExample() {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: 16 }}>
      <BscPrimaryButton label="Open terms modal" onPress={() => setVisible(true)} />
      <ContentModal visible={visible} onDismiss={() => setVisible(false)} title="Terms and Conditions" acceptLabel="Accept" onAccept={() => setVisible(false)}>
        <Text style={{ fontSize: 12, lineHeight: 20, textAlign: 'justify' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{'\n\n'}Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </Text>
      </ContentModal>
    </View>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [visible, setVisible] = useState(false);

<>
  <BscPrimaryButton label="Open terms modal" onPress={() => setVisible(true)} />
  <ContentModal
    visible={visible}
    onDismiss={() => setVisible(false)}
    title="Terms and Conditions"
    acceptLabel="Accept"
    onAccept={() => setVisible(false)}
  >
    <Text>Terms content supplied by the host.</Text>
  </ContentModal>
</>`,
      },
    },
  },
  render: () => <TermsExample />,
};
export const ImperativeRef: Story = {
  parameters: {
    docs: {
      source: {
        code: `const modalRef = useRef<ModalHandle>(null);

<>
  <BscPrimaryButton label="Open content with ref" onPress={() => modalRef.current?.open()} />
  <BscPrimaryButton label="Close content with ref" onPress={() => modalRef.current?.close()} />
  <ContentModal
    ref={modalRef}
    title="Content preview"
    acceptLabel="Accept"
    onAccept={() => modalRef.current?.close()}
  >
    <Text>Preview content supplied by the host.</Text>
  </ContentModal>
</>`,
      },
    },
  },
  render: () => {
    const modalRef = useRef<ModalHandle>(null);
    return (
      <View style={{ gap: 16 }}>
        <BscPrimaryButton label="Open content with ref" onPress={() => modalRef.current?.open()} />
        <BscPrimaryButton label="Close content with ref" onPress={() => modalRef.current?.close()} />
        <ContentModal ref={modalRef} title="Content preview" acceptLabel="Accept" onAccept={() => modalRef.current?.close()}>
          <Text>Use ModalHandle when the content modal is opened by a local trigger and parent state does not need to track visibility.</Text>
        </ContentModal>
      </View>
    );
  },
};
export const Disclaimer: Story = {
  args: { visible: true, variant: 'disclaimer', title: 'Before you continue', subtitle: 'Prepare the following demo items.', requirements: [{ label: 'A demo profile', iconName: 'user' }, { label: 'A sample document', iconName: 'file-text' }], onAccept: () => {}, acceptLabel: 'Continue' },
  parameters: {
    docs: {
      source: {
        code: `<ContentModal
  visible={visible}
  onDismiss={handleDismiss}
  variant="disclaimer"
  title="Before you continue"
  subtitle="Prepare the following items."
  requirements={requirements}
  acceptLabel="Continue"
  onAccept={handleContinue}
/>`,
      },
    },
  },
};
