import { fireEvent, render, screen } from '@testing-library/react-native';
import { Modal, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import * as components from '../src';
import { storyEntries } from '../storybook/catalog';

jest.mock('@storybook/addon-actions', () => ({ action: jest.fn(() => jest.fn()) }));

const styleOf = (node: { props: { style?: StyleProp<ViewStyle> } }): ViewStyle => StyleSheet.flatten(node.props.style) ?? {};
const props = { visible: true, onClose: jest.fn(), title: 'Demo heading', message: 'Synthetic description' };

const sourceMapping = [
  ['ErrorGeneral', components.ErrorGeneral],
  ['ErrorServiceGeneral', components.ErrorServiceGeneral],
  ['ErrorUserWithoutData', components.ErrorUserWithoutData],
  ['MaximumIntentsModal', components.MaximumIntentsModal],
  ['NotValidatedClientModal', components.NotValidatedClientModal],
  ['TimoutErrorModal', components.TimoutErrorModal],
  ['WelcomeModal', components.WelcomeModal],
  ['ModalErrorUserBlockedLogin', components.ModalErrorUserBlockedLogin],
  ['ProofOfLifeSuccessModal', components.ProofOfLifeSuccessModal],
  ['ClientVerifiedModal', components.OnboardingClientVerifiedModal],
] as const;

const storyTitleForSourceName = (name: string) => {
  if (name === 'TimoutErrorModal') return 'Modals/Compatibility/TimoutErrorModal';
  if (name === 'ClientVerifiedModal') return 'Modals/Dialog Recipes/Client Verification/OnboardingClientVerifiedModal';
  if (name === 'NotValidatedClientModal') return 'Modals/Dialog Recipes/Client Verification/OnboardingNotValidatedClientModal';
  if (name === 'WelcomeModal') return 'Modals/Dialog Recipes/Welcome/WelcomeModal';
  if (name === 'ProofOfLifeSuccessModal') return 'Modals/Dialog Recipes/Success/ProofOfLifeSuccessModal';
  if (name === 'ModalErrorUserBlockedLogin') return 'Modals/Dialog Recipes/Error/ModalErrorUserBlockedLogin';
  return `Modals/Dialog Recipes/Error/${name.startsWith('Error') || name === 'MaximumIntentsModal' || name === 'ModalErrorUserBlockedLogin' ? `Onboarding${name}` : name}`;
};

test.each(sourceMapping)('%s has function-grouped metadata pointing at its audited recipe', (name, Component) => {
  const req = storyEntries[0].req;
  const matches = req.keys().map((key: string) => req(key)).filter((module: { default: { title: string } }) => module.default.title === storyTitleForSourceName(name));
  expect(matches).toHaveLength(1);
  expect(matches[0].default.component).toBe(Component);
  expect(matches[0]).toHaveProperty('Default');
});

test('welcome preserves the source close control, rounded icon box, rich body, and independent access callback', () => {
  const close = jest.fn();
  const access = jest.fn();
  const view = render(<components.WelcomeModal {...props} onClose={close} onAccessChat={access}
    message={<Text>Explore <Text style={{ fontWeight: '700', color: '#1A1A1A' }}>demo conversations</Text> at your own pace.</Text>} />);
  expect(styleOf(screen.getByRole('button', { name: 'Close' }))).toMatchObject({ alignSelf: 'flex-end', marginTop: 8 });
  expect(view.UNSAFE_getAllByType(View).map(styleOf)).toEqual(expect.arrayContaining([
    expect.objectContaining({ width: 64, height: 64, borderRadius: 16, backgroundColor: '#EAF0FE', marginBottom: 16 }),
  ]));
  expect(screen.getByText('demo conversations')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByText('Demo heading').props.style)).toMatchObject({ fontSize: 18, marginBottom: 8 });
  fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  expect(access).toHaveBeenCalledTimes(1);
  expect(close).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Close' }));
  expect(close).toHaveBeenCalledTimes(1);
});

