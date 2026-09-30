import type { Meta, StoryObj } from '@storybook/react';
import { ClientVerifiedModal } from '../src';
import { CommonDialogExample, dialogArgs } from './CommonDialogExample';
import { BrandPlaceholder } from './BrandPlaceholder';
const meta = { title: 'Modals/Dialog Recipes/Client Verification/ClientVerifiedModal', component: ClientVerifiedModal, args: { ...dialogArgs, title: 'Confirm your information', message: 'Please confirm that the following demo profile belongs to you.', details: [{ label: 'Display name', value: 'Example Participant' }], secondaryLabel: 'This is not me', onSecondary: () => {}, logo: <BrandPlaceholder /> }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof ClientVerifiedModal>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<ClientVerifiedModal
  visible={visible}
  onClose={handleClose}
  onSecondary={handleReject}
  title="Confirm your information"
  message="Please confirm that the following demo profile belongs to you."
  details={[{ label: 'Display name', value: 'Example Participant' }]}
  secondaryLabel="This is not me"
  logo={<BrandLogo />}
/>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <ClientVerifiedModal {...args} visible={visible} onClose={onClose} onSecondary={onClose} />}</CommonDialogExample>,
};
