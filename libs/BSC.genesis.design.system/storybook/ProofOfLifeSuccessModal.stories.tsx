import type { Meta, StoryObj } from '@storybook/react';
import { ProofOfLifeSuccessModal } from '../src';
import { CommonDialogExample } from './CommonDialogExample';

const meta = {
  title: 'Modals/Dialog Recipes/Success/ProofOfLifeSuccessModal', component: ProofOfLifeSuccessModal,
  tags: ['compatibility'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility success recipe sharing the SuccessModal layout. This example does not perform identity verification.' } } },
  args: { visible: true, onContinue: () => {}, title: 'Demo verification completed', message: 'The example verification step is complete. You can continue with the remaining steps.', confirmLabel: 'Continue' },
} satisfies Meta<typeof ProofOfLifeSuccessModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<ProofOfLifeSuccessModal
  visible={visible}
  onContinue={handleContinue}
  title="Demo verification completed"
  message="The example verification step is complete."
  confirmLabel="Continue"
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <ProofOfLifeSuccessModal {...args} visible={visible} onContinue={onClose} />}</CommonDialogExample>,
};
