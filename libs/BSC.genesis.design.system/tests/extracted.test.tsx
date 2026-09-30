import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Animated, Modal, StyleSheet, Text, View, type MeasureInWindowOnSuccessCallback } from 'react-native';
import { Input, TextField, ErrorText, Checkbox } from '../src/components/forms';
import { Select } from '../src/components/selection';
import { OtpInput } from '../src/components/otp';
import { OtpVerificationField, FeedbackModal, ErrorGeneric, Header, DrawerMenu, HamburgerMenu, TypingIndicator, ActionCard, MessageBubble } from '../src';

test('Input composes focus callbacks and enforces read-only and disabled behavior', () => {
  const change = jest.fn();
  const focus = jest.fn();
  const blur = jest.fn();
  const copy = jest.fn();
  const view = render(<Input label="Name" onChangeText={change} onFocus={focus} onBlur={blur} onCopyRequest={copy} />);
  const input = screen.getByLabelText('Name');
  expect(input.props.editable).toBe(true);
  fireEvent(input, 'focus', {});
  fireEvent(input, 'blur', {});
  expect(focus).toHaveBeenCalledTimes(1);
  expect(blur).toHaveBeenCalledTimes(1);
  view.rerender(<Input label="Name" readOnly editable onChangeText={change} onCopyRequest={copy} />);
  expect(screen.getByLabelText('Name').props.editable).toBe(false);
  fireEvent.changeText(screen.getByLabelText('Name'), 'Unexpected');
  expect(change).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Copy' }));
  expect(copy).toHaveBeenCalledTimes(1);
  view.rerender(<Input label="Name" disabled editable onChangeText={change} onCopyRequest={copy} />);
  fireEvent.changeText(screen.getByLabelText('Name'), 'Unexpected');
  fireEvent.press(screen.getByRole('button', { name: 'Copy' }));
  expect(change).not.toHaveBeenCalled();
  expect(copy).toHaveBeenCalledTimes(1);
});

test('checkbox and action card block disabled callbacks', () => {
  const change = jest.fn();
  const view = render(<Checkbox label="Updates" checked={false} onChange={change} />);
  fireEvent.press(screen.getByRole('checkbox'));
  expect(change).toHaveBeenCalledWith(true);
  view.rerender(<Checkbox label="Updates" checked disabled onChange={change} />);
  fireEvent.press(screen.getByRole('checkbox'));
  expect(change).toHaveBeenCalledTimes(1);
  view.unmount();
  render(<ActionCard title="Unavailable" disabled onPress={change} />);
  fireEvent.press(screen.getByRole('button'));
  expect(change).toHaveBeenCalledTimes(1);
});

test('Select renders an anchored dropdown trigger', () => {
  const measure = jest.spyOn(View.prototype, 'measureInWindow').mockImplementation(callback => (callback as MeasureInWindowOnSuccessCallback)(20, 100, 280, 48));
  const change = jest.fn();
  render(<Select label="Frequency" value={0} onChange={change} options={[{ label: 'Never', value: 0 }, { label: 'Weekly', value: 1 }]} />);
  expect(screen.getByText('Never')).toBeTruthy();
  const trigger = screen.getByRole('button', { name: 'Frequency' });
  fireEvent.press(trigger);
  // After opening, options should be available in the Modal
  expect(screen.getByRole('radio', { name: 'Never' })).toBeTruthy();
  fireEvent.press(screen.getByRole('radio', { name: 'Weekly' }));
  expect(change).toHaveBeenCalledWith(1);
  measure.mockRestore();
});

test('TextField accepts legacy icon, right element, and copy aliases', () => {
  const iconPress = jest.fn();
  const copy = jest.fn();
  render(<TextField value="ABC" iconName="search" iconPosition="right" onIconPress={iconPress} rightElement={<Text>Suffix</Text>} copyable onCopy={copy} />);
  expect(screen.getByText('Suffix')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Copy' }));
  expect(copy).toHaveBeenCalledWith('ABC');
  expect(iconPress).not.toHaveBeenCalled();
});

test('ErrorText accepts legacy text, color, iconName, and containerStyle aliases', () => {
  render(<ErrorText text="Required field" color="#123456" iconName="alert-circle" containerStyle={{ marginTop: 12 }} />);
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.getByText('Required field')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByText('Required field').props.style).color).toBe('#123456');
});

