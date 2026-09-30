import type { Meta, StoryObj } from '@storybook/react';
import { ErrorText } from '../src';

const meta = {
  title: 'Forms/ErrorText',
  component: ErrorText,
  args: { children: 'This field is required.' },
} satisfies Meta<typeof ErrorText>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
export const Empty: StoryObj<typeof meta> = { args: { children: undefined } };
