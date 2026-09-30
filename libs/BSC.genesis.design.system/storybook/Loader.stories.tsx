import type { Meta, StoryObj } from '@storybook/react';
import { BscLoaderProvider, useBscLoader } from '@bsc/ui-native';
import { Button, Text, View } from 'react-native';
import { Loader } from '../src';

function LoaderControlsExample() {
  const { hideLoader, showLoader, visible, withLoader } = useBscLoader();

  return (
    <View style={{ gap: 12 }}>
      <Text>
        Provider-controlled loading keeps one overlay at the app root while screens call a hook.
      </Text>
      <Text>Current state: {visible ? 'visible' : 'hidden'}</Text>
      <Button title="Show loader" onPress={() => showLoader('Loading')} />
      <Button title="Hide loader" onPress={hideLoader} />
      <Button
        title="Run async action"
        onPress={() => {
          withLoader(() => new Promise<void>(resolve => setTimeout(resolve, 1200)), 'Loading').catch(() => undefined);
        }}
      />
    </View>
  );
}

const meta = {
  title: 'Feedback/Loader',
  component: Loader,
  args: { visible: true },
  decorators: [(Story) => <View style={{ height: 280, width: '100%' }}><Story /></View>],
  parameters: {
    docs: {
      description: {
        component:
          'Compatibility loader. Existing screens may keep `<Loader visible={loading} />`; app-level integrations should prefer `BscLoaderProvider` at the root and `useBscLoader` from screens.',
      },
    },
  },
} satisfies Meta<typeof Loader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ProviderControlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Official provider-owned pattern: BscLoaderProvider owns the visible state, screens call useBscLoader actions, and the overlay is rendered once at the root.',
      },
      source: {
        code: `function ScreenAction() {
  const { withLoader } = useBscLoader();

  return (
    <Button
      title="Run async action"
      onPress={() => withLoader(() => save(), 'Loading')}
    />
  );
}

function AppRoot() {
  return <BscLoaderProvider><ScreenAction /></BscLoaderProvider>;
}`,
      },
    },
  },
  render: () => (
    <BscLoaderProvider>
      <View style={{ minHeight: 280, padding: 16, gap: 12 }}>
        <LoaderControlsExample />
      </View>
    </BscLoaderProvider>
  ),
};
