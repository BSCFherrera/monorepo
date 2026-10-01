import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  type ReactNode,
} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { overlay } from '../tokens';
import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';
import { BscTextStyles } from '../theme/typography';

import { BscIcon } from './BscIcon';
import type { ModalProps } from '@bsc/contracts';

export interface BscModalHandle {
  open(): void;
  close(): void;
  toggle(nextVisible?: boolean): void;
  isOpen(): boolean;
}

export interface BscModalProps extends ModalProps {
  children?: ReactNode;
  /** Explicit content slot for callers that prefer props over JSX children. */
  content?: ReactNode;
  /** Fixed actions or custom footer content. */
  footer?: ReactNode;
  /** Extra style for the modal surface, not the backdrop. */
  surfaceStyle?: ViewStyle;
  /** Extra style for the scroll/content container inside the surface. */
  contentStyle?: ViewStyle;
  /** Disable the internal ScrollView when embedding a complete screen. */
  scrollable?: boolean;
}

export const BscModal = forwardRef<BscModalHandle, BscModalProps>(function BscModalComponent({
  visible,
  defaultVisible = false,
  title,
  onClose,
  onOpenChange,
  canDismiss = true,
  showCloseButton = true,
  presentation = 'dialog',
  children,
  content,
  footer,
  surfaceStyle,
  contentStyle,
  scrollable = presentation === 'dialog',
  testID,
}: BscModalProps, ref): React.JSX.Element {
  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const isControlled = visible !== undefined;
  const currentVisible = isControlled ? visible : internalVisible;
  const insets = useSafeAreaInsets();
  const body = content ?? children;

  const setModalVisible = useCallback(
    (nextVisible: boolean, notifyClose = false) => {
      if (!isControlled) setInternalVisible(nextVisible);
      if (currentVisible !== nextVisible) onOpenChange?.(nextVisible);
      if (notifyClose && currentVisible) onClose?.();
    },
    [currentVisible, isControlled, onClose, onOpenChange],
  );

  const close = useCallback(() => {
    setModalVisible(false, true);
  }, [setModalVisible]);

  const dismiss = useCallback(() => {
    if (canDismiss) close();
  }, [canDismiss, close]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setModalVisible(true),
      close,
      toggle: nextVisible =>
        setModalVisible(
          nextVisible ?? !currentVisible,
          nextVisible === false || (nextVisible === undefined && currentVisible),
        ),
      isOpen: () => currentVisible,
    }),
    [close, currentVisible, setModalVisible],
  );

  const isFullScreen = presentation === 'fullScreen';
  const contentNode = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, isFullScreen && styles.fullScreenContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {body}
    </ScrollView>
  ) : (
    <View style={[styles.content, isFullScreen && styles.fullScreenContent, styles.staticContent, contentStyle]}>{body}</View>
  );

  return (
    <Modal
      visible={currentVisible}
      transparent={!isFullScreen}
      animationType={isFullScreen ? 'slide' : 'fade'}
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <View style={[styles.backdrop, isFullScreen && styles.fullScreenBackdrop]}>
        {!isFullScreen ? (
          <Pressable
            testID={testID === undefined ? undefined : `${testID}-backdrop`}
            style={styles.backdropPressable}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            onPress={dismiss}
          />
        ) : null}

        <View
          testID={testID}
          style={[
            styles.surface,
            isFullScreen ? [styles.fullScreenSurface, { paddingTop: insets.top, paddingBottom: insets.bottom }] : styles.dialogSurface,
            surfaceStyle,
          ]}
        >
          {(title !== undefined && title.length > 0) || showCloseButton ? (
            <View style={[styles.header, isFullScreen && styles.fullScreenHeader]}>
              {showCloseButton ? <View style={styles.headerSide} /> : null}
              {title !== undefined && title.length > 0 ? (
                <Text style={styles.title} numberOfLines={2}>
                  {title}
                </Text>
              ) : (
                <View style={styles.titlePlaceholder} />
              )}
              {showCloseButton ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                  onPress={dismiss}
                  hitSlop={10}
                  testID={testID === undefined ? undefined : `${testID}-close`}
                  style={styles.closeButton}
                >
                  <BscIcon name="close" size={24} color={BscColors.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {contentNode}

          {footer !== undefined ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: BscSpacing.lg,
    backgroundColor: overlay.scrim,
  },
  fullScreenBackdrop: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    backgroundColor: BscColors.surface,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  surface: {
    overflow: 'hidden',
    backgroundColor: BscColors.surface,
  },
  dialogSurface: {
    maxHeight: '86%',
    borderRadius: BscRadius.sheet,
  },
  fullScreenSurface: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.sm,
    paddingTop: BscSpacing.lg,
    paddingHorizontal: BscSpacing.lg,
    paddingBottom: BscSpacing.sm,
  },
  headerSide: {
    width: 44,
    minHeight: 44,
  },
  fullScreenHeader: {
    borderBottomWidth: 1,
    borderBottomColor: BscColors.divider,
  },
  title: {
    ...BscTextStyles['Subtitle/20 SemiBold'],
    flex: 1,
    color: BscColors.textPrimary,
    textAlign: 'center',
  },
  titlePlaceholder: {
    flex: 1,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: BscSpacing.lg,
    paddingBottom: BscSpacing.lg,
  },
  fullScreenContent: {
    flexGrow: 1,
  },
  staticContent: {
    flex: 1,
  },
  footer: {
    gap: BscSpacing.sm,
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.sm,
    paddingBottom: BscSpacing.lg,
  },
});
