import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {ActivityIndicator, Modal, StyleSheet, View} from 'react-native';
import {COLORS} from '@constants/theme';

interface LoaderProps {
  visible: boolean;
}

type LoaderToken = symbol;

interface LoaderContextValue {
  visible: boolean;
  showLoader: () => LoaderToken;
  hideLoader: (token: LoaderToken) => void;
  withLoader: <T>(task: () => Promise<T>) => Promise<T>;
  setLoaderVisible: (id: LoaderToken, visible: boolean) => void;
}

interface LoaderProviderProps {
  children: React.ReactNode;
}

const LoaderContext = createContext<LoaderContextValue | null>(null);

const LoadingOverlay = () => {
  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={() => {}}
      statusBarTranslucent
      navigationBarTranslucent
      hardwareAccelerated>
      <View style={styles.modalOverlay} pointerEvents="auto">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    </Modal>
  );
};

export const LoaderProvider: React.FC<LoaderProviderProps> = ({children}) => {
  const [activeLoaders, setActiveLoaders] = useState<Set<LoaderToken>>(() => new Set());

  const hideLoader = useCallback((token: LoaderToken) => {
    setActiveLoaders(current => {
      if (!current.has(token)) {
        return current;
      }

      const next = new Set(current);
      next.delete(token);
      return next;
    });
  }, []);

  const showLoader = useCallback(() => {
    const token = Symbol('loader');

    setActiveLoaders(current => {
      const next = new Set(current);
      next.add(token);
      return next;
    });

    return token;
  }, []);

  const setLoaderVisible = useCallback((id: LoaderToken, visible: boolean) => {
    setActiveLoaders(current => {
      if (visible && current.has(id)) {
        return current;
      }

      if (!visible && !current.has(id)) {
        return current;
      }

      const next = new Set(current);

      if (visible) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  }, []);

  const withLoader = useCallback(
    async <T,>(task: () => Promise<T>): Promise<T> => {
      const token = showLoader();

      try {
        return await task();
      } finally {
        hideLoader(token);
      }
    },
    [hideLoader, showLoader],
  );

  const isVisible = activeLoaders.size > 0;
  const contextValue = useMemo(
    () => ({visible: isVisible, showLoader, hideLoader, withLoader, setLoaderVisible}),
    [hideLoader, isVisible, setLoaderVisible, showLoader, withLoader],
  );

  return (
    <LoaderContext.Provider value={contextValue}>
      <View style={styles.root}>
        {children}
        {isVisible ? <LoadingOverlay /> : null}
      </View>
    </LoaderContext.Provider>
  );
};

export const useLoader = (): LoaderContextValue => {
  const context = useContext(LoaderContext);

  if (!context) {
    throw new Error('useLoader must be used within LoaderProvider');
  }

  return context;
};

const useOptionalLoader = () => useContext(LoaderContext);

export const Loader: React.FC<LoaderProps> = ({visible}) => {
  const overlayContext = useOptionalLoader();
  const idRef = useRef(Symbol('loader'));

  useEffect(() => {
    if (!overlayContext) {
      return;
    }

    const id = idRef.current;
    overlayContext.setLoaderVisible(id, visible);

    return () => {
      overlayContext.setLoaderVisible(id, false);
    };
  }, [overlayContext, visible]);

  if (overlayContext) {
    return null;
  }

  if (!visible) {
    return null;
  }

  return <LoadingOverlay />;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
  },
});
