import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { BscPageHeader } from '../src/components/BscPageHeader';
import { BscPill } from '../src/components/BscRow';

const meta: Meta<typeof BscPageHeader> = {
  title: 'Navigation/BscPageHeader',
  component: BscPageHeader,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Beneficiarios',
    subtitle: 'Administra a quién le envías dinero',
    onBack: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof BscPageHeader>;

export const Default: Story = {};

export const WithBottomContent: Story = {
  args: {
    bottom: <BscPill label="3 activos" icon="check-circle" />,
  },
};
