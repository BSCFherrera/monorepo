import type { Meta, StoryObj } from '@storybook/react';
import { ErrorGeneral } from '../src';
import { CommonDialogExample, dialogArgs, supportMessage } from './CommonDialogExample';
const meta = { title: 'Modals/Dialog Recipes/Error/ErrorGeneral', component: ErrorGeneral, args: { ...dialogArgs, title: 'We need your attention', message: supportMessage, confirmLabel: 'Return home' }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof ErrorGeneral>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<ErrorGeneral
  visible={visible}
  onClose={handleClose}
  title="We need your attention"
  message={supportMessage}
  confirmLabel="Return home"
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <ErrorGeneral {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>,
};
