import type { Meta, StoryObj } from '@storybook/react';
import { ButtonOutlinedFlat } from '../src';
const meta = { title: 'Actions/ButtonOutlinedFlat', component: ButtonOutlinedFlat, args: { children: 'Send code', onPress: () => {} } } satisfies Meta<typeof ButtonOutlinedFlat>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const Disabled: StoryObj<typeof meta> = { args: { disabled: true } };
