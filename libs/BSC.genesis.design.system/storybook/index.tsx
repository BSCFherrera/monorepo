import '@storybook/addon-ondevice-actions/register';
import React from 'react';
import { start } from '@storybook/react-native';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { storyEntries } from './catalog';
import { FeatherIconProvider } from './iconAdapter';
import type { Preview } from '@storybook/react';

const preview: Preview = {
  decorators: [(Story) => (
    <SafeAreaProvider>
      <FeatherIconProvider>
        <View style={{ flex: 1, padding: 16, backgroundColor: '#F5F7FA' }}>
          <Story />
        </View>
      </FeatherIconProvider>
    </SafeAreaProvider>
  )],
};

const view = start({ storyEntries, annotations: [preview] });

export default view.getStorybookUI({
  onDeviceUI: true,
  enableWebsockets: false,
  shouldPersistSelection: false,
  initialSelection: 'components-button--primary',
});
