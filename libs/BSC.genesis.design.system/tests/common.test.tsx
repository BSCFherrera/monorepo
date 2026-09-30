import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View, type MeasureInWindowOnSuccessCallback, type StyleProp, type ViewStyle } from 'react-native';
import * as bsc from '@bsc/ui-native';
import * as components from '../src';
import { ButtonOutlinedFlat, ButtonPill } from '../src/components/commonButtons';
import { Select } from '../src/components/selection/Select';
import { SelectPill } from '../src/components/selection/SelectPill';
import type { ModalHandle } from '../src';
import { storyEntries } from '../storybook/catalog';
jest.mock('@storybook/addon-actions', () => ({ action: jest.fn(() => jest.fn()) }));

const catalogMappings = [
  ['Actions/BscButton', bsc.BscPrimaryButton],
  ['Forms/BscTextField', bsc.BscTextField],
  ['Forms/BscErrorText', bsc.BscErrorText],
  ['Forms/BscCheckbox', bsc.BscCheckbox],
  ['Forms/BscToggleSwitch', bsc.BscToggleSwitch],
  ['Selection/BscSegmented', bsc.BscSegmented],
  ['Selection/BscSelect', bsc.BscSelect],
  ['Verification/BscOtpInput', bsc.BscOtpInput],
  ['Navigation/BscScreenHeader', bsc.BscScreenHeader],
  ['Navigation/BscPageHeader', bsc.BscPageHeader],
  ['Verification/OtpVerificationField', components.OtpVerificationField],
  ['Verification/Steps', 'Steps'],
  ['Cards/InfoCard', 'InfoCard'],
  ['Feedback/Loader', 'Loader'],
  ['Modals/Compatibility/ModalCommon', 'ModalCommon'],
  ['Modals/Compatibility/ModalCentered', 'ModalCentered'],
  ['Modals/Dialog Recipes/Error/ErrorGeneric', 'ErrorGeneric'],
  ['Modals/Dialog Recipes/Error/ErrorGeneral', 'ErrorGeneral'],
  ['Modals/Dialog Recipes/Error/ErrorServiceGeneral', 'ErrorServiceGeneral'],
  ['Modals/Dialog Recipes/Error/ErrorUserWithoutData', 'ErrorUserWithoutData'],
  ['Modals/Dialog Recipes/Error/MaximumIntentsModal', 'MaximumIntentsModal'],
  ['Modals/Dialog Recipes/Client Verification/NotValidatedClientModal', 'NotValidatedClientModal'],
  ['Modals/Dialog Recipes/Error/TimeoutErrorModal', 'TimeoutErrorModal'],
  ['Modals/Dialog Recipes/Success/SuccessModal', 'SuccessModal'],
  ['Modals/Dialog Recipes/Session/WarningSessionModal', 'WarningSessionModal'],
  ['Modals/Dialog Recipes/Session/SessionExpiredModal', 'SessionExpiredModal'],
  ['Modals/Dialog Recipes/Client Verification/ClientVerifiedModal', 'ClientVerifiedModal'],
] as const;

test.each(catalogMappings)('%s has metadata wired to its actual public export', (title, expectedComponent) => {
  const req = storyEntries[0].req;
  const publicComponents = components as Record<string, unknown>;
  const matches = req.keys().map((key: string) => req(key)).filter((module: { default: { title: string } }) => module.default.title === title);
  expect(matches).toHaveLength(1);
  expect(matches[0].default.component).toBe(typeof expectedComponent === 'string' ? publicComponents[expectedComponent] : expectedComponent);
  expect(Object.keys(matches[0]).filter(key => key !== 'default').length).toBeGreaterThan(0);
});

test('ActionCard stories include compatibility card variants without removing public exports', () => {
  const actionCardStories = storyEntries[0].req('./ActionCard.stories') as Record<string, unknown>;
  expect(components.TouchableCard).toBeDefined();
  expect(components.RegisterPromptCard).toBeDefined();
  expect(actionCardStories).toHaveProperty('TouchableCardVariant');
  expect(actionCardStories).toHaveProperty('RegisterPromptCardVariant');
});

test('pill and flat outline retain distinct source dimensions and disabled behavior', () => {
  const press = jest.fn();
  const view = render(<ButtonPill onPress={press}>Continue</ButtonPill>);
  expect(StyleSheet.flatten(screen.getByRole('button').props.style)).toMatchObject({ borderRadius: 999, paddingVertical: 16, paddingHorizontal: 24, backgroundColor: '#007AFF' });
  expect(StyleSheet.flatten(screen.getByText('Continue').props.style)).toMatchObject({ fontSize: 16, fontWeight: '700' });
  view.unmount();
  render(<ButtonOutlinedFlat onPress={press} disabled>Send</ButtonOutlinedFlat>);
  expect(StyleSheet.flatten(screen.getByRole('button').props.style)).toMatchObject({ borderWidth: 1.5, paddingVertical: 10, backgroundColor: 'transparent' });
  fireEvent.press(screen.getByRole('button'));
  expect(press).not.toHaveBeenCalled();
});

