import type { Meta, StoryObj } from '@storybook/react';
import { BscSteps } from '@bsc/ui-native';

const meta = {
  title: 'Verification/BscSteps',
  component: BscSteps,
  args: { totalSteps: 4, current: 1 },
} satisfies Meta<typeof BscSteps>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
export const FirstStep: StoryObj<typeof meta> = { args: { current: 0 } };
export const LastStep: StoryObj<typeof meta> = { args: { current: 3 } };
export const WithLabels: StoryObj<typeof meta> = { args: { labels: ['Details', 'Review', 'Confirm', 'Finish'], current: 2 } };
