import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { OnboardingClientVerifiedModal, type OnboardingClientVerifiedModalProps } from '../src';
import { BrandPlaceholder } from './BrandPlaceholder';
import { CommonDialogExample } from './CommonDialogExample';

const serviceError = { visible: true, onClose: () => {}, title: 'Unable to complete the demo step', message: 'No registration service is connected. Return to the profile and try this example again.', confirmLabel: 'Return to profile' };
const meta = {
  title: 'Modals/Dialog Recipes/Client Verification/OnboardingClientVerifiedModal', component: OnboardingClientVerifiedModal,
  tags: ['compatibility'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility client-verification recipe matching ClientVerifiedModal. The optional service-error state uses ErrorServiceGeneral without invoking a backend.' } } },
  args: { visible: true, onClose: () => {}, title: 'Confirm your information', message: 'Review the demo profile before continuing to the next step.', details: [{ label: 'Display name', value: 'Example Participant' }], logo: <BrandPlaceholder />, secondaryLabel: 'This is not me', onSecondary: () => {}, confirmLabel: 'Continue' },
} satisfies Meta<typeof OnboardingClientVerifiedModal>;
export default meta;

function Example(props: OnboardingClientVerifiedModalProps) {
  const [failed, setFailed] = useState(props.serviceError?.visible ?? false);
  return <CommonDialogExample>{(visible, onClose) => <OnboardingClientVerifiedModal {...props} visible={visible} onClose={onClose} onSecondary={onClose}
    onConfirm={() => setFailed(true)} serviceError={{ ...serviceError, visible: failed, onClose: () => setFailed(false) }} />}</CommonDialogExample>;
}
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<OnboardingClientVerifiedModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleContinue}
  onSecondary={handleReject}
  title="Confirm your information"
  message="Review the demo profile before continuing to the next step."
  details={[{ label: 'Display name', value: 'Example Participant' }]}
  logo={<BrandLogo />}
/>` } } },
  render: args => <Example {...args} />,
};
export const ServiceError: StoryObj<typeof meta> = {
  args: { serviceError },
  parameters: { docs: { source: { code: `<OnboardingClientVerifiedModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleContinue}
  title="Confirm your information"
  serviceError={{
    visible: showServiceError,
    onClose: hideServiceError,
    title: 'Unable to complete the step',
    message: 'Please return to the profile and try again.',
  }}
/>` } } },
  render: args => <Example {...args} />,
};
