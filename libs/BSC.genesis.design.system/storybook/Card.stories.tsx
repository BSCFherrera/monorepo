import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';
import { Card } from '../src';

const meta = {
  title: 'Cards/Card',
  component: Card,
  argTypes: { children: { control: false } },
  args: {
    children: <Text>A reusable card with native content.</Text>,
  },
} satisfies Meta<typeof Card>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
