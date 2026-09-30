import type { Meta, StoryObj } from '@storybook/react';
import { MaximumIntentsModal } from '../src';
import { CommonDialogExample, dialogArgs, supportMessage } from './CommonDialogExample';
const meta = {
  title: 'Modals/Dialog Recipes/Error/OnboardingMaximumIntentsModal', component: MaximumIntentsModal,
  args: { ...dialogArgs, title: 'Maximum demo attempts reached', warningMessage: 'The allowed number of example attempts has been exceeded.', message: supportMessage, confirmLabel: 'Return home' },
  tags: ['compatibility'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility copy variant of MaximumIntentsModal. A separate red warning panel precedes the blue information panel.' } } },
} satisfies Meta<typeof MaximumIntentsModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<MaximumIntentsModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleClose}
  title="Maximum demo attempts reached"
  warningMessage="The allowed number of example attempts has been exceeded."
  message={supportMessage}
  confirmLabel="Return home"
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <MaximumIntentsModal {...args} visible={visible} onClose={onClose} onConfirm={onClose} />}</CommonDialogExample>,
};
