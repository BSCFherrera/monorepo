import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { BscPrimaryButton, BscSecondaryButton, BscTextButton } from '@bsc/ui-native';

const meta = {
  title: 'Actions/BscButton',
  component: BscPrimaryButton,
  args: {
    label: 'Save',
    onPress: () => action('BSC button pressed')(),
  },
} satisfies Meta<typeof BscPrimaryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = {
  render: args => <BscSecondaryButton {...args} />,
};
export const Text: Story = {
  render: args => <BscTextButton {...args} />,
  args: { label: 'Text action' },
};
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };
