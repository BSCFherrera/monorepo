import type { Meta, StoryObj } from '@storybook/react';
import { DisclaimerModal } from '../src';
import { CommonDialogExample } from './CommonDialogExample';
import { BrandPlaceholder } from './BrandPlaceholder';
const meta = { title: 'Modals/Dialog Recipes/Disclaimer/DisclaimerModal', component: DisclaimerModal, args: { visible: true, onClose: () => {}, onBack: () => {}, onContinue: () => {}, title: 'Before you continue', subtitle: 'Prepare the following items for this demo.', logo: <BrandPlaceholder />, requirements: [{ label: 'A demo profile', iconName: 'user' }, { label: 'A sample document', iconName: 'file-text' }, { label: 'Time to complete the steps', iconName: 'clock' }, { label: 'Your confirmation', iconName: 'check-circle' }] }, parameters: { layout: 'fullscreen', docs: { description: { component: 'Named disclaimer recipe built on the shared ModalCommon surface. Prefer this over the generic ContentModal adapter for disclaimer-specific flows.' } } } } satisfies Meta<typeof DisclaimerModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<DisclaimerModal
  visible={visible}
  onClose={handleClose}
  onBack={handleBack}
  onContinue={handleContinue}
  title="Before you continue"
  subtitle="Prepare the following items for this demo."
  requirements={requirements}
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <DisclaimerModal {...args} visible={visible} onClose={onClose} onBack={onClose} onContinue={onClose} />}</CommonDialogExample>,
};
