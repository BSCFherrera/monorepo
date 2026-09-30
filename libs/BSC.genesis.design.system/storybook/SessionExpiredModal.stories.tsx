import type { Meta, StoryObj } from '@storybook/react';
import { SessionExpiredModal } from '../src';
import { CommonDialogExample, dialogArgs } from './CommonDialogExample';
const meta = { title: 'Modals/Dialog Recipes/Session/SessionExpiredModal', component: SessionExpiredModal, args: { ...dialogArgs, title: 'Your session has expired', message: 'This demo session is no longer active. Please acknowledge this message to continue.', confirmLabel: 'Acknowledge' }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof SessionExpiredModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<SessionExpiredModal
  visible={visible}
  onClose={handleClose}
  title="Your session has expired"
  message="This session is no longer active."
  confirmLabel="Acknowledge"
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <SessionExpiredModal {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>,
};
