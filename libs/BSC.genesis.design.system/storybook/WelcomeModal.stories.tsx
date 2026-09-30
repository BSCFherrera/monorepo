import { Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { WelcomeModal } from '../src';
import { CommonDialogExample } from './CommonDialogExample';

const meta = {
  title: 'Modals/Dialog Recipes/Welcome/WelcomeModal', component: WelcomeModal,
  tags: ['compatibility'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility onboarding recipe that delegates to the shared ModalCommon surface with welcome-specific copy and action wiring.' } } },
  args: {
    visible: true, onClose: () => {}, onAccessChat: () => {}, title: 'Welcome to your demo workspace', confirmLabel: 'Open conversation',
    message: <Text>You can now explore <Text style={{ fontWeight: '700', color: '#1A1A1A' }}>your new conversation space</Text> and discover the available tools at your own pace.</Text>,
  },
} satisfies Meta<typeof WelcomeModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<WelcomeModal
  visible={visible}
  onClose={handleClose}
  onAccessChat={handleAccessChat}
  title="Welcome to your demo workspace"
  confirmLabel="Open conversation"
  message={welcomeMessage}
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <WelcomeModal {...args} visible={visible} onClose={onClose} onAccessChat={onClose} />}</CommonDialogExample>,
};
