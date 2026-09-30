import type { Meta, StoryObj } from '@storybook/react';
import { ButtonPill } from '../src';
const meta = { title: 'Actions/ButtonPill', component: ButtonPill, args: { children: 'Continue', onPress: () => {} } } satisfies Meta<typeof ButtonPill>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const Disabled: StoryObj<typeof meta> = { args: { disabled: true } };
