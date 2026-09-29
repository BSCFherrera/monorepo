import { type StyleProp, type ViewStyle } from 'react-native';
export interface OtpDestinationOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}
export interface OtpInputProps {
    value?: string;
    onChange?: (value: string) => void;
    onChangeCode?: (value: string) => void;
    onComplete?: (value: string) => void;
    length?: number;
    disabled?: boolean;
    error?: boolean;
    success?: boolean;
    autoFocus?: boolean;
    accessibilityLabel?: string;
    containerStyle?: StyleProp<ViewStyle>;
}
export interface OtpVerificationFieldProps extends OtpInputProps {
    otp?: string;
    options?: readonly OtpDestinationOption[];
    selectedValue?: string | number;
    onSelect?: (value: string | number) => void;
    codeSent?: boolean;
    timer?: {
        finished: boolean;
        label: string;
    };
    verified?: boolean;
    label?: string;
    otpLabel?: string;
    onOtpChange?: (value: string) => void;
    onVerify?: (value: string) => void;
    onOtpComplete?: (value: string) => void;
    onSend?: () => void;
    onResend?: () => void;
    verifying?: boolean;
    isSending?: boolean;
    resendDisabled?: boolean;
    sendLabel?: string;
    sendButtonText?: string;
    /** Retained for compatibility; completion now invokes onVerify directly. */
    verifyLabel?: string;
    resendLabel?: string;
    resendButtonText?: string;
    sentText?: string;
    errorText?: string;
    otpError?: boolean | string;
}
export declare function OtpVerificationField({ otp, value, onChange, onChangeCode, onOtpChange, options, selectedValue, onSelect, codeSent, timer, verified, label, otpLabel, onVerify, onOtpComplete, onSend, onResend, verifying, isSending, resendDisabled, sendLabel, sendButtonText, verifyLabel: _verifyLabel, resendLabel, resendButtonText, sentText, error, otpError, errorText, onComplete, containerStyle, ...props }: OtpVerificationFieldProps): import("react").JSX.Element;
