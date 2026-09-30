import type { Meta, StoryObj } from '@storybook/react';
import { WarningSessionModal } from '../src';
import { CommonDialogExample, dialogArgs } from './CommonDialogExample';
const meta = { title: 'Modals/Dialog Recipes/Session/WarningSessionModal', component: WarningSessionModal, args: { ...dialogArgs, title: 'Your session will expire soon', message: 'This demo session has been inactive. Choose whether to continue or end it now.', confirmLabel: 'Continue session', secondaryLabel: 'End session', onSecondary: () => {} }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof WarningSessionModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<WarningSessionModal
  visible={visible}
  onClose={handleClose}
  onSecondary={handleEndSession}
  title="Your session will expire soon"
  message="Choose whether to continue or end it now."
  confirmLabel="Continue session"
  secondaryLabel="End session"
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <WarningSessionModal {...args} visible={visible} onClose={onClose} onSecondary={onClose} />}</CommonDialogExample>,
};
