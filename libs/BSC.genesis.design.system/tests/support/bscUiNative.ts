/* eslint-disable @nx/enforce-module-boundaries -- Jest bridge intentionally imports narrow source modules to avoid loading the full native kit. */
import { createElement, forwardRef, useImperativeHandle, useState, type ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

export {
  BscPrimaryButton,
  BscSecondaryButton,
  BscTextButton,
  type BscButtonProps,
} from '../../../shared-ui-native/src/components/BscButton';
export {
  BscTextField,
  type BscTextFieldProps,
} from '../../../shared-ui-native/src/components/BscTextField';
export {
  BscOtpInput,
  type BscOtpInputProps,
} from '../../../shared-ui-native/src/components/BscOtpInput';

export interface BscSelectOption<T = unknown> {
  key: string;
  label: string;
  detail?: string;
  value: T;
}

export interface BscSelectProps<T = unknown> {
  title: string;
  placeholder: string;
  options: readonly BscSelectOption<T>[];
  selectedKey: string | null;
  onSelect: (option: BscSelectOption<T>) => void;
  enabled?: boolean;
  error?: string;
  testID?: string;
}

export function BscSelect<T = unknown>({
  placeholder,
  options,
  selectedKey,
  onSelect,
  enabled = true,
  error,
  testID,
}: BscSelectProps<T>): React.JSX.Element {
  const selected = options.find(option => option.key === selectedKey);

  return createElement(
    View,
    null,
    createElement(
      Pressable,
      {
        accessibilityRole: 'button',
        accessibilityLabel: selected?.label ?? placeholder,
        accessibilityState: { disabled: !enabled, expanded: false },
        disabled: !enabled,
        onPress: enabled && options[0] !== undefined ? () => onSelect(options[0]) : undefined,
        testID,
      },
      createElement(Text, null, selected?.label ?? placeholder),
    ),
    error === undefined ? null : createElement(Text, null, error),
  );
}
export {
  BscCheckbox,
  type BscCheckboxProps,
} from '../../../shared-ui-native/src/components/BscCheckbox';
export {
  BscErrorText,
  type BscErrorTextProps,
} from '../../../shared-ui-native/src/components/BscErrorText';
export {
  BscToggleSwitch,
  type BscToggleSwitchProps,
} from '../../../shared-ui-native/src/components/BscToggleSwitch';
export {
  BscMessageBubble,
  type BscMessageBubbleProps,
} from '../../../shared-ui-native/src/components/BscMessageBubble';
export {
  BscTypingIndicator,
  startTypingIndicatorAnimations,
  useReducedMotionEnabled,
  type BscTypingIndicatorProps,
} from '../../../shared-ui-native/src/components/BscTypingIndicator';
export {
  BscSteps,
  type BscStepsProps,
} from '../../../shared-ui-native/src/components/BscSteps';
export interface BscSheetHandle {
  open(): void;
  close(): void;
  toggle(nextVisible?: boolean): void;
  isOpen(): boolean;
}

export interface BscSheetProps {
  visible?: boolean;
  defaultVisible?: boolean;
  onOpenChange?: (visible: boolean) => void;
  onClose?: () => void;
  canDismiss?: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  footnote?: string;
  maxHeightFactor?: number;
  testID?: string;
}

export const BscSheet = forwardRef<BscSheetHandle, BscSheetProps>(function BscSheetMock({
  visible,
  defaultVisible = false,
  onOpenChange,
  onClose,
  canDismiss = true,
  title,
  children,
  footer,
  footnote,
  testID,
}, ref) {
  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const currentVisible = visible ?? internalVisible;
  const setSheetVisible = (nextVisible: boolean, notifyClose = false) => {
    if (visible === undefined) setInternalVisible(nextVisible);
    if (currentVisible !== nextVisible) onOpenChange?.(nextVisible);
    if (notifyClose && currentVisible) onClose?.();
  };
  const close = () => setSheetVisible(false, true);
  const dismiss = () => { if (canDismiss) close(); };

  useImperativeHandle(ref, () => ({
    open: () => setSheetVisible(true),
    close,
    toggle: nextVisible => setSheetVisible(nextVisible ?? !currentVisible, nextVisible === false || (nextVisible === undefined && currentVisible)),
    isOpen: () => currentVisible,
  }));

  return createElement(
    Modal,
    { visible: currentVisible, transparent: true, onRequestClose: dismiss },
    createElement(
      Pressable,
      { testID: 'modal-backdrop', onPress: dismiss },
      createElement(View, { testID },
        createElement(Text, null, title),
        children,
        footer,
        footnote === undefined ? null : createElement(Text, null, footnote),
      ),
    ),
  );
});
export { BscColors } from '../../../shared-ui-native/src/theme/colors';
export {
  BscRadius,
  BscSpacing,
  withAlpha,
} from '../../../shared-ui-native/src/theme/spacing';
export { BscTextStyles } from '../../../shared-ui-native/src/theme/typography';
export {
  BscLoaderProvider,
  BscLoadingOverlay,
  useBscLoader,
  type BscLoaderContextValue,
  type BscLoadingOverlayProps,
} from '../../../shared-ui-native/src/components/BscLoadingOverlay';
