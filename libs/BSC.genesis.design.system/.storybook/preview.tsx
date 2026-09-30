import React from 'react';
import type { Preview } from '@storybook/react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeatherIconProvider } from '../storybook/iconAdapter';

const styles = StyleSheet.create({
  fullscreen: {
    width: '100%',
  },
  storySurface: {
    width: '100%',
    minHeight: 560,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
  },
  storyFrame: {
    width: '100%',
    maxWidth: 480,
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
});

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    backgrounds: {
      default: 'neutral',
      values: [
        { name: 'neutral', value: '#F3F4F6' },
        { name: 'white', value: '#FFFFFF' },
      ],
    },
  },
  decorators: [
    (Story, context) => {
      const isFullscreen = context.parameters.layout === 'fullscreen';

      return (
        <SafeAreaProvider>
          <FeatherIconProvider>
            {isFullscreen ? (
              <View style={styles.fullscreen}>
                <Story />
              </View>
            ) : (
              <View style={styles.storySurface}>
                <View style={styles.storyFrame}>
                  <Story />
                </View>
              </View>
            )}
          </FeatherIconProvider>
        </SafeAreaProvider>
      );
    },
  ],
};

export default preview;
