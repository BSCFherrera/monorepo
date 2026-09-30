import type { Meta, StoryObj } from '@storybook/react';
import { MaximumIntentsModal } from '../src';
import { CommonDialogExample, dialogArgs, supportMessage } from './CommonDialogExample';
const meta = { title: 'Modals/Dialog Recipes/Error/MaximumIntentsModal', component: MaximumIntentsModal, args: { ...dialogArgs, title: 'Maximum attempts reached', warningMessage: 'The allowed number of demo attempts has been exceeded.', message: supportMessage }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof MaximumIntentsModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<MaximumIntentsModal
  visible={visible}
  onClose={handleClose}
  title="Maximum attempts reached"
  warningMessage="The allowed number of attempts has been exceeded."
  message={supportMessage}
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <MaximumIntentsModal {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>,
};
