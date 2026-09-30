import type { Meta, StoryObj } from '@storybook/react';
import { ErrorGeneric } from '../src';
import { CommonDialogExample, dialogArgs } from './CommonDialogExample';
const meta = { title: 'Modals/Dialog Recipes/Error/ErrorGeneric', component: ErrorGeneric, args: { ...dialogArgs, title: 'Unable to complete this request' }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof ErrorGeneric>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<ErrorGeneric
  visible={visible}
  onClose={handleClose}
  title="Unable to complete this request"
  message="Please try again later."
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <ErrorGeneric {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>,
};
