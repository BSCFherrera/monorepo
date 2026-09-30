import type { Meta, StoryObj } from '@storybook/react';
import { TimeoutErrorModal } from '../src';
import { CommonDialogExample, dialogArgs } from './CommonDialogExample';
const meta = { title: 'Modals/Dialog Recipes/Error/TimeoutErrorModal', component: TimeoutErrorModal, args: { ...dialogArgs, title: 'This request took too long', message: 'The demo request has timed out. You can return home and start again.' }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof TimeoutErrorModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<TimeoutErrorModal
  visible={visible}
  onClose={handleClose}
  title="This request took too long"
  message="The request has timed out. You can return home and start again."
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <TimeoutErrorModal {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>,
};
