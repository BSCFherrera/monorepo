import { Text } from 'react-native';
import TestRenderer from 'react-test-renderer';

import { BscCheckbox } from '../components/BscCheckbox';

function render(element: React.JSX.Element): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
}

describe('BscCheckbox', () => {
  it('exposes checkbox semantics and toggles to the opposite value on press', () => {
    const onChange = jest.fn();
    const tree = render(
      <BscCheckbox
        label="Accept terms"
        checked={false}
        onChange={onChange}
        testID="terms"
      />,
    );
    const checkbox = tree.root.findByProps({ accessibilityRole: 'checkbox' });

    expect(checkbox.props.testID).toBe('terms');
    expect(checkbox.props.accessibilityState).toEqual({
      checked: false,
      disabled: false,
    });
    expect(tree.root.findByProps({ children: 'Accept terms' })).toBeTruthy();

    TestRenderer.act(() => {
      checkbox.props.onPress();
    });

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reports checked state and unchecks on press', () => {
    const onChange = jest.fn();
    const tree = render(
      <BscCheckbox checked onChange={onChange} testID="terms" />,
    );
    const checkbox = tree.root.findByProps({ accessibilityRole: 'checkbox' });

    expect(checkbox.props.accessibilityState).toEqual({
      checked: true,
      disabled: false,
    });

    TestRenderer.act(() => {
      checkbox.props.onPress();
    });

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('ignores presses while disabled', () => {
    const tree = render(
      <BscCheckbox
        label="Accept terms"
        checked={false}
        disabled
        onChange={jest.fn()}
        testID="terms"
      />,
    );
    const checkbox = tree.root.findByProps({ accessibilityRole: 'checkbox' });

    expect(checkbox.props.accessibilityState).toEqual({
      checked: false,
      disabled: true,
    });
    expect(checkbox.props.onPress).toBeUndefined();
  });

  it('renders custom children in place of the label', () => {
    const tree = render(
      <BscCheckbox label="Hidden label" checked={false} onChange={jest.fn()}>
        <Text>Custom content</Text>
      </BscCheckbox>,
    );

    expect(tree.root.findByProps({ children: 'Custom content' })).toBeTruthy();
    expect(tree.root.findAllByProps({ children: 'Hidden label' })).toHaveLength(
      0,
    );
  });
});
