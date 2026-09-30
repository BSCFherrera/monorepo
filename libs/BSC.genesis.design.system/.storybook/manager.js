import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

const theme = create({
  base: 'light',
  brandTitle: 'RN Basic Components',
  brandTarget: '_self',
  colorPrimary: '#2563EB',
  colorSecondary: '#0F766E',
  appBg: '#F8FAFC',
  appContentBg: '#FFFFFF',
  appPreviewBg: '#F3F4F6',
  appBorderColor: '#E2E8F0',
  appBorderRadius: 12,
  textColor: '#111827',
  textInverseColor: '#FFFFFF',
  barTextColor: '#475569',
  barSelectedColor: '#2563EB',
  barHoverColor: '#1D4ED8',
  barBg: '#FFFFFF',
  inputBg: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputTextColor: '#111827',
  inputBorderRadius: 8,
});

addons.setConfig({
  navSize: 320,
  bottomPanelHeight: 280,
  rightPanelWidth: 420,
  panelPosition: 'bottom',
  enableShortcuts: true,
  showToolbar: true,
  initialActive: 'sidebar',
  sidebar: {
    showRoots: true,
  },
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    fullscreen: { hidden: false },
    copy: { hidden: true },
    eject: { hidden: true },
  },
  theme,
});
