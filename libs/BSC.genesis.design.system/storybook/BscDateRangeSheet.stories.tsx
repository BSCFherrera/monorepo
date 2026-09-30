import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { BscDateRangeSheet } from '../src/components/BscDateRangeSheet';
import { BscPrimaryButton } from '../src/components/BscButton';
import type { DateRange } from '@bsc/contracts';

const meta: Meta<typeof BscDateRangeSheet> = {
  title: 'Modals/Surfaces/BscDateRangeSheet',
  component: BscDateRangeSheet,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof BscDateRangeSheet>;

function Controlled(): React.JSX.Element {
  const [visible, setVisible] = useState(true);
  const [range, setRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  return (
    <>
      <BscPrimaryButton label="Elegir período" onPress={() => setVisible(true)} />
      <BscDateRangeSheet
        visible={visible}
        initialRange={range}
        onApply={nextRange => {
          setRange(nextRange);
          setVisible(false);
        }}
        onClose={() => setVisible(false)}
      />
    </>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};
