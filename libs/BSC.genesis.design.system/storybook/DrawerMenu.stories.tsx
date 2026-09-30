import { useState } from 'react';
import { Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { BscPrimaryButton } from '@bsc/ui-native';
import { HamburgerMenu as DrawerMenu } from '../src';

const meta = {
  title: 'Navigation/DrawerMenu',
  component: DrawerMenu,
  args: { visible: false, onDismiss: () => {} },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DrawerMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function DrawerExample() {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState('main');
  return (
    <View style={{ gap: 16 }}>
      <BscPrimaryButton label="Open drawer" onPress={() => setVisible(true)} />
      <Text>Selected: {selected}</Text>
      <DrawerMenu
        visible={visible}
        onDismiss={() => setVisible(false)}
        selectedId={selected}
        items={[
          { id: 'main', label: 'Main assistant', onPress: () => { setSelected('main'); setVisible(false); } },
          { id: 'transactions', label: 'Transactions', onPress: () => { setSelected('transactions'); setVisible(false); } },
          { id: 'products', label: 'Products', onPress: () => { setSelected('products'); setVisible(false); } },
          { id: 'profile', label: 'Edit profile', onPress: () => { setSelected('profile'); setVisible(false); } },
          { id: 'disabled', label: 'Unavailable', disabled: true, onPress: () => {} },
        ]}
        history={[
          { id: 'h1', title: 'Transfer to contact', preview: 'Limit inquiry and validation', onPress: () => setVisible(false) },
          { id: 'h2', title: 'Card application', preview: 'Documents for credit card', onPress: () => setVisible(false) },
        ]}
        onNewConversation={() => setVisible(false)}
        onLogout={() => setVisible(false)}
      />
    </View>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [visible, setVisible] = useState(false);
const [selected, setSelected] = useState('main');

<>
  <BscPrimaryButton label="Open drawer" onPress={() => setVisible(true)} />
  <DrawerMenu
    visible={visible}
    onDismiss={() => setVisible(false)}
    selectedId={selected}
    items={[
      { id: 'main', label: 'Main assistant', onPress: () => setSelected('main') },
      { id: 'transactions', label: 'Transactions', onPress: () => setSelected('transactions') },
      { id: 'products', label: 'Products', onPress: () => setSelected('products') },
      { id: 'profile', label: 'Edit profile', onPress: () => setSelected('profile') },
    ]}
    history={[
      { id: 'h1', title: 'Transfer to contact', preview: 'Limit inquiry and validation', onPress: () => {} },
      { id: 'h2', title: 'Card application', preview: 'Documents for credit card', onPress: () => {} },
    ]}
    onNewConversation={() => setVisible(false)}
    onLogout={() => setVisible(false)}
  />
</>`,
      },
    },
  },
  render: () => <DrawerExample />,
};
