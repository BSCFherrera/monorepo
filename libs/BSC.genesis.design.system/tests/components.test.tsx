import { fireEvent, render } from '@testing-library/react-native';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Button, Card, tokens } from '../src';
import { DemoScreen } from '../example/DemoScreen';

test('primary button calls its handler and exposes its label', () => {
  const onPress = jest.fn();
  const screen = render(<Button label="Save" onPress={onPress} />);
  const button = screen.getByRole('button', { name: 'Save' });
  fireEvent.press(button);
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(StyleSheet.flatten(button.props.style).backgroundColor).toBe(tokens.colors.primary);
});

test('secondary button retains the source green fill', () => {
  const screen = render(<Button label="Reset" accessibilityLabel="Reset counter" variant="secondary" onPress={jest.fn()} />);
  const button = screen.getByRole('button', { name: 'Reset counter' });
  const style = StyleSheet.flatten(button.props.style);
  expect(style.backgroundColor).toBe('#00A651');
  expect(style.borderWidth).toBeUndefined();
});

test('outline is a separate variant and loading replaces visible contents', () => {
  const view = render(<Button label="Save" variant="outline" onPress={() => {}} />);
  expect(StyleSheet.flatten(view.getByRole('button').props.style)).toMatchObject({ backgroundColor: 'transparent', borderWidth: 2, borderColor: tokens.colors.primary });
  view.rerender(<Button label="Save" loading onPress={() => {}} />);
  expect(view.queryByText('Save')).toBeNull();
  expect(view.getByRole('button', { name: 'Save' })).toBeTruthy();
});

test.each([
  { disabled: true, loading: false },
  { disabled: false, loading: true },
  { disabled: true, loading: true },
])('blocks presses for state %j', state => {
  const onPress = jest.fn();
  const screen = render(<Button label="Save" onPress={onPress} {...state} />);
  const button = screen.getByRole('button', { name: 'Save' });
  fireEvent.press(button);
  expect(onPress).not.toHaveBeenCalled();
  expect(button.props.accessibilityState).toEqual({ disabled: true, busy: state.loading });
  expect(screen.UNSAFE_queryByType(ActivityIndicator) !== null).toBe(state.loading);
});

test('card renders content, forwards view props, and accepts style overrides', () => {
  const screen = render(<Card testID="card" style={{ padding: 4 }}><Text>Content</Text></Card>);
  expect(screen.getByText('Content')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('card').props.style).padding).toBe(4);
});

test('demo increments, ignores blocked buttons, and resets', () => {
  const screen = render(<DemoScreen />);
  fireEvent.press(screen.getByRole('button', { name: 'Increment' }));
  expect(screen.getByText('Count: 1')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Disabled' }));
  fireEvent.press(screen.getByRole('button', { name: 'Loading' }));
  expect(screen.getByText('Count: 1')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Reset' }));
  expect(screen.getByText('Count: 0')).toBeTruthy();
});
