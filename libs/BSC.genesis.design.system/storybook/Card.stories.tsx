import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';
import { BscCard } from '@bsc/ui-native';

const meta = {
  title: 'Cards/BscCard',
  component: BscCard,
  argTypes: { children: { control: false } },
  args: {
    children: <Text>A reusable card with native content.</Text>,
  },
} satisfies Meta<typeof BscCard>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
