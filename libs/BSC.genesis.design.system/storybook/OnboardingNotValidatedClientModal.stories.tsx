import type { Meta, StoryObj } from '@storybook/react';
import { NotValidatedClientModal } from '../src';
import { CommonDialogExample, dialogArgs } from './CommonDialogExample';
const meta = {
  title: 'Modals/Dialog Recipes/Client Verification/OnboardingNotValidatedClientModal', component: NotValidatedClientModal,
  args: { ...dialogArgs, title: 'Your demo profile is not validated', confirmLabel: 'Review profile', secondaryLabel: 'Return home', onSecondary: () => {} },
  tags: ['compatibility'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility copy variant of NotValidatedClientModal: two filled full-width pills below the information panel.' } } },
} satisfies Meta<typeof NotValidatedClientModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<NotValidatedClientModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleReviewProfile}
  onSecondary={handleReturnHome}
  title="Your demo profile is not validated"
  confirmLabel="Review profile"
  secondaryLabel="Return home"
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <NotValidatedClientModal {...args} visible={visible} onClose={onClose} onConfirm={onClose} onSecondary={onClose} />}</CommonDialogExample>,
};
