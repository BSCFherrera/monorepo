import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';

import { BscGradientBackdrop, BscGradientSurface } from '../src/components/BscGradientBackdrop';
import { BscColors } from '../src/theme/colors';

const meta: Meta<typeof BscGradientBackdrop> = {
  title: 'Actions/BscGradientBackdrop',
  component: BscGradientBackdrop,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof BscGradientBackdrop>;

export const Fullscreen: Story = {
  render: () => (
    <BscGradientBackdrop style={{ height: 300, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: BscColors.textOnDark }}>Fondo de marca</Text>
    </BscGradientBackdrop>
  ),
};

export const Surface: Story = {
  render: () => (
    <BscGradientSurface style={{ height: 160, padding: 20, borderRadius: 24 }}>
      <Text style={{ color: BscColors.textOnDark }}>Superficie de cabecera</Text>
    </BscGradientSurface>
  ),
};
