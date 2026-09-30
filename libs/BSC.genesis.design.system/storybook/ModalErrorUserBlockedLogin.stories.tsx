import { Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { ModalErrorUserBlockedLogin } from '../src';
import { CommonDialogExample } from './CommonDialogExample';

const meta = {
  title: 'Modals/Dialog Recipes/Error/ModalErrorUserBlockedLogin', component: ModalErrorUserBlockedLogin,
  tags: ['compatibility'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility onboarding error recipe that delegates to the shared ModalCommon information-panel layout.' } } },
  args: {
    visible: true, onClose: () => {}, title: 'Your demo access is temporarily blocked', confirmLabel: 'Acknowledge',
    message: <Text>Please review the <Text style={{ fontWeight: '700', color: '#1A1A1A' }}>demo support instructions</Text> before attempting to access the workspace again.</Text>,
  },
} satisfies Meta<typeof ModalErrorUserBlockedLogin>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<ModalErrorUserBlockedLogin
  visible={visible}
  onClose={handleClose}
  title="Your demo access is temporarily blocked"
  message={blockedAccessMessage}
  confirmLabel="Acknowledge"
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <ModalErrorUserBlockedLogin {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>,
};
