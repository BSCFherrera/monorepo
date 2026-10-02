import TestRenderer from 'react-test-renderer';

import { BscNavigationHeader } from '../components/BscNavigationHeader';

function render(element: React.JSX.Element): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
}

describe('BscNavigationHeader', () => {
  it('renders title with optional navigation actions', () => {
    const onBack = jest.fn();
    const onSupportPress = jest.fn();
    const onClose = jest.fn();
    const tree = render(
      <BscNavigationHeader
        title="Contactos"
        onBack={onBack}
        showSupportButton
        onSupportPress={onSupportPress}
        onClose={onClose}
        testID="contacts-header"
      />,
    );

    expect(tree.root.findByProps({ children: 'Contactos' })).toBeTruthy();

    TestRenderer.act(() => {
      tree.root.findByProps({ testID: 'contacts-header-back' }).props.onPress();
      tree.root.findByProps({ testID: 'contacts-header-support' }).props.onPress();
      tree.root.findByProps({ testID: 'contacts-header-close' }).props.onPress();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onSupportPress).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides optional buttons when their props are omitted', () => {
    const tree = render(<BscNavigationHeader title="Contactos" testID="contacts-header" />);

    expect(tree.root.findAllByProps({ testID: 'contacts-header-back' })).toHaveLength(0);
    expect(tree.root.findAllByProps({ testID: 'contacts-header-support' })).toHaveLength(0);
    expect(tree.root.findAllByProps({ testID: 'contacts-header-close' })).toHaveLength(0);
  });
});
