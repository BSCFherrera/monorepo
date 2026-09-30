import TestRenderer from 'react-test-renderer';

import { BscToggleSwitch } from '../components/BscToggleSwitch';

function render(element: React.JSX.Element): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
}

describe('BscToggleSwitch', () => {
  it('exposes switch semantics and requests the opposite value on press', () => {
    const onValueChange = jest.fn();
    const tree = render(
      <BscToggleSwitch
        label="Notifications"
        value={false}
        onValueChange={onValueChange}
        testID="notifications"
      />,
    );
    const toggle = tree.root.findByProps({ accessibilityRole: 'switch' });

    expect(toggle.props.testID).toBe('notifications');
    expect(toggle.props.accessibilityState).toEqual({
      checked: false,
      disabled: false,
    });
    expect(tree.root.findByProps({ children: 'Notifications' })).toBeTruthy();

    TestRenderer.act(() => {
      toggle.props.onPress();
    });

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('turns off when pressed while on', () => {
    const onValueChange = jest.fn();
    const tree = render(
      <BscToggleSwitch
        value
        onValueChange={onValueChange}
        testID="notifications"
      />,
    );
    const toggle = tree.root.findByProps({ accessibilityRole: 'switch' });

    expect(toggle.props.accessibilityState).toEqual({
      checked: true,
      disabled: false,
    });

    TestRenderer.act(() => {
      toggle.props.onPress();
    });

    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it('ignores presses while disabled', () => {
    const tree = render(
      <BscToggleSwitch
        value={false}
        disabled
        onValueChange={jest.fn()}
        testID="notifications"
      />,
    );
    const toggle = tree.root.findByProps({ accessibilityRole: 'switch' });

    expect(toggle.props.accessibilityState).toEqual({
      checked: false,
      disabled: true,
    });
    expect(toggle.props.onPress).toBeUndefined();
  });
});
