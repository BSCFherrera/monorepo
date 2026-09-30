import type { Meta, StoryObj } from '@storybook/react';
import { ErrorGeneral } from '../src';
import { CommonDialogExample, dialogArgs, supportMessage } from './CommonDialogExample';
const meta = {
  title: 'Modals/Dialog Recipes/Error/OnboardingErrorGeneral', component: ErrorGeneral,
  args: { ...dialogArgs, title: 'This demo request needs attention', message: supportMessage, confirmLabel: 'Return home' },
  tags: ['compatibility'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility copy variant of ErrorGeneral with the same illustration, heading, rich information panel, spacing, and standard button. Only host callbacks and copy differ.' } } },
} satisfies Meta<typeof ErrorGeneral>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<ErrorGeneral
  visible={visible}
  onClose={handleClose}
  onConfirm={handleClose}
  title="This demo request needs attention"
  message={supportMessage}
  confirmLabel="Return home"
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <ErrorGeneral {...args} visible={visible} onClose={onClose} onConfirm={onClose} />}</CommonDialogExample>,
};
