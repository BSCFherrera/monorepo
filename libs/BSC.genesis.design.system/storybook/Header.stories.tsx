import type { Meta, StoryObj } from '@storybook/react';
import { Header } from '../src';

const meta = {
  title: 'Navigation/Header',
  parameters: { layout: 'fullscreen' },
  component: Header,
  args: { title: 'Account Details', subtitle: 'View and manage' },
} satisfies Meta<typeof Header>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
export const WithBack: StoryObj<typeof meta> = { args: { onBack: () => {} } };
export const TitleOnly: StoryObj<typeof meta> = { args: { subtitle: undefined } };
