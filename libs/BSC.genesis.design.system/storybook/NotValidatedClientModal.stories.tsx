import type { Meta, StoryObj } from '@storybook/react';
import { NotValidatedClientModal } from '../src';
import { CommonDialogExample, dialogArgs } from './CommonDialogExample';
const meta = { title: 'Modals/Dialog Recipes/Client Verification/NotValidatedClientModal', component: NotValidatedClientModal, args: { ...dialogArgs, title: 'Profile not yet validated', secondaryLabel: 'Return home', confirmLabel: 'Review profile', onSecondary: () => {} }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof NotValidatedClientModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<NotValidatedClientModal
  visible={visible}
  onClose={handleClose}
  onSecondary={handleReturnHome}
  title="Profile not yet validated"
  confirmLabel="Review profile"
  secondaryLabel="Return home"
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <NotValidatedClientModal {...args} visible={visible} onClose={onClose} onSecondary={onClose} />}</CommonDialogExample>,
};
