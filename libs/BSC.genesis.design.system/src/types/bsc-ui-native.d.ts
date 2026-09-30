declare module '@bsc/ui-native' {
  import type { ReactNode } from 'react';
  import type { StyleProp, ViewStyle } from 'react-native';

  export const BscColors: {
    primary: string;
    primaryDeep: string;
    primaryLight: string;
    secondary: string;
    secondarySoft: string;
    success: string;
    error: string;
    warning: string;
    warningSoft: string;
    background: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textOnDark: string;
  };

  export const BscRadius: {
    xs: number;
    sm: number;
    md: number;
    sheet: number;
    pill: number;
  };

  export const BscSpacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };

  export const BscTextStyles: Record<string, object>;

  export function withAlpha(color: string, opacity: number): string;

  export interface BscButtonProps {
    label: string;
    onPress?: (() => void) | undefined;
    color?: string;
    loading?: boolean;
    disabled?: boolean;
    height?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    leading?: ReactNode;
    trailing?: ReactNode;
    style?: ViewStyle;
    testID?: string;
  }

  export function BscPrimaryButton(props: BscButtonProps): React.JSX.Element;
  export function BscSecondaryButton(props: BscButtonProps): React.JSX.Element;
  export function BscTextButton(props: BscButtonProps): React.JSX.Element;

  export interface BscTextFieldProps {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
    error?: string;
    secure?: boolean;
    keyboardType?: 'default' | 'number-pad' | 'email-address' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    editable?: boolean;
    maxLength?: number;
    onSubmitEditing?: () => void;
    style?: ViewStyle;
    testID?: string;
  }

  export function BscTextField(props: BscTextFieldProps): React.JSX.Element;

  export interface BscSelectOption<T> {
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

  export function BscSelect<T = unknown>(props: BscSelectProps<T>): React.JSX.Element;

  export interface BscSegmentedProps {
    labels: readonly string[];
    selectedIndex: number;
    onChange: (index: number) => void;
    background?: string;
    selectedColor?: string;
    selectedTextColor?: string;
    textColor?: string;
    testID?: string;
  }

  export function BscSegmented(props: BscSegmentedProps): React.JSX.Element;

  export interface BscMeterBarProps {
    label: string;
    value: number;
    valueLabel: string;
    color?: string;
    testID?: string;
  }

  export function BscMeterBar(props: BscMeterBarProps): React.JSX.Element;

  export interface BscScreenHeaderProps {
    title: string;
    onBack?: () => void;
    children?: ReactNode;
    testID?: string;
  }

  export function BscScreenHeader(props: BscScreenHeaderProps): React.JSX.Element;

  export interface BscPageHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    trailing?: ReactNode;
    bottom?: ReactNode;
    testID?: string;
  }

  export function BscPageHeader(props: BscPageHeaderProps): React.JSX.Element;

  export interface BscPillProps {
    label: string;
    color?: string;
    background?: string;
    icon?: string;
    style?: ViewStyle;
  }

  export function BscPill(props: BscPillProps): React.JSX.Element;

  export interface BscOtpInputProps {
    length?: number;
    value: string;
    onChangeText: (value: string) => void;
    onCompleted?: (value: string) => void;
    hasError?: boolean;
    errorMessage?: string;
    enabled?: boolean;
    autoFocus?: boolean;
    clearOn?: number;
    testID?: string;
  }

  export function BscOtpInput(props: BscOtpInputProps): React.JSX.Element;

  export interface BscOtpVerificationOption {
    label: string;
    value: string | number;
    detail?: string;
    disabled?: boolean;
  }

  export interface BscOtpVerificationFieldProps {
    value?: string;
    otp?: string;
    onChange?: (value: string) => void;
    onChangeCode?: (value: string) => void;
    onChangeText?: (value: string) => void;
    onOtpChange?: (value: string) => void;
    onCompleted?: (value: string) => void;
    onComplete?: (value: string) => void;
    onOtpComplete?: (value: string) => void;
    onVerify?: (value: string) => void;
    onSend?: () => void;
    onResend?: () => void;
    length?: number;
    autoFocus?: boolean;
    clearOn?: number;
    options?: readonly BscOtpVerificationOption[];
    selectedValue?: string | number | null;
    onSelect?: (value: string | number) => void;
    selectTitle?: string;
    selectPlaceholder?: string;
    codeSent?: boolean;
    timer?: { finished: boolean; label: string };
    verified?: boolean;
    label?: string;
    otpLabel?: string;
    sentText?: string;
    error?: boolean;
    hasError?: boolean;
    errorText?: string;
    errorMessage?: string;
    otpError?: boolean | string;
    disabled?: boolean;
    enabled?: boolean;
    verifying?: boolean;
    isSending?: boolean;
    resendDisabled?: boolean;
    sendLabel?: string;
    sendButtonText?: string;
    verifyLabel?: string;
    resendLabel?: string;
    resendButtonText?: string;
    containerStyle?: StyleProp<ViewStyle>;
    testID?: string;
  }

  export function BscOtpVerificationField(props: BscOtpVerificationFieldProps): React.JSX.Element;

  export interface BscErrorTextProps {
    children?: ReactNode;
    text?: ReactNode;
    color?: string;
    iconName?: 'error' | 'info' | 'warning' | 'check-circle';
    containerStyle?: StyleProp<ViewStyle>;
    testID?: string;
  }

  export function BscErrorText(props: BscErrorTextProps): React.JSX.Element | null;

  export interface BscCheckboxProps {
    label?: string | undefined;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
    testID?: string;
  }

  export function BscCheckbox(props: BscCheckboxProps): React.JSX.Element;

  export interface BscToggleSwitchProps {
    label?: string | undefined;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    testID?: string;
  }

  export function BscToggleSwitch(props: BscToggleSwitchProps): React.JSX.Element;

  export interface BscMessageBubbleProps {
    children?: ReactNode;
    direction?: 'incoming' | 'outgoing';
    timestampLabel?: string;
    message?: {
      sender?: string;
      content?: ReactNode;
      timestamp?: string | number | Date;
    };
    testID?: string;
  }

  export function BscMessageBubble(props: BscMessageBubbleProps): React.JSX.Element;

  export interface BscTypingIndicatorProps {
    label?: string;
    animated?: boolean;
    testID?: string;
  }

  export function BscTypingIndicator(props: BscTypingIndicatorProps): React.JSX.Element;
  export function useReducedMotionEnabled(): boolean;
  export function startTypingIndicatorAnimations(...args: unknown[]): () => void;

  export interface BscStepsProps {
    labels?: readonly string[];
    current: number;
    totalSteps?: number;
    testID?: string;
  }

  export function BscSteps(props: BscStepsProps): React.JSX.Element;

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

  export const BscSheet: React.ForwardRefExoticComponent<
    BscSheetProps & React.RefAttributes<BscSheetHandle>
  >;

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

  export function BscLoadingOverlay(props: BscLoadingOverlayProps): React.JSX.Element | null;
  export function BscLoaderProvider(props: { children: ReactNode }): React.JSX.Element;
  export function useBscLoader(): BscLoaderContextValue;
}
