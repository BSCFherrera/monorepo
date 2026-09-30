import type { Meta, StoryObj } from '@storybook/react';
import { BankHeader as BrandHeader } from '../src';
import { BrandPlaceholder } from './BrandPlaceholder';

const meta = {
  title: 'Navigation/BrandHeader',
  parameters: { layout: 'fullscreen' },
  component: BrandHeader,
  args: {
    title: 'Assistant',
    showMenu: true,
    showProfile: true,
    showNotification: true,
    userInitials: 'JD',
    hasNotification: true,
  },
} satisfies Meta<typeof BrandHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    brand: <BrandPlaceholder compact />,
  },
};

export const NoNotifications: Story = {
  args: {
    brand: <BrandPlaceholder compact />,
    showNotification: false,
  },
};