const dialogProps = { visible: true, onClose: jest.fn(), title: 'Review', message: 'Demo message' };
const styleOf = (node: { props: { style?: StyleProp<ViewStyle> } }): ViewStyle => StyleSheet.flatten(node.props.style) ?? {};
test('attempt limit uses separate warning and information panels', () => {
  const view = render(<components.MaximumIntentsModal {...dialogProps} warningMessage="Demo warning" />);
  const styles = view.UNSAFE_getAllByType(View).map(styleOf);
  expect(styles).toEqual(expect.arrayContaining([
    expect.objectContaining({ backgroundColor: '#FDECEC', borderColor: '#f8caca', marginBottom: 16 }),
    expect.objectContaining({ backgroundColor: '#F6FBFF', borderColor: '#dbeafe', marginBottom: 24 }),
  ]));
});
test.each(['SessionExpiredModal', 'WarningSessionModal'] as const)('%s blocks system/backdrop dismissal without blocking explicit actions', name => {
  const close = jest.fn();
  const confirm = jest.fn();
  const secondary = jest.fn();
  const Component = components[name];
  const view = render(<Component {...dialogProps} onClose={close} onConfirm={confirm} onSecondary={secondary} secondaryLabel="Exit" />);
  fireEvent(view.UNSAFE_getByType(Modal), 'requestClose');
  expect(close).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(close).not.toHaveBeenCalled();
  if (name === 'WarningSessionModal') {
    const cancel = screen.getByRole('button', { name: 'Exit' });
    expect(styleOf(cancel)).toMatchObject({ borderWidth: 1, backgroundColor: '#FFFFFF' });
    fireEvent.press(cancel);
    expect(secondary).toHaveBeenCalledTimes(1);
  }
});
test('modal ref controls uncontrolled visibility and preserves declarative visibility', () => {
  const ref = createRef<ModalHandle>();
  const view = render(<components.ModalCommon ref={ref} onClose={() => {}}><Text>Ref modal</Text></components.ModalCommon>);
  expect(view.UNSAFE_getByType(Modal).props.visible).toBe(false);
  expect(ref.current?.isOpen()).toBe(false);

  act(() => ref.current?.open());
  expect(view.UNSAFE_getByType(Modal).props.visible).toBe(true);
  expect(ref.current?.isOpen()).toBe(true);

  act(() => ref.current?.close());
  expect(view.UNSAFE_getByType(Modal).props.visible).toBe(false);

  view.rerender(<components.ModalCommon ref={ref} visible onClose={() => {}}><Text>Ref modal</Text></components.ModalCommon>);
  expect(view.UNSAFE_getByType(Modal).props.visible).toBe(true);
  view.rerender(<components.ModalCommon ref={ref} visible={false} onClose={() => {}}><Text>Ref modal</Text></components.ModalCommon>);
  expect(view.UNSAFE_getByType(Modal).props.visible).toBe(false);
});
test('modal ref close notifies dismissal and bypasses canDismiss', () => {
  const ref = createRef<ModalHandle>();
  const close = jest.fn();
  const change = jest.fn();
  const view = render(<components.ModalCommon ref={ref} defaultVisible onClose={close} onOpenChange={change} closeOnBackdropPress={false}><Text>Locked modal</Text></components.ModalCommon>);

  fireEvent.press(screen.getByTestId('modal-backdrop'));
  expect(view.UNSAFE_getByType(Modal).props.visible).toBe(true);
  expect(close).not.toHaveBeenCalled();

  act(() => ref.current?.close());
  expect(view.UNSAFE_getByType(Modal).props.visible).toBe(false);
  expect(close).toHaveBeenCalledTimes(1);
  expect(change).toHaveBeenCalledWith(false);
});
test('unvalidated client has two filled pills; client verification keeps back, logo slot, details and separate secondary action', () => {
  const action = jest.fn();
  const view = render(<components.NotValidatedClientModal {...dialogProps} secondaryLabel="Return" onSecondary={action} />);
  expect(styleOf(screen.getByRole('button', { name: 'Continue' }))).toMatchObject({ backgroundColor: '#003594', borderRadius: 16 });
  expect(styleOf(screen.getByRole('button', { name: 'Return' }))).toMatchObject({ backgroundColor: '#003594', borderRadius: 16 });
  view.unmount();
  render(<components.ClientVerifiedModal {...dialogProps} details={[{ label: 'Name', value: 'Example Participant' }]} logo={<Text>Demo logo</Text>} secondaryLabel="Not me" onSecondary={action} />);
  expect(screen.getByText('Demo logo')).toBeTruthy();
  expect(screen.getByText('Example Participant')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Not me' }));
  expect(action).toHaveBeenCalledTimes(1);
});
test('loader remains an overlay and default check/chevrons render without an adapter', () => {
  const view = render(<components.Loader visible />);
  expect(view.UNSAFE_queryByType(Modal)).toBeNull();
  expect(view.UNSAFE_getByType(ActivityIndicator).props.size).toBe('large');
  expect(styleOf(view.UNSAFE_getByType(View))).toMatchObject({ zIndex: 999, elevation: 999 });
  expect(components.renderFeatherIcon({ name: 'check', size: 16 })).not.toBeNull();
  expect(components.renderFeatherIcon({ name: 'chevron-right', size: 24 })).not.toBeNull();
});
test('segmented select emits the selected value and retains equal-height segments', () => {
  const select = jest.fn();
  render(<SelectPill value="one" onSelect={select} options={[{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }]} />);
  const two = screen.getByRole('button', { name: 'Two' });
  expect(styleOf(two)).toMatchObject({ flex: 1, height: 40 });
  fireEvent.press(two);
  expect(select).toHaveBeenCalledWith('two');
});
test('anchored select closes when read-only changes and rejects late measurements', () => {
  let measureCallback: MeasureInWindowOnSuccessCallback | undefined;
  const measure = jest.spyOn(View.prototype, 'measureInWindow').mockImplementation(callback => { measureCallback = callback as MeasureInWindowOnSuccessCallback; });
  const props = { options: [{ label: 'Zero', value: 0 }], onChange: jest.fn() };
  const view = render(<Select {...props} />);
  fireEvent.press(screen.getByRole('button'));
  view.rerender(<Select {...props} readOnly />);
  act(() => measureCallback?.(10, 30, 280, 48));
  expect(screen.queryByRole('radio')).toBeNull();
  view.rerender(<Select {...props} />);
  fireEvent.press(screen.getByRole('button'));
  act(() => measureCallback?.(10, 30, 280, 48));
  expect(screen.getByRole('radio', { name: 'Zero' })).toBeTruthy();
  const dropdown = view.UNSAFE_getAllByType(View).map(styleOf).find(style => style.top === 82);
  expect(dropdown).toMatchObject({ left: 10, width: 280 });
  view.rerender(<Select {...props} readOnly />);
  expect(screen.queryByRole('radio')).toBeNull();
  measure.mockRestore();
});
test('OTP send, timed resend and verified state remain host-controlled', () => {
  const send = jest.fn();
  const resend = jest.fn();
  const props = { options: [{ label: 'Demo', value: 0 }], selectedValue: 0, value: '', onChange: jest.fn(), onVerify: jest.fn(), onSend: send, onResend: resend };
  const view = render(<components.OtpVerificationField {...props} />);
  fireEvent.press(screen.getByRole('button', { name: 'Send code' }));
  expect(send).toHaveBeenCalledTimes(1);
  expect(screen.queryByLabelText('Verification code')).toBeNull();
  view.rerender(<components.OtpVerificationField {...props} codeSent timer={{ finished: false, label: '00:30' }} />);
  expect(screen.getByText('00:30')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Resend code' })).toBeNull();
  view.rerender(<components.OtpVerificationField {...props} codeSent verified value="123456" />);
  expect(screen.getByLabelText('Verification code').props.editable).toBe(false);
  expect(screen.queryByRole('button', { name: 'Resend code' })).toBeNull();
});
test('terms acceptance and disclaimer actions do not imply navigation or automatic dismissal', () => {
  const close = jest.fn();
  const accept = jest.fn();
  const view = render(<components.TermsAndConditionsModal visible onClose={close} onAccept={accept} title="Demo information" content="Synthetic content." />);
  fireEvent.press(screen.getByRole('button', { name: 'Accept' }));
  expect(accept).toHaveBeenCalledTimes(1);
  expect(close).not.toHaveBeenCalled();
  view.unmount();
  render(<components.DisclaimerModal visible onClose={close} onBack={close} onContinue={accept} title="Prepare" subtitle="Demo requirements" requirements={[{ label: 'Demo profile', iconName: 'user' }]} />);
  fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  expect(accept).toHaveBeenCalledTimes(2);
  expect(close).not.toHaveBeenCalled();
});
