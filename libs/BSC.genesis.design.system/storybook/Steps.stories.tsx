import type { Meta, StoryObj } from '@storybook/react';
import { Steps } from '../src';

const meta = {
  title: 'Verification/Steps',
  component: Steps,
  args: { totalSteps: 4, current: 1 },
} satisfies Meta<typeof Steps>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
export const FirstStep: StoryObj<typeof meta> = { args: { current: 0 } };
export const LastStep: StoryObj<typeof meta> = { args: { current: 3 } };
export const WithLabels: StoryObj<typeof meta> = { args: { labels: ['Details', 'Review', 'Confirm', 'Finish'], current: 2 } };
