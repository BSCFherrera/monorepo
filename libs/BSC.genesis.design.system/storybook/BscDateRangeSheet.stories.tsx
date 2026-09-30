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

function ControlledWithBounds(): React.JSX.Element {
  const [visible, setVisible] = useState(true);
  const today = new Date();
  const [range, setRange] = useState<DateRange>({ from: today, to: today });
  const minDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);

  return (
    <>
      <BscPrimaryButton label="Elegir período (últimos 2 meses)" onPress={() => setVisible(true)} />
      <BscDateRangeSheet
        visible={visible}
        initialRange={range}
        minDate={minDate}
        maxDate={today}
        title="Consulta de estado de cuenta"
        onApply={nextRange => {
          setRange(nextRange);
          setVisible(false);
        }}
        onClose={() => setVisible(false)}
      />
    </>
  );
}

export const WithBounds: Story = {
  render: () => <ControlledWithBounds />,
};