test('Select accepts legacy data and onSelect aliases', () => {
  const measure = jest.spyOn(View.prototype, 'measureInWindow').mockImplementation(callback => (callback as MeasureInWindowOnSuccessCallback)(20, 100, 280, 48));
  const select = jest.fn();
  render(<Select label="Legacy" value="Two" data={["One", "Two"]} onSelect={select} />);
  expect(screen.getByText('Two')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Legacy' }));
  fireEvent.press(screen.getByRole('radio', { name: 'One' }));
  expect(select).toHaveBeenCalledWith('One');
  measure.mockRestore();
});

test('OTP separate cells render and accept input', () => {
  const change = jest.fn();
  const complete = jest.fn();
  const view = render(<OtpInput value="" onChange={change} onComplete={complete} />);
  const input = screen.getByLabelText('Verification code');
  expect(input.props.editable).toBe(true);
  fireEvent(input, 'focus');
  const focusedCells = view.UNSAFE_getAllByType(View).filter(node => StyleSheet.flatten(node.props.style)?.borderWidth === 2);
  expect(focusedCells).toHaveLength(1);
  fireEvent.changeText(input, '12 a34-567');
  expect(change).toHaveBeenLastCalledWith('123456');
  expect(complete).toHaveBeenCalledWith('123456');
  view.rerender(<OtpInput value="123456" onChange={change} onComplete={complete} />);
  fireEvent.changeText(screen.getByLabelText('Verification code'), '12456');
  expect(change).toHaveBeenLastCalledWith('12456');
  expect(complete).toHaveBeenCalledTimes(1);
  view.unmount();
});

test('Select disabled options do not select', () => {
  const measure = jest.spyOn(View.prototype, 'measureInWindow').mockImplementation(callback => (callback as MeasureInWindowOnSuccessCallback)(20, 100, 280, 48));
  const change = jest.fn();
  const options = [{ label: 'Unavailable', value: 0, disabled: true }];
  const view = render(<Select label="Choice" options={options} onChange={change} />);
  fireEvent.press(screen.getByRole('button', { name: 'Choice' }));
  fireEvent.press(screen.getByRole('radio', { name: 'Unavailable' }));
  expect(change).not.toHaveBeenCalled();
  view.unmount();
  measure.mockRestore();
});

test('OTP verification requires a complete code; resend is independent', () => {
  const verify = jest.fn();
  const resend = jest.fn();
  render(<OtpVerificationField codeSent value="12" onChange={() => {}} onVerify={verify} onResend={resend} />);
  expect(screen.queryByRole('button', { name: 'Verify' })).toBeNull();
  fireEvent.changeText(screen.getByLabelText('Verification code'), '123');
  expect(verify).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Resend code' }));
  expect(resend).toHaveBeenCalledTimes(1);
  fireEvent.changeText(screen.getByLabelText('Verification code'), '123456');
  expect(verify).toHaveBeenCalledWith('123456');
});

test('OTP aliases keep completion and change behavior', () => {
  const change = jest.fn();
  const complete = jest.fn();
  render(<OtpVerificationField codeSent otp="" onOtpChange={change} onOtpComplete={complete} otpError="Invalid code" otpLabel="Code" resendButtonText="Send again" onResend={() => {}} />);
  expect(screen.getByText('Code')).toBeTruthy();
  expect(screen.getByText('Invalid code')).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('Verification code'), '123456');
  expect(change).toHaveBeenCalledWith('123456');
  expect(complete).toHaveBeenCalledWith('123456');
  expect(screen.getByRole('button', { name: 'Send again' })).toBeTruthy();
});

test('MessageBubble maps a legacy message object', () => {
  render(<MessageBubble message={{ sender: 'assistant', content: 'Hello **there**', timestamp: new Date('2024-01-01T12:34:00Z') }} />);
  expect(screen.getByText('Hello ')).toBeTruthy();
  expect(screen.getByText('there')).toBeTruthy();
});