test('blocked login preserves the red 64-pixel circle, inset title and official primary button', () => {
  const close = jest.fn();
  const view = render(<components.ModalErrorUserBlockedLogin {...props} onClose={close} />);
  expect(view.UNSAFE_getAllByType(View).map(styleOf)).toEqual(expect.arrayContaining([
    expect.objectContaining({ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FDECEC', marginTop: 16, marginBottom: 24 }),
  ]));
  expect(StyleSheet.flatten(screen.getByText('Demo heading').props.style)).toMatchObject({ fontSize: 18, paddingHorizontal: 48, marginBottom: 24 });
  expect(styleOf(screen.getByRole('button', { name: 'Continue' }))).toMatchObject({ borderRadius: 16, backgroundColor: '#003594' });
  fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  expect(close).toHaveBeenCalledTimes(1);
});

test('proof-of-life success shares Common success and routes action and dismissal through onContinue', () => {
  const onContinue = jest.fn();
  const view = render(<components.ProofOfLifeSuccessModal visible title={props.title} message={props.message} onContinue={onContinue} />);
  expect(view.UNSAFE_getByType(components.SuccessModal)).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  fireEvent(view.UNSAFE_getByType(Modal), 'requestClose');
  expect(onContinue).toHaveBeenCalledTimes(2);
  expect(components.TimoutErrorModal).toBe(components.TimeoutErrorModal);
});

test('onboarding client verification shares the primary recipe and selects one host-controlled service-error surface', () => {
  const confirm = jest.fn();
  const closeError = jest.fn();
  const detailProps = { ...props, onConfirm: confirm, details: [{ label: 'Name', value: 'Example Participant' }], secondaryLabel: 'Not me', onSecondary: jest.fn() };
  const view = render(<View><components.OnboardingClientVerifiedModal {...detailProps} /></View>);
  expect(view.UNSAFE_getByType(components.ClientVerifiedModal)).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('Service unavailable')).toBeNull();
  view.rerender(<View><components.OnboardingClientVerifiedModal {...detailProps} serviceError={{ ...props, title: 'Service unavailable', onClose: closeError }} /></View>);
  expect(view.UNSAFE_queryByType(components.ClientVerifiedModal)).toBeNull();
  expect(view.UNSAFE_getByType(components.ErrorServiceGeneral)).toBeTruthy();
  expect(view.UNSAFE_getAllByType(Modal)).toHaveLength(1);
  fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  expect(closeError).toHaveBeenCalledTimes(1);
  expect(confirm).toHaveBeenCalledTimes(1);
});

const variantMapping = [
  ['info', components.ErrorGeneric], ['contact', components.ErrorGeneral],
  ['service', components.ErrorServiceGeneral], ['userData', components.ErrorUserWithoutData],
  ['maxAttempts', components.MaximumIntentsModal], ['unvalidatedClient', components.NotValidatedClientModal],
  ['timeout', components.TimeoutErrorModal], ['success', components.SuccessModal],
  ['sessionExpired', components.SessionExpiredModal], ['sessionWarning', components.WarningSessionModal],
  ['welcome', components.WelcomeModal], ['blockedLogin', components.ModalErrorUserBlockedLogin],
  ['clientVerified', components.OnboardingClientVerifiedModal],
] as const;

const variantProps: Record<string, object> = {
  maxAttempts: { warningMessage: 'Too many attempts' },
  unvalidatedClient: { secondaryLabel: 'Go back', onSecondary: jest.fn() },
};

test.each(variantMapping)('FeedbackModal %s delegates to its named recipe without changing confirmation or dismissal callbacks', (variant) => {
  const confirm = jest.fn();
  const dismiss = jest.fn();
  const extra = variantProps[variant] ?? {};
  render(<components.FeedbackModal visible title={props.title} variant={variant} message={props.message} onDismiss={dismiss} onConfirm={confirm}
    actions={<Text>Extra action slot</Text>} {...extra}><Text>Extra content slot</Text></components.FeedbackModal>);
  expect(screen.getByText('Extra content slot')).toBeTruthy();
  expect(screen.getByText('Extra action slot')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(dismiss).not.toHaveBeenCalled();
  fireEvent.press(screen.getByTestId('modal-backdrop'));
  expect(dismiss).toHaveBeenCalledTimes(variant.startsWith('session') ? 0 : 1);
});

test.each(['welcome', 'blockedLogin', 'clientVerified'] as const)('FeedbackModal %s keeps canDismiss=false and confirming behavior', variant => {
  const confirm = jest.fn();
  const dismiss = jest.fn();
  const view = render(<components.FeedbackModal visible variant={variant} title={props.title} onDismiss={dismiss} onConfirm={confirm} canDismiss={false} confirming />);
  fireEvent.press(screen.getByTestId('modal-backdrop'));
  fireEvent(view.UNSAFE_getByType(Modal), 'requestClose');
  const close = screen.queryByRole('button', { name: variant === 'clientVerified' ? 'Back' : 'Close' });
  if (close) fireEvent.press(close);
  expect(screen.getByRole('button', { name: 'Continue' }).props.accessibilityState).toMatchObject({ disabled: true, busy: true });
  expect(confirm).not.toHaveBeenCalled();
  expect(dismiss).not.toHaveBeenCalled();
});

test.each(['welcome', 'blockedLogin', 'clientVerified', 'unvalidatedClient', 'sessionWarning'] as const)('generic %s does not invent omitted action callbacks', variant => {
  render(<components.FeedbackModal visible variant={variant} title={props.title} onDismiss={() => {}} />);
  expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'End session' })).toBeNull();
});

