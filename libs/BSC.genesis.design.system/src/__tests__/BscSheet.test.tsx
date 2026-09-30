import { createRef } from 'react';
import { Modal, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TestRenderer from 'react-test-renderer';

import { BscSheet, type BscSheetHandle } from '../components/BscSheet';

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

describe('BscSheet', () => {
  it('can be opened and closed through its ref without screen-level state', () => {
    const ref = createRef<BscSheetHandle>();
    const onOpenChange = jest.fn();
    const onClose = jest.fn();
    const tree = render(
      <BscSheet
        ref={ref}
        title="Actions"
        defaultVisible={false}
        onOpenChange={onOpenChange}
        onClose={onClose}
      >
        <Text>Sheet content</Text>
      </BscSheet>,
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
});
