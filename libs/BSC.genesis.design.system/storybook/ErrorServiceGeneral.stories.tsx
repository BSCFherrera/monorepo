import type { Meta, StoryObj } from '@storybook/react';
import { ErrorServiceGeneral } from '../src';
import { CommonDialogExample, dialogArgs } from './CommonDialogExample';
const meta = { title: 'Modals/Dialog Recipes/Error/ErrorServiceGeneral', component: ErrorServiceGeneral, args: { ...dialogArgs, title: 'Service temporarily unavailable', message: 'The demo service could not complete your request. Please try again later.', confirmLabel: 'Close' }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof ErrorServiceGeneral>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<ErrorServiceGeneral
  visible={visible}
  onClose={handleClose}
  title="Service temporarily unavailable"
  message="The service could not complete your request. Please try again later."
  confirmLabel="Close"
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <ErrorServiceGeneral {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>,
};