test.each(['clientVerified', 'sessionWarning', 'unvalidatedClient'] as const)('generic %s preserves the independent secondary callback', variant => {
  const dismiss = jest.fn();
  const secondary = jest.fn();
  render(<components.FeedbackModal visible variant={variant} title={props.title} onDismiss={dismiss} secondaryLabel="Secondary action" onSecondary={secondary} />);
  fireEvent.press(screen.getByRole('button', { name: 'Secondary action' }));
  expect(secondary).toHaveBeenCalledTimes(1);
  expect(dismiss).not.toHaveBeenCalled();
});

test('generic client verification preserves subtitle, detail data and logo slot', () => {
  render(<components.FeedbackModal visible variant="clientVerified" title={props.title} onDismiss={() => {}} subtitle="Confirm the demo details" message="Example Participant" detailLabel="Name" logo={<Text>Demo logo slot</Text>} />);
  expect(screen.getByText('Confirm the demo details')).toBeTruthy();
  expect(screen.getByText('Name')).toBeTruthy();
  expect(screen.getByText('Example Participant')).toBeTruthy();
  expect(screen.getByText('Demo logo slot')).toBeTruthy();
});

test.each(['terms', 'disclaimer'] as const)('ContentModal %s uses its named layout and preserves accept/extra slots', variant => {
  const accept = jest.fn();
  const dismiss = jest.fn();
  const view = render(<components.ContentModal visible title={props.title} variant={variant} onDismiss={dismiss} onAccept={accept} canDismiss={false}
    requirements={[{ label: 'Demo requirement', iconName: 'info' }]} actions={<Text>Extra actions</Text>}><Text>Extra content</Text></components.ContentModal>);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(view.UNSAFE_getAllByType((variant === 'terms' ? components.TermsAndConditionsModal : components.DisclaimerModal) as any).length).toBeGreaterThan(0);
  expect(screen.getByText('Extra content')).toBeTruthy();
  expect(screen.getByText('Extra actions')).toBeTruthy();
  fireEvent.press(screen.getByTestId('modal-backdrop'));
  fireEvent.press(screen.getByRole('button', { name: 'Accept' }));
  expect(accept).toHaveBeenCalledTimes(1);
  expect(dismiss).not.toHaveBeenCalled();
});

test('unused theme customization is not part of the public API', () => {
  expect(components).not.toHaveProperty('ThemeProvider');
  expect(components).not.toHaveProperty('useTheme');
  expect(components).not.toHaveProperty('tokens');
});
