import { Modal, Pressable, Text } from 'react-native';
import TestRenderer from 'react-test-renderer';

import {
  BscLoaderProvider,
  BscLoadingOverlay,
  useBscLoader,
} from '../components/BscLoadingOverlay';

function render(element: React.JSX.Element): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
}

function LoaderConsumer(): React.JSX.Element {
  const { hideLoader, showLoader, visible, withLoader } = useBscLoader();

  return (
    <>
      <Text>{visible ? 'visible' : 'hidden'}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Show" onPress={() => showLoader('Saving')} />
      <Pressable accessibilityRole="button" accessibilityLabel="Hide" onPress={hideLoader} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="With loader"
        onPress={() => {
          withLoader(async () => 'done', 'Processing').catch(() => undefined);
        }}
      />
    </>
  );
}

describe('BscLoadingOverlay', () => {
  it('renders nothing while hidden and exposes progress semantics while visible', () => {
    const hidden = render(<BscLoadingOverlay visible={false} />);
    expect(hidden.toJSON()).toBeNull();

    const visible = render(<BscLoadingOverlay visible label="Loading accounts" />);

    expect(visible.root.findByType(Modal).props.transparent).toBe(true);
    expect(visible.root.findByProps({ accessibilityRole: 'progressbar' }).props.accessibilityState).toEqual({ busy: true });
    expect(visible.root.findByProps({ children: 'Loading accounts' })).toBeTruthy();
  });

  it('lets screens control the single root overlay through the provider hook', () => {
    const tree = render(
      <BscLoaderProvider>
        <LoaderConsumer />
      </BscLoaderProvider>,
    );

    expect(tree.root.findByProps({ children: 'hidden' })).toBeTruthy();

    TestRenderer.act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Show' }).props.onPress();
    });

    expect(tree.root.findByProps({ children: 'visible' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Saving' })).toBeTruthy();

    TestRenderer.act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Hide' }).props.onPress();
    });

    expect(tree.root.findByProps({ children: 'hidden' })).toBeTruthy();
  });
});
