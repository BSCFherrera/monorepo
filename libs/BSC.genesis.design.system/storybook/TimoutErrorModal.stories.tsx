import type { Meta, StoryObj } from '@storybook/react';
import { TimoutErrorModal } from '../src';
import { CommonDialogExample, dialogArgs } from './CommonDialogExample';
const meta = {
  title: 'Modals/Compatibility/TimoutErrorModal', component: TimoutErrorModal,
  args: { ...dialogArgs, title: 'This demo request took too long', message: 'You can return home and start a new example request.', confirmLabel: 'Return home' },
  tags: ['compatibility', 'deprecated'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Deprecated compatibility alias preserving the misspelled public export TimoutErrorModal. Prefer TimeoutErrorModal for new code.' } } },
} satisfies Meta<typeof TimoutErrorModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<TimoutErrorModal
  visible={visible}
  onClose={handleClose}
  title="This demo request took too long"
  message="You can return home and start a new example request."
  confirmLabel="Return home"
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <TimoutErrorModal {...args} visible={visible} onClose={onClose} onConfirm={onClose} />}</CommonDialogExample>,
};
