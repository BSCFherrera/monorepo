import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BscSegmented, type BscSegmentedProps } from '@bsc/ui-native';

const meta = {
  title: 'Selection/BscSegmented',
  component: BscSegmented,
  args: {
    labels: ['DOP', 'USD'],
    selectedIndex: 0,
    onChange: () => {},
  },
} satisfies Meta<typeof BscSegmented>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledSegmented(props: BscSegmentedProps) {
  const [selectedIndex, setSelectedIndex] = useState(props.selectedIndex);
  return <BscSegmented {...props} selectedIndex={selectedIndex} onChange={setSelectedIndex} />;
}

export const Default: Story = { render: args => <ControlledSegmented {...args} /> };
export const ThreeOptions: Story = { render: args => <ControlledSegmented {...args} labels={['Day', 'Week', 'Month']} /> };
