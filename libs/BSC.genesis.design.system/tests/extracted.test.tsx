import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Animated, Modal, Text } from 'react-native';
import { OtpVerificationField, FeedbackModal, ErrorGeneric, DrawerMenu, HamburgerMenu, TypingIndicator, ActionCard, MessageBubble } from '../src';

test('action card blocks disabled callbacks', () => {
  const change = jest.fn();
  render(<ActionCard title="Unavailable" disabled onPress={change} />);
  fireEvent.press(screen.getByRole('button'));
  expect(change).not.toHaveBeenCalled();
});

test('OTP verification requires a complete code; resend is independent', () => {
  const verify = jest.fn();
  const resend = jest.fn();
  render(<OtpVerificationField codeSent value="12" onChange={() => {}} onVerify={verify} onResend={resend} />);
  expect(screen.queryByRole('button', { name: 'Verify' })).toBeNull();
  fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), '123');
  expect(verify).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Resend code' }));
  expect(resend).toHaveBeenCalledTimes(1);
  fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), '123456');
  expect(verify).toHaveBeenCalledWith('123456');
});

test('OTP aliases keep completion and change behavior', () => {
  const change = jest.fn();
  const complete = jest.fn();
  render(<OtpVerificationField codeSent otp="" onOtpChange={change} onOtpComplete={complete} otpError="Invalid code" otpLabel="Code" resendButtonText="Send again" onResend={() => {}} />);
  expect(screen.getByText('Code')).toBeTruthy();
  expect(screen.getByText('Invalid code')).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), '123456');
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

test('DrawerMenu renders without navigation or application providers', () => {
  const select = jest.fn();
  const dismiss = jest.fn();
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
