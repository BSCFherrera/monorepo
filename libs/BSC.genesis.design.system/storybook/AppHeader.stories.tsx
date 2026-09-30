import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';
import { HeaderOnboarding as AppHeader } from '../src';
import { BrandPlaceholder } from './BrandPlaceholder';

const meta = {
  title: 'Navigation/AppHeader',
  parameters: { layout: 'fullscreen' },
  component: AppHeader,
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logo: <BrandPlaceholder />,
    showBackButton: true,
    onBackPress: () => {},
    showBottomLine: true,
  },
};

export const WithBackButton: Story = {
  args: {
    brand: <Text style={{ fontSize: 18, fontWeight: '700' }}>Logo</Text>,
    showBackButton: true,
    onBackPress: () => {},
    showBottomLine: false,
  },
};
