import { useRef, useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { BscPrimaryButton } from '@bsc/ui-native';
import { FeedbackModal, type FeedbackVariant, type ModalHandle } from '../src';
import { BrandPlaceholder } from './BrandPlaceholder';

const meta = {
  title: 'Feedback/FeedbackModal',
  component: FeedbackModal,
  args: { visible: false, onDismiss: () => {}, title: 'Example feedback' },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'FeedbackModal adapts shared dialog recipes behind one variant prop. Use controlled `visible` when feedback follows app state. Use the imperative `ref` for local, one-off feedback triggers. Specialized recipe exports remain available for compatibility and clearer migration paths.' } },
  },
} satisfies Meta<typeof FeedbackModal>;

export default meta;
type Story = StoryObj<typeof meta>;

function FeedbackExample({ variant, initiallyOpen = false }: { variant: FeedbackVariant; initiallyOpen?: boolean }) {
  const [visible, setVisible] = useState(initiallyOpen);
  return (
    <View style={{ gap: 16 }}>
      <BscPrimaryButton label={`Open ${variant}`} onPress={() => setVisible(true)} />
      <FeedbackModal
        visible={visible}
        onDismiss={() => setVisible(false)}
        title={variant === 'success' ? 'Process completed' : variant === 'timeout' ? 'Session timeout' : variant === 'sessionExpired' ? 'Session expired' : variant === 'sessionWarning' ? 'Session about to expire' : variant === 'blockedLogin' ? 'Account locked' : variant === 'welcome' ? 'Welcome!' : variant === 'clientVerified' ? 'Verify your data' : variant === 'maxAttempts' ? 'Maximum attempts reached' : variant === 'unvalidatedClient' ? 'Unvalidated client' : 'Information'}
        variant={variant}
        message={variant === 'success' ? 'Your demo request has been processed successfully.' : variant === 'timeout' ? 'The demo request took too long to complete.' : variant === 'sessionExpired' ? 'Your previous demo session is no longer valid.' : variant === 'sessionWarning' ? 'Your demo session will expire soon due to inactivity.' : variant === 'blockedLogin' ? 'Please review the demo support instructions before trying again.' : variant === 'welcome' ? 'Explore your new conversation space and discover the available tools at your own pace.' : variant === 'maxAttempts' ? 'Review the demo help resources to learn about the next step.' : variant === 'unvalidatedClient' ? 'Your demo profile has not been validated yet.' : variant === 'clientVerified' ? 'Example Participant' : 'This is a synthetic informational message.'}
        warningMessage={variant === 'maxAttempts' ? 'You have exceeded the maximum number of attempts.' : undefined}
        subtitle={variant === 'clientVerified' ? 'Please confirm your information below.' : undefined}
        canDismiss={variant !== 'sessionExpired' && variant !== 'sessionWarning'}
        confirmLabel={variant === 'sessionWarning' ? 'Extend session' : variant === 'welcome' ? 'Get started' : 'Continue'}
        onConfirm={() => setVisible(false)}
        secondaryLabel={variant === 'sessionWarning' ? 'Log out' : variant === 'clientVerified' ? 'This is not me' : variant === 'unvalidatedClient' ? 'Go home' : undefined}
        onSecondary={variant === 'sessionWarning' || variant === 'clientVerified' || variant === 'unvalidatedClient' ? () => setVisible(false) : undefined}
        logo={variant === 'clientVerified' ? <BrandPlaceholder /> : undefined}
        detailLabel={variant === 'clientVerified' ? 'Display name' : undefined}
      />
    </View>
  );
}

export const Info: Story = {
  parameters: {
    docs: {
      source: {
        code: `<FeedbackModal
  visible={visible}
  onDismiss={handleDismiss}
  variant="info"
  title="Information"
  message="This is a synthetic informational message."
  confirmLabel="Continue"
  onConfirm={handleDismiss}
/>`,
      },
    },
  },
  render: () => <FeedbackExample variant="info" />,
};
export const ImperativeRef: Story = {
  parameters: {
    docs: {
      source: {
        code: `const modalRef = useRef<ModalHandle>(null);

<>
  <BscPrimaryButton label="Open feedback with ref" onPress={() => modalRef.current?.open()} />
  <BscPrimaryButton label="Close feedback with ref" onPress={() => modalRef.current?.close()} />
  <FeedbackModal
    ref={modalRef}
    variant="success"
    title="Saved"
    message="This feedback modal was opened through ModalHandle.open()."
    confirmLabel="Close"
    onConfirm={() => modalRef.current?.close()}
  />
</>`,
      },
    },
  },
  render: () => {
    const modalRef = useRef<ModalHandle>(null);
    return (
      <View style={{ gap: 16 }}>
        <BscPrimaryButton label="Open feedback with ref" onPress={() => modalRef.current?.open()} />
        <BscPrimaryButton label="Close feedback with ref" onPress={() => modalRef.current?.close()} />
        <FeedbackModal
          ref={modalRef}
          variant="success"
          title="Saved"
          message="This feedback modal was opened through ModalHandle.open()."
          confirmLabel="Close"
          onConfirm={() => modalRef.current?.close()}
        />
      </View>
    );
  },
};
export const Service: Story = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="service" title="Information" message="The service could not complete the request." />' } } }, render: () => <FeedbackExample variant="service" /> };
export const Contact: Story = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="contact" title="Information" message="Contact support for help with this request." />' } } }, render: () => <FeedbackExample variant="contact" /> };
export const UserData: Story = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="userData" title="Information" message="Review the information associated with this profile." />' } } }, render: () => <FeedbackExample variant="userData" /> };
export const Success: Story = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="success" title="Process completed" message="Your request has been processed successfully." />' } } }, render: () => <FeedbackExample variant="success" initiallyOpen /> };
export const Timeout: Story = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="timeout" title="Session timeout" message="The request took too long to complete." />' } } }, render: () => <FeedbackExample variant="timeout" /> };
export const SessionExpired: Story = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="sessionExpired" title="Session expired" message="Your previous session is no longer valid." />' } } }, render: () => <FeedbackExample variant="sessionExpired" /> };
export const SessionWarning: Story = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="sessionWarning" title="Session about to expire" message="Your session will expire soon." secondaryLabel="Log out" onSecondary={handleLogout} />' } } }, render: () => <FeedbackExample variant="sessionWarning" /> };
export const BlockedLogin: Story = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="blockedLogin" title="Account locked" message="Please review the support instructions before trying again." />' } } }, render: () => <FeedbackExample variant="blockedLogin" /> };
export const Welcome: Story = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="welcome" title="Welcome!" message="Explore your new conversation space." confirmLabel="Get started" />' } } }, render: () => <FeedbackExample variant="welcome" /> };
export const MaxAttempts: Story = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="maxAttempts" title="Maximum attempts reached" warningMessage="You have exceeded the maximum number of attempts." />' } } }, render: () => <FeedbackExample variant="maxAttempts" /> };
export const UnvalidatedClient: Story = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="unvalidatedClient" title="Unvalidated client" message="Your profile has not been validated yet." secondaryLabel="Go home" onSecondary={handleGoHome} />' } } }, render: () => <FeedbackExample variant="unvalidatedClient" /> };
export const ClientVerified: Story = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="clientVerified" title="Verify your data" message="Example Participant" logo={<BrandLogo />} />' } } }, render: () => <FeedbackExample variant="clientVerified" /> };
