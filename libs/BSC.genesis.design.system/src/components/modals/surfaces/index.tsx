import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { BscColors, BscRadius, BscSheet, BscSpacing, BscTextStyles, withAlpha, type BscSheetHandle } from '@bsc/ui-native';
import { useKeyboardOffset } from '../../../hooks/useKeyboardOffset';

export interface ModalHandle {
  open(): void;
  close(): void;
  toggle(nextVisible?: boolean): void;
  isOpen(): boolean;
}

export interface ModalControlProps {
  visible?: boolean;
  defaultVisible?: boolean;
  onOpenChange?: (visible: boolean) => void;
}

export interface CenteredModalProps extends ModalControlProps {
  contentStyle?: StyleProp<ViewStyle>;
  animationType?: 'none' | 'slide' | 'fade';
  onDismiss?: () => void;
  canDismiss?: boolean;
  children?: ReactNode;
  actions?: ReactNode;
  title?: string;
  bottomInset?: number;
}
export interface BottomSheetModalProps extends CenteredModalProps {
  footer?: ReactNode;
  footnote?: string;
  maxHeightFactor?: number;
  testID?: string;
}

function useModalVisibility({ visible, defaultVisible = false, onOpenChange, onDismiss }: Pick<CenteredModalProps, 'visible' | 'defaultVisible' | 'onOpenChange' | 'onDismiss'>) {
  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const isControlled = visible !== undefined;
  const currentVisible = isControlled ? visible : internalVisible;

  const setVisible = useCallback((nextVisible: boolean, notifyDismiss = false) => {
    if (!isControlled) setInternalVisible(nextVisible);
    if (currentVisible !== nextVisible) onOpenChange?.(nextVisible);
    if (notifyDismiss && currentVisible) onDismiss?.();
  }, [currentVisible, isControlled, onDismiss, onOpenChange]);

  return { visible: currentVisible, setVisible };
}

// Keep surfaces below recipes in the dependency graph: no circular dialog imports.
const ModalSurface = forwardRef<ModalHandle, CenteredModalProps & { centered: boolean }>(function ModalSurface({ centered, visible: controlledVisible, defaultVisible, onOpenChange, onDismiss, canDismiss = true, animationType, contentStyle, title, children, actions, bottomInset = 0 }, ref) {
  const { visible, setVisible } = useModalVisibility({ visible: controlledVisible, defaultVisible, onOpenChange, onDismiss });
  const keyboardOffset = useKeyboardOffset(visible);
  const close = useCallback(() => setVisible(false, true), [setVisible]);
  const dismiss = () => { if (canDismiss) close(); };

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
    close,
    toggle: nextVisible => setVisible(nextVisible ?? !visible, nextVisible === false || (nextVisible === undefined && visible)),
    isOpen: () => visible,
  }), [close, setVisible, visible]);

  return <Modal visible={visible} transparent animationType={animationType ?? (centered ? 'fade' : 'slide')} onRequestClose={dismiss} statusBarTranslucent>
    <Pressable testID="modal-backdrop" style={[styles.backdrop, centered ? styles.centeredBackdrop : styles.sheetBackdrop]} onPress={e => { e?.stopPropagation?.(); dismiss(); }}>
      <Animated.View style={[styles.keyboardAvoiding, centered && styles.centeredKeyboardAvoiding, { paddingBottom: keyboardOffset }]}>
        <Pressable style={[centered ? styles.centeredContent : styles.sheetContent, { paddingBottom: (centered ? 20 : 16) + bottomInset }, contentStyle]} onPress={e => e?.stopPropagation?.()}>
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
          {actions}
        </Pressable>
      </Animated.View>
    </Pressable>
  </Modal>;
});
export const CenteredModal = forwardRef<ModalHandle, CenteredModalProps>(function CenteredModal(props, ref) { return <ModalSurface {...props} centered ref={ref} />; });
export const BottomSheetModal = forwardRef<ModalHandle, BottomSheetModalProps>(function BottomSheetModal({ visible, defaultVisible, onOpenChange, onDismiss, canDismiss = true, title = '', children, actions, footer, footnote, maxHeightFactor, testID }, ref) {
  const sheetRef = useRef<BscSheetHandle>(null);

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.open(),
    close: () => sheetRef.current?.close(),
    toggle: nextVisible => sheetRef.current?.toggle(nextVisible),
    isOpen: () => sheetRef.current?.isOpen() ?? false,
  }), []);

  return <BscSheet
    ref={sheetRef}
    visible={visible}
    defaultVisible={defaultVisible}
    onOpenChange={onOpenChange}
    onClose={onDismiss}
    canDismiss={canDismiss}
    title={title}
    footnote={footnote}
    footer={footer}
    maxHeightFactor={maxHeightFactor}
    testID={testID}
  >
    {children}
    {actions}
  </BscSheet>;
});

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: withAlpha(BscColors.primaryDeep, 0.45) },
  centeredBackdrop: { justifyContent: 'center', alignItems: 'center', padding: BscSpacing.lg },
  sheetBackdrop: { justifyContent: 'flex-end' },
  keyboardAvoiding: { width: '100%' },
  centeredKeyboardAvoiding: { alignItems: 'center' },
  centeredContent: { backgroundColor: BscColors.surface, borderRadius: BscRadius.sheet, padding: BscSpacing.lg, maxWidth: '100%' },
  sheetContent: { backgroundColor: BscColors.surface, borderTopLeftRadius: BscRadius.sheet, borderTopRightRadius: BscRadius.sheet, paddingHorizontal: BscSpacing.lg, paddingTop: BscSpacing.sm, width: '100%' },
  title: { ...BscTextStyles['Body M/16 Bold'], color: BscColors.textPrimary },
});
