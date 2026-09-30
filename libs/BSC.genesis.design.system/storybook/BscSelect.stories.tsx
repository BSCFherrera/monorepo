import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BscSelect, type BscSelectOption, type BscSelectProps } from '@bsc/ui-native';

const options: BscSelectOption<unknown>[] = [
  { key: 'never', label: 'Never', value: 'never' },
  { key: 'weekly', label: 'Weekly', detail: 'Every week', value: 'weekly' },
  { key: 'monthly', label: 'Monthly', detail: 'Once a month', value: 'monthly' },
];

const meta = {
  title: 'Selection/BscSelect',
  component: BscSelect,
  args: {
    title: 'Frequency',
    placeholder: 'Choose an option',
    options,
    selectedKey: null,
    onSelect: () => {},
  },
} satisfies Meta<typeof BscSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledSelect(props: BscSelectProps<unknown>) {
  const [selectedKey, setSelectedKey] = useState<string | null>(props.selectedKey);
  return <BscSelect {...props} selectedKey={selectedKey} onSelect={option => setSelectedKey(option.key)} />;
}

export const Default: Story = { render: args => <ControlledSelect {...args} /> };
export const Selected: Story = { render: args => <ControlledSelect {...args} selectedKey="weekly" /> };
export const WithError: Story = { render: args => <ControlledSelect {...args} error="Select a frequency." /> };
export const Disabled: Story = { args: { enabled: false } };
