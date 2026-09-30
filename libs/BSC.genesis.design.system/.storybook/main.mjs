/** @type {import('@storybook/react-vite').StorybookConfig} */
const path = require('path');

const clipboardPolyfillPath = path.resolve(__dirname, 'clipboardPolyfill.js');
const linearGradientMockPath = path.resolve(__dirname, 'linearGradientMock.tsx');
const codegenNativeComponentMockPath = path.resolve(__dirname, 'codegenNativeComponentMock.ts');
const safeAreaContextMockPath = path.resolve(__dirname, 'safeAreaContextMock.tsx');
const reactNativeWebPath = require.resolve('react-native-web');
const reactNativeSvgWebPath = require.resolve('react-native-svg/lib/commonjs/ReactNativeSVG.web.js');
const reactJsxInject = "import * as __React from 'react';";

const config = {
  framework: '@storybook/react-vite',
  stories: ['../storybook/*.stories.tsx'],
  addons: ['@storybook/addon-essentials'],
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(config, {
      resolve: {
        alias: [
          { find: /^react-native$/, replacement: reactNativeWebPath },
          { find: /^@react-native\/assets-registry\/registry$/, replacement: 'react-native-web/dist/modules/AssetRegistry/index.js' },
          { find: /^react-native\/Clipboard$/, replacement: clipboardPolyfillPath },
          { find: /^react-native-linear-gradient$/, replacement: linearGradientMockPath },
          { find: /^react-native-safe-area-context$/, replacement: safeAreaContextMockPath },
          { find: /^react-native\/Libraries\/Utilities\/codegenNativeComponent$/, replacement: codegenNativeComponentMockPath },
          { find: /^react-native-svg$/, replacement: reactNativeSvgWebPath },
        ],
        extensions: ['.web.mjs', '.mjs', '.web.js', '.js', '.web.ts', '.ts', '.web.tsx', '.tsx', '.json'],
      },
      esbuild: {
        jsxFactory: '__React.createElement',
        jsxFragment: '__React.Fragment',
        jsxInject: reactJsxInject,
      },
      optimizeDeps: {
        exclude: ['react-native-linear-gradient'],
      },
    });
  },
};

export default config;
