import type { PropsWithChildren } from 'react';

const DEFAULT_FRAME = { x: 0, y: 0, width: 390, height: 844 };
const DEFAULT_INSETS = { top: 0, right: 0, bottom: 0, left: 0 };

export function SafeAreaProvider({ children }: PropsWithChildren) {
  return children;
}

export function SafeAreaView({ children }: PropsWithChildren) {
  return children;
}

export function useSafeAreaInsets() {
  return DEFAULT_INSETS;
}

export function useSafeAreaFrame() {
  return DEFAULT_FRAME;
}
