import type { Meta, StoryObj } from '@storybook/react';
import { ActionCard, RegisterPromptCard, TouchableCard } from '../src';

const meta = {
  title: 'Cards/ActionCard',
  component: ActionCard,
  args: { title: 'Explore details', subtitle: 'Tap to view more information' },
  parameters: { docs: { description: { component: 'Action card stories include the compatibility card wrappers as variants so the catalog is grouped by purpose.' } } },
} satisfies Meta<typeof ActionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = { args: { onPress: () => {} } };
export const Registration: Story = { args: { variant: 'registration', title: 'First time here?', subtitle: 'Create your account', iconName: 'user-plus', onPress: () => {} } };
export const Disabled: Story = { args: { disabled: true, onPress: () => {} } };
export const TouchableCardVariant: Story = {
  name: 'TouchableCard compatibility variant',
  args: { onPress: () => {} },
  parameters: {
    docs: {
      description: { story: 'Compatibility wrapper kept under ActionCard because it serves the same selectable-card purpose.' },
      source: {
        code: `<TouchableCard
  title="Review your preferences"
  subtitle="Choose the details you want to update."
  iconName="user"
  onPress={handlePress}
/>`,
      },
    },
  },
  render: () => <TouchableCard title="Review your preferences" subtitle="Choose the details you want to update." iconName="user" onPress={() => {}} />,
};
export const RegisterPromptCardVariant: Story = {
  name: 'RegisterPromptCard compatibility variant',
  args: { onPress: () => {} },
  parameters: {
    docs: {
      description: { story: 'Compatibility wrapper kept under ActionCard because it is a registration-flavored action card.' },
      source: {
        code: `<RegisterPromptCard
  title="First time here?"
  subtitle="Create a demo profile to continue."
  onPress={handleRegister}
/>`,
      },
    },
  },
  render: () => <RegisterPromptCard title="First time here?" subtitle="Create a demo profile to continue." onPress={() => {}} />,
};
