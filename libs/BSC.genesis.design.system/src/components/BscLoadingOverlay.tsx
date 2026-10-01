import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscSpacing, withAlpha } from '../theme/spacing';
import { BscTextStyles } from '../theme/typography';

export interface BscLoadingOverlayProps {
  visible: boolean;
  label?: string;
  animated?: boolean;
  testID?: string;
}

export interface BscLoaderContextValue {
  visible: boolean;
  label?: string;
  showLoader: (label?: string) => void;
  hideLoader: () => void;
  withLoader: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
}

const BscLoaderContext = createContext<BscLoaderContextValue | null>(null);

export function BscLoadingOverlay({
  visible,
  label,
  animated = true,
  testID,
}: BscLoadingOverlayProps): React.JSX.Element | null {
  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => undefined}
    >
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={label ?? 'Loading'}
        accessibilityState={{ busy: true }}
        pointerEvents="auto"
        style={styles.overlay}
        testID={testID}
      >
        {animated ? <ActivityIndicator size="large" color={BscColors.primary} /> : null}
        {label === undefined ? null : <Text style={styles.label}>{label}</Text>}
      </View>
    </Modal>
  );
}

export function BscLoaderProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState<string | undefined>();

  const showLoader = useCallback((nextLabel?: string) => {
    setLabel(nextLabel);
    setVisible(true);
  }, []);

  const hideLoader = useCallback(() => {
    setVisible(false);
    setLabel(undefined);
  }, []);

  const withLoader = useCallback(
    async <T,>(task: () => Promise<T>, nextLabel?: string): Promise<T> => {
      showLoader(nextLabel);
      try {
        return await task();
      } finally {
        hideLoader();
      }
    },
    [hideLoader, showLoader],
  );

  const value = useMemo(
    () => ({ visible, label, showLoader, hideLoader, withLoader }),
    [hideLoader, label, showLoader, visible, withLoader],
  );

  return (
    <BscLoaderContext.Provider value={value}>
      {children}
      <BscLoadingOverlay visible={visible} label={label} />
    </BscLoaderContext.Provider>
  );
}

export function useBscLoader(): BscLoaderContextValue {
  const context = useContext(BscLoaderContext);
  if (context === null) {
    throw new Error('useBscLoader must be used within BscLoaderProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: withAlpha(BscColors.primaryDeep, 0.5),
    zIndex: 999,
    elevation: 999,
    gap: BscSpacing.sm,
  },
  label: {
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.textOnDark,
  },
});
