import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';
import { ModalCommon } from '../src';
import { CommonDialogExample } from './CommonDialogExample';
const meta = { title: 'Modals/Compatibility/ModalCommon', component: ModalCommon, args: { visible: true, onClose: () => {} }, tags: ['compatibility', 'deprecated'], parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility wrapper kept for existing consumers. Prefer BottomSheetModal for new bottom-aligned surfaces; ModalCommon delegates to that shared surface and keeps the older onClose/closeOnBackdropPress prop names.' } } } } satisfies Meta<typeof ModalCommon>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  parameters: { docs: { source: { code: `<ModalCommon visible={visible} onClose={handleClose}>
  <Text>Content supplied by the host.</Text>
</ModalCommon>` } } },
  render: args => <CommonDialogExample>{(visible, onClose) => <ModalCommon {...args} visible={visible} onClose={onClose}><Text>Content supplied by the host, without a forced heading or close control.</Text></ModalCommon>}</CommonDialogExample>,
};
