import React from 'react';
import { BscLoadingOverlay } from '@bsc/ui-native';
import type { LoadingOverlayProps } from './types';

export function LoadingOverlay({ visible, label, animated = true }: LoadingOverlayProps) {
  return <BscLoadingOverlay visible={visible} label={label} animated={animated} />;
}
