import type { Meta, StoryObj } from '@storybook/react';
import { TermsAndConditionsModal } from '../src';
import { CommonDialogExample } from './CommonDialogExample';
const meta = { title: 'Modals/Dialog Recipes/Terms/TermsAndConditionsModal', component: TermsAndConditionsModal, args: { visible: true, onClose: () => {}, onAccept: () => {}, title: 'Demo participation information', content: 'This is synthetic display content, not legal advice or a service agreement. Review how the example arranges longer paragraphs before adding your own approved content.\n\nThe host application owns acceptance, persistence, and any decision to continue. This catalog does not send information to a service or store an acceptance record.' }, parameters: { layout: 'fullscreen', docs: { description: { component: 'Named terms recipe built on the shared ModalCommon surface. Prefer this over the generic ContentModal adapter for terms-specific flows.' } } } } satisfies Meta<typeof TermsAndConditionsModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<TermsAndConditionsModal
  visible={visible}
  onClose={handleClose}
  onAccept={handleAccept}
  title="Demo participation information"
  content={termsContent}
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <TermsAndConditionsModal {...args} visible={visible} onClose={onClose} onAccept={onClose} />}</CommonDialogExample>,
};
