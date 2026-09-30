import type { Meta, StoryObj } from '@storybook/react';
import { ErrorServiceGeneral } from '../src';
import { CommonDialogExample, dialogArgs } from './CommonDialogExample';
const meta = {
  title: 'Modals/Dialog Recipes/Error/OnboardingErrorServiceGeneral', component: ErrorServiceGeneral,
  args: { ...dialogArgs, title: 'The demo service is unavailable', message: 'This example service cannot complete your request. Please try again later.', confirmLabel: 'Close' },
  tags: ['compatibility'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility copy variant of ErrorServiceGeneral: the same information-panel recipe with a standard close action.' } } },
} satisfies Meta<typeof ErrorServiceGeneral>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<ErrorServiceGeneral
  visible={visible}
  onClose={handleClose}
  title="The demo service is unavailable"
  message="This example service cannot complete your request. Please try again later."
  confirmLabel="Close"
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <ErrorServiceGeneral {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>,
};
