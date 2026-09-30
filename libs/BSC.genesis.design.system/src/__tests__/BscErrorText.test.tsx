import { Text } from 'react-native';
import TestRenderer from 'react-test-renderer';

import { BscErrorText } from '../components/BscErrorText';

function render(element: React.JSX.Element): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
}

describe('BscErrorText', () => {
  it('announces the message as an alert paired with an icon, never color alone', () => {
    const tree = render(
      <BscErrorText testID="amount-error">Amount is required</BscErrorText>,
    );
    const alert = tree.root.findByProps({ accessibilityRole: 'alert' });

    expect(alert.props.testID).toBe('amount-error');
    expect(
      tree.root.findByProps({ children: 'Amount is required' }),
    ).toBeTruthy();
    expect(tree.root.findAllByProps({ name: 'error' }).length).toBeGreaterThan(
      0,
    );
  });

  it('prefers the text prop over children', () => {
    const tree = render(
      <BscErrorText text="From prop">From children</BscErrorText>,
    );

    expect(
      tree.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(['From prop']);
  });

  it.each([undefined, null, ''])(
    'renders nothing when there is no message (%p)',
    message => {
      const tree = render(<BscErrorText text={message} />);

      expect(tree.toJSON()).toBeNull();
    },
  );
});
