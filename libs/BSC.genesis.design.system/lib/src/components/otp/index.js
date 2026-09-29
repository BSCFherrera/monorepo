"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpVerificationField = OtpVerificationField;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const tokens_1 = require("../../tokens");
const forms_1 = require("../forms");
function OtpVerificationField({ otp, value, onChange, onChangeCode, onOtpChange, options = [], selectedValue, onSelect, codeSent = false, timer = { finished: true, label: '' }, verified = false, label = 'Verification code', otpLabel, onVerify, onOtpComplete, onSend, onResend, verifying, isSending, resendDisabled, sendLabel = 'Send code', sendButtonText, verifyLabel: _verifyLabel, resendLabel = 'Resend code', resendButtonText, sentText, error, otpError, errorText, onComplete, containerStyle, ...props }) {
    void _verifyLabel;
    const effectiveValue = otp ?? value ?? '';
    const effectiveError = Boolean(error || otpError);
    const effectiveErrorText = errorText ?? (typeof otpError === 'string' ? otpError : undefined);
    const handleChange = onChange ?? onOtpChange ?? onChangeCode;
    const selectOptions = options.map(option => ({
        key: String(option.value),
        label: option.label,
        value: option.value,
    }));
    const selectedKey = selectedValue === undefined ? null : String(selectedValue);
    const handleComplete = (code) => {
        onComplete?.(code);
        onOtpComplete?.(code);
        onVerify?.(code);
    };
    const locked = props.disabled || verifying || isSending || verified;
    return (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [{ gap: 8 }, containerStyle], children: [codeSent && sentText && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sent, children: sentText }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.selectRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: { flex: 1 }, children: (0, jsx_runtime_1.jsx)(ui_native_1.BscSelect, { title: "Destination", placeholder: "Destination", options: selectOptions, selectedKey: selectedKey, onSelect: option => onSelect?.(option.value), enabled: !(locked || options.length <= 1 || (codeSent && !timer.finished)) }) }), codeSent && !verified && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.timer, children: timer.label })] }), codeSent ? (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.label, children: otpLabel ?? label }), (0, jsx_runtime_1.jsx)(ui_native_1.BscOtpInput, { length: props.length, value: effectiveValue, onChangeText: handleChange ?? (() => { }), hasError: effectiveError, enabled: !locked, onCompleted: handleComplete }), effectiveError && effectiveErrorText && (0, jsx_runtime_1.jsx)(forms_1.ErrorText, { children: effectiveErrorText }), !verified && timer.finished && onResend && (0, jsx_runtime_1.jsx)(ui_native_1.BscSecondaryButton, { label: resendButtonText ?? resendLabel, onPress: onResend, disabled: locked || resendDisabled, style: { width: '100%' } })] }) : (0, jsx_runtime_1.jsx)(ui_native_1.BscSecondaryButton, { label: sendButtonText ?? sendLabel, onPress: onSend, disabled: locked || options.length === 0 || !onSend, style: { width: '100%' } })] });
}
const styles = react_native_1.StyleSheet.create({
    sent: { color: tokens_1.tokens.colors.secondary, fontSize: 12, fontWeight: '700' },
    selectRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    timer: { fontSize: 12, color: tokens_1.tokens.colors.textSecondary },
    label: { fontSize: 12, color: tokens_1.tokens.colors.text },
});
