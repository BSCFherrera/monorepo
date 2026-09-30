import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';
import { ModalCentered } from '../src';
import { CommonDialogExample } from './CommonDialogExample';
const meta = { title: 'Modals/Compatibility/ModalCentered', component: ModalCentered, args: { visible: true, onClose: () => {} }, tags: ['compatibility', 'deprecated'], parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility wrapper kept for existing consumers. Prefer CenteredModal for new centered surfaces; ModalCentered delegates to that shared surface and keeps the older onClose/closeOnBackdropPress prop names.' } } } } satisfies Meta<typeof ModalCentered>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<ModalCentered visible={visible} onClose={handleClose}>
  <Text>A compact, content-sized surface.</Text>
</ModalCentered>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <ModalCentered {...args} visible={visible} onClose={onClose}><Text>A compact, content-sized surface.</Text></ModalCentered>}</CommonDialogExample>,
};
