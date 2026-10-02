import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { BscNavigationHeader } from '../src/components/BscNavigationHeader';

const meta: Meta<typeof BscNavigationHeader> = {
  title: 'Navigation/BscNavigationHeader',
  component: BscNavigationHeader,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Contactos',
    onBack: fn(),
    showSupportButton: true,
    onSupportPress: fn(),
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof BscNavigationHeader>;

export const Default: Story = {};

export const WithoutSupport: Story = {
  args: { showSupportButton: false },
};

export const TitleOnly: Story = {
  args: {
    onBack: undefined,
    showSupportButton: false,
    onSupportPress: undefined,
    onClose: undefined,
  },
};
