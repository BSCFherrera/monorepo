import type { Meta, StoryObj } from '@storybook/react';
import { ErrorUserWithoutData } from '../src';
import { CommonDialogExample, dialogArgs, supportMessage } from './CommonDialogExample';
const meta = {
  title: 'Modals/Dialog Recipes/Error/OnboardingErrorUserWithoutData', component: ErrorUserWithoutData,
  args: { ...dialogArgs, title: 'Your demo profile needs more information', message: supportMessage, confirmLabel: 'Return home' },
  tags: ['compatibility'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility copy variant of ErrorUserWithoutData, including bold/link text inside the information panel.' } } },
} satisfies Meta<typeof ErrorUserWithoutData>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<ErrorUserWithoutData
  visible={visible}
  onClose={handleClose}
  onConfirm={handleClose}
  title="Your demo profile needs more information"
  message={supportMessage}
  confirmLabel="Return home"
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <ErrorUserWithoutData {...args} visible={visible} onClose={onClose} onConfirm={onClose} />}</CommonDialogExample>,
};
