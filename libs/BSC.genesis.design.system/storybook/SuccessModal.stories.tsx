import type { Meta, StoryObj } from '@storybook/react';
import { SuccessModal } from '../src';
import { CommonDialogExample, dialogArgs } from './CommonDialogExample';
const meta = { title: 'Modals/Dialog Recipes/Success/SuccessModal', component: SuccessModal, args: { ...dialogArgs, title: 'Request completed', message: 'Your demo request was completed successfully. You can now continue.' }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof SuccessModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<SuccessModal
  visible={visible}
  onClose={handleClose}
  title="Request completed"
  message="Your request was completed successfully."
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <SuccessModal {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>,
};