test('ErrorGeneric accepts description, iconName, and closeButtonLabel aliases', () => {
  const close = jest.fn();
  render(<ErrorGeneric visible title="Error" description="Try again" iconName="alert-circle" closeButtonLabel="Close now" onClose={close} />);
  expect(screen.getByText('Try again')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Close now' }));
  expect(close).toHaveBeenCalledTimes(1);
});

test('FeedbackModal confirmation does not auto-dismiss and canDismiss blocks backdrop', () => {
  const dismiss = jest.fn();
  const confirm = jest.fn();
  const view = render(<FeedbackModal visible title="Review" canDismiss={false} onDismiss={dismiss} onConfirm={confirm}><Text>Body</Text></FeedbackModal>);
  // Body press is not backdrop press
  fireEvent.press(screen.getByText('Body'), { stopPropagation: jest.fn() });
  expect(dismiss).not.toHaveBeenCalled();
  // Confirm still works
  fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(dismiss).not.toHaveBeenCalled();
  // With canDismiss=true, requestClose should call dismiss
  view.rerender(<FeedbackModal visible title="Review" onDismiss={dismiss} onConfirm={confirm} />);
  fireEvent(view.UNSAFE_getByType(Modal), 'requestClose');
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(confirm).toHaveBeenCalledTimes(1);
});

test('headers work without navigation or application providers', () => {
  const back = jest.fn();
  const select = jest.fn();
  const dismiss = jest.fn();
  const view = render(<Header title="Details" onBack={back} />);
  fireEvent.press(screen.getByRole('button', { name: 'Back' }));
  expect(back).toHaveBeenCalledTimes(1);
  view.unmount();
  render(<DrawerMenu visible title="Menu" onDismiss={dismiss} items={[{ id: 'one', label: 'Overview', onPress: select }]} />);
  fireEvent.press(screen.getByRole('button', { name: 'Overview' }));
  expect(select).toHaveBeenCalledTimes(1);
  expect(dismiss).not.toHaveBeenCalled();
});

test('HamburgerMenu supports the legacy route-based navigation contract', () => {
  const close = jest.fn();
  const navigate = jest.fn();
  const openHistory = jest.fn();
  const logout = jest.fn();

  render(
    <HamburgerMenu
      visible
      onClose={close}
      currentRoute="Transactions"
      onNavigate={navigate}
      onOpenHistory={openHistory}
      onLogout={logout}
    />,
  );

  fireEvent.press(screen.getByRole('button', { name: 'Productos' }));
  expect(navigate).toHaveBeenCalledWith('Products');
  expect(close).toHaveBeenCalledTimes(1);

  fireEvent.press(screen.getByText('+ Nueva conversacion'));
  expect(navigate).toHaveBeenCalledWith('Chat');
  expect(close).toHaveBeenCalledTimes(2);

  fireEvent.press(screen.getByText('Transferencia a contacto'));
  expect(openHistory).toHaveBeenCalledWith({
    id: 'h1',
    title: 'Transferencia a contacto',
    preview: 'Consulta de limite y validacion',
  });
  expect(close).toHaveBeenCalledTimes(3);

  expect(screen.getByText('NAVEGACION')).toBeTruthy();
  expect(screen.getByText('CONVERSACIONES')).toBeTruthy();

  fireEvent.press(screen.getByText('Cerrar sesion'));
  expect(logout).toHaveBeenCalledTimes(1);
  expect(close).toHaveBeenCalledTimes(4);
});

test('legacy HamburgerMenu logout falls back to Profile navigation', () => {
  const close = jest.fn();
  const navigate = jest.fn();

  render(<HamburgerMenu visible onClose={close} onNavigate={navigate} onOpenHistory={jest.fn()} />);

  fireEvent.press(screen.getByText('Cerrar sesion'));
  expect(navigate).toHaveBeenCalledWith('Profile');
  expect(close).toHaveBeenCalledTimes(1);
});

test('typing keeps the sphere static when disabled and stops all loops on unmount', async () => {
  const start = jest.fn();
  const stop = jest.fn();
  const loop = jest.spyOn(Animated, 'loop').mockReturnValue({ start, stop, reset: jest.fn() });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  const view = render(<TypingIndicator animated={false} />);
  await act(async () => {});
  expect(loop).not.toHaveBeenCalled();
  view.rerender(<TypingIndicator animated />);
  await waitFor(() => expect(start).toHaveBeenCalledTimes(3));
  view.unmount();
  expect(stop).toHaveBeenCalledTimes(3);
  loop.mockRestore();
  jest.restoreAllMocks();
});
