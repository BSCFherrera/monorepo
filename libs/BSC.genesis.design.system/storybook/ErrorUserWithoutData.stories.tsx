import type { Meta, StoryObj } from '@storybook/react';
import { ErrorUserWithoutData } from '../src';
import { CommonDialogExample, dialogArgs, supportMessage } from './CommonDialogExample';
const meta = { title: 'Modals/Dialog Recipes/Error/ErrorUserWithoutData', component: ErrorUserWithoutData, args: { ...dialogArgs, title: 'Your demo profile needs more information', message: supportMessage }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof ErrorUserWithoutData>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<ErrorUserWithoutData
  visible={visible}
  onClose={handleClose}
  title="Your profile needs more information"
  message={supportMessage}
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <ErrorUserWithoutData {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>,
};
