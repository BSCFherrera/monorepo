import { createRef } from 'react';
import { Modal, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TestRenderer from 'react-test-renderer';

import { BscInfoModal } from '../components/BscInfoModal';
import { BscModal, type BscModalHandle } from '../components/BscModal';

function render(element: React.JSX.Element): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
        }}
      >
        {element}
      </SafeAreaProvider>,
    );
  });
  return tree;
}

describe('BscModal', () => {
  it('can be opened and closed through its ref', () => {
    const ref = createRef<BscModalHandle>();
    const onOpenChange = jest.fn();
    const onClose = jest.fn();
    const tree = render(
      <BscModal
        ref={ref}
        title="Access"
        defaultVisible={false}
        onOpenChange={onOpenChange}
        onClose={onClose}
      >
        <Text>Modal content</Text>
      </BscModal>,
    );

    expect(tree.root.findByType(Modal).props.visible).toBe(false);

    TestRenderer.act(() => {
      ref.current?.open();
    });

    expect(ref.current?.isOpen()).toBe(true);
    expect(tree.root.findByType(Modal).props.visible).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    TestRenderer.act(() => {
      ref.current?.close();
    });

    expect(ref.current?.isOpen()).toBe(false);
    expect(tree.root.findByType(Modal).props.visible).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('accepts an expanded ReactNode content slot without replacing the whole screen', () => {
    const tree = render(
      <BscModal visible presentation="expanded" testID="expanded-modal" content={<Text>Screen content</Text>} />,
    );

    expect(tree.root.findByType(Modal).props.transparent).toBe(true);
    const expandedSurface = tree.root.findAllByProps({ testID: 'expanded-modal' }).find(node => node.props.style !== undefined);
    expect(JSON.stringify(expandedSurface?.props.style)).toContain('"height":"90%"');
    expect(tree.root.findByProps({ children: 'Screen content' })).toBeTruthy();
  });

  it('separates back navigation from closing the modal', () => {
    const onBack = jest.fn();
    const onClose = jest.fn();
    const tree = render(
      <BscModal
        visible
        title="Step 2"
        onBack={onBack}
        onClose={onClose}
        testID="flow-modal"
      >
        <Text>Step content</Text>
      </BscModal>,
    );

    TestRenderer.act(() => {
      tree.root.findByProps({ testID: 'flow-modal-back' }).props.onPress();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(tree.root.findByType(Modal).props.visible).toBe(true);
  });

  it('does not render a back action when onBack is omitted', () => {
    const tree = render(
      <BscModal visible title="Step 1" testID="flow-modal">
        <Text>Step content</Text>
      </BscModal>,
    );

    expect(tree.root.findAllByProps({ testID: 'flow-modal-back' })).toHaveLength(0);
    expect(tree.root.findByProps({ testID: 'flow-modal-close' })).toBeTruthy();
  });
});

describe('BscInfoModal', () => {
  it('renders copy and optional secondary action on top of BscModal', () => {
    const onPrimaryPress = jest.fn();
    const onSecondaryPress = jest.fn();
    const tree = render(
      <BscInfoModal
        visible
        title="Aun no eres cliente"
        description="Parece que todavía no eres cliente del Banco Santa Cruz."
        primaryButtonLabel="Hazte cliente"
        onPrimaryPress={onPrimaryPress}
        secondaryButtonLabel="Volver al inicio"
        onSecondaryPress={onSecondaryPress}
        testID="customer-info-modal"
      />,
    );

    expect(tree.root.findByProps({ children: 'Aun no eres cliente' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Parece que todavía no eres cliente del Banco Santa Cruz.' })).toBeTruthy();

    TestRenderer.act(() => {
      tree.root.findByProps({ testID: 'customer-info-modal-primary' }).props.onPress();
      tree.root.findByProps({ testID: 'customer-info-modal-secondary' }).props.onPress();
    });

    expect(onPrimaryPress).toHaveBeenCalledTimes(1);
    expect(onSecondaryPress).toHaveBeenCalledTimes(1);
  });

  it('uses the modal header title when a back action is present', () => {
    const onBack = jest.fn();
    const tree = render(
      <BscInfoModal
        visible
        title="Recovery options"
        description="Choose how you want to continue."
        primaryButtonLabel="Continue"
        onPrimaryPress={jest.fn()}
        onBack={onBack}
        testID="info-flow-modal"
      />,
    );

    expect(tree.root.findByProps({ testID: 'info-flow-modal-back' })).toBeTruthy();
    expect(tree.root.findAllByType(Text).filter(node => node.props.children === 'Recovery options')).toHaveLength(1);

    TestRenderer.act(() => {
      tree.root.findByProps({ testID: 'info-flow-modal-back' }).props.onPress();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
