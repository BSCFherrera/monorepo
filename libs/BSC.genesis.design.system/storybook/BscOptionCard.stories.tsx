import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';

import { BscOptionCard } from '../src/components/BscOptionCard';

const meta: Meta<typeof BscOptionCard> = {
  title: 'Selection/BscOptionCard',
  component: BscOptionCard,
};

export default meta;
type Story = StoryObj<typeof BscOptionCard>;

function Controlled(): React.JSX.Element {
  const [selected, setSelected] = useState('min');
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <BscOptionCard title="Mínimo" selected={selected === 'min'} onPress={() => setSelected('min')} />
      <BscOptionCard title="Al corte" selected={selected === 'corte'} onPress={() => setSelected('corte')} />
      <BscOptionCard title="Otro" selected={selected === 'otro'} onPress={() => setSelected('otro')} />
    </View>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithSubtitle: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <BscOptionCard title="Mínimo" subtitle="RD$ 1,200.00" selected onPress={() => {}} />
      <BscOptionCard title="Al corte" subtitle="RD$ 8,450.00" selected={false} onPress={() => {}} />
    </View>
  ),
};
