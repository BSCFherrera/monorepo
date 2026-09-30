"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpInput = OtpInput;
exports.OtpVerificationField = OtpVerificationField;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const commonButtons_1 = require("../commonButtons");
const forms_1 = require("../forms");
const selection_1 = require("../selection");
function codeLength(length = 6) { return Math.max(1, Math.min(12, Math.floor(length) || 6)); }
function OtpInput({ value = '', onChange, onChangeCode, onComplete, length, disabled = false, error, success, autoFocus, accessibilityLabel = 'Verification code', containerStyle }) {
    const count = codeLength(length);
    const [focused, setFocused] = (0, react_1.useState)(false);
    const code = value.replace(/\D/g, '').slice(0, count);
    const handleChange = onChange ?? onChangeCode ?? (() => { });
    return (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.row, containerStyle], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { pointerEvents: "none", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: styles.cells, children: Array.from({ length: count }, (_, index) => (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.cell, focused && index === Math.min(code.length, count - 1) && styles.focused, error && styles.error, disabled && styles.disabled, success && styles.success], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.digit, disabled && !success && { color: ui_native_1.BscColors.textTertiary }], children: code[index] ?? '' }) }, index)) }), (0, jsx_runtime_1.jsx)(react_native_1.TextInput, { accessibilityLabel: accessibilityLabel, accessibilityState: { disabled }, value: code, editable: !disabled, keyboardType: "number-pad", textContentType: "oneTimeCode", autoComplete: "one-time-code", autoFocus: autoFocus, caretHidden: true, selectionColor: "transparent", style: styles.input, onFocus: () => setFocused(true), onBlur: () => setFocused(false), onChangeText: text => {
                    if (disabled)
                        return;
                    const next = text.replace(/\D/g, '').slice(0, count);
                    if (next === code)
                        return;
                    handleChange(next);
                    if (next.length === count)
                        onComplete?.(next);
                } })] });
}
// `verifyLabel` is intentionally consumed for backward compatibility; verification now happens on OTP completion.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function OtpVerificationField({ otp, value, onChange, onChangeCode, onOtpChange, options = [], selectedValue, onSelect, codeSent = false, timer = { finished: true, label: '' }, verified = false, label = 'Verification code', otpLabel, onVerify, onOtpComplete, onSend, onResend, verifying, isSending, resendDisabled, sendLabel = 'Send code', sendButtonText, verifyLabel: _verifyLabel, resendLabel = 'Resend code', resendButtonText, sentText, error, otpError, errorText, onComplete, containerStyle, ...props }) {
    const effectiveValue = otp ?? value ?? '';
    const effectiveError = Boolean(error || otpError);
    const effectiveErrorText = errorText ?? (typeof otpError === 'string' ? otpError : undefined);
    const handleChange = onChange ?? onOtpChange ?? onChangeCode;
    const handleComplete = (code) => {
        onComplete?.(code);
        onOtpComplete?.(code);
        onVerify?.(code);
    };
    const locked = props.disabled || verifying || isSending || verified;
    return (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [{ gap: 8 }, containerStyle], children: [codeSent && sentText && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sent, children: sentText }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.selectRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: { flex: 1 }, children: (0, jsx_runtime_1.jsx)(selection_1.Select, { accessibilityLabel: "Destination", options: options, value: selectedValue, onChange: value => onSelect?.(value), disabled: locked || options.length <= 1 || (codeSent && !timer.finished) }) }), codeSent && !verified && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.timer, children: timer.label })] }), codeSent ? (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.label, children: otpLabel ?? label }), (0, jsx_runtime_1.jsx)(OtpInput, { ...props, value: effectiveValue, onChange: handleChange, error: effectiveError, success: verified, disabled: locked, onComplete: handleComplete }), effectiveError && effectiveErrorText && (0, jsx_runtime_1.jsx)(forms_1.ErrorText, { children: effectiveErrorText }), !verified && timer.finished && onResend && (0, jsx_runtime_1.jsx)(commonButtons_1.ButtonOutlinedFlat, { width: "100%", onPress: onResend, disabled: locked || resendDisabled, children: resendButtonText ?? resendLabel })] }) : (0, jsx_runtime_1.jsx)(commonButtons_1.ButtonOutlinedFlat, { width: "100%", onPress: onSend ?? (() => { }), disabled: locked || options.length === 0 || !onSend, children: sendButtonText ?? sendLabel })] });
}
const styles = react_native_1.StyleSheet.create({
    row: { position: 'relative' },
    cells: { flexDirection: 'row', justifyContent: 'space-between' },
    cell: { width: 44, height: 48, borderWidth: 1, borderColor: ui_native_1.BscColors.border, borderRadius: ui_native_1.BscRadius.sm, backgroundColor: ui_native_1.BscColors.surface, alignItems: 'center', justifyContent: 'center' },
    digit: { ...ui_native_1.BscTextStyles['Body L/18 Bold'], color: ui_native_1.BscColors.textPrimary },
    focused: { borderColor: ui_native_1.BscColors.primary, borderWidth: 2 },
    error: { borderColor: ui_native_1.BscColors.error },
    success: { borderColor: ui_native_1.BscColors.success, backgroundColor: ui_native_1.BscColors.surface },
    disabled: { backgroundColor: ui_native_1.BscColors.background },
    input: { ...react_native_1.StyleSheet.absoluteFill, color: 'transparent', backgroundColor: 'transparent', fontSize: 18, padding: 0 },
    sent: { ...ui_native_1.BscTextStyles['Caption/12 Bold'], color: ui_native_1.BscColors.secondary },
    selectRow: { flexDirection: 'row', alignItems: 'center', gap: ui_native_1.BscSpacing.xs },
    timer: { ...ui_native_1.BscTextStyles['Caption/12 Regular'], color: ui_native_1.BscColors.textSecondary },
    label: { ...ui_native_1.BscTextStyles['Caption/12 Regular'], color: ui_native_1.BscColors.textPrimary },
});
