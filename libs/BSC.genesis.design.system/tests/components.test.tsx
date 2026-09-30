import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { Card } from '../src';
import { DemoScreen } from '../example/DemoScreen';

test('card renders content, forwards view props, and accepts style overrides', () => {
  const screen = render(<Card testID="card" style={{ padding: 4 }}><Text>Content</Text></Card>);
  expect(screen.getByText('Content')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('card').props.style).padding).toBe(4);
});

test('demo increments, ignores blocked buttons, and resets', () => {
  const screen = render(<DemoScreen />);
  fireEvent.press(screen.getByRole('button', { name: 'Increment' }));
  expect(screen.getByTestId('demo-count').props.children).toEqual(['Count: ', 1]);
  expect(screen.getByRole('button', { name: 'Disabled' }).props.accessibilityState).toMatchObject({ disabled: true });
  expect(screen.getByRole('button', { name: 'Loading' }).props.accessibilityState).toMatchObject({ disabled: true, busy: true });
  fireEvent.press(screen.getByRole('button', { name: 'Reset' }));
  expect(screen.getByTestId('demo-count').props.children).toEqual(['Count: ', 0]);
});
