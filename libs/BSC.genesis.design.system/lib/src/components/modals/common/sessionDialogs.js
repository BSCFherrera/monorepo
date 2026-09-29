"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarningSessionModal = exports.SessionExpiredModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const icons_1 = require("../../icons");
const tokens_1 = require("../../../tokens");
const compatibility_1 = require("./compatibility");
const dialogParts_1 = require("./dialogParts");
const styles_1 = require("./styles");
const SessionDialog = (0, react_1.forwardRef)(function SessionDialog({ warning = false, secondaryLabel, onSecondary, ...rawProps }, ref) {
    const props = (0, dialogParts_1.resolveCommonDialogProps)(rawProps);
    return (0, jsx_runtime_1.jsxs)(compatibility_1.ModalCommon, { visible: props.visible, defaultVisible: props.defaultVisible, onOpenChange: props.onOpenChange, onClose: props.onClose, closeOnBackdropPress: false, bottomInset: props.bottomInset, actions: props.actions, ref: ref, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles_1.styles.illustration, styles_1.styles.sessionCircle], children: props.illustration ?? (0, icons_1.renderFeatherIcon)({ name: props.iconName ?? (warning ? 'alert-triangle' : 'clock'), size: props.iconSize ?? 32, color: props.iconColor ?? tokens_1.tokens.colors.accent }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles_1.styles.title, styles_1.styles.insetTitle], children: props.title }), props.message != null && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles_1.styles.body, styles_1.styles.bodySpacing], children: props.message }), props.children, (0, jsx_runtime_1.jsx)(dialogParts_1.Confirm, { props: props, pill: true }), warning && props.showSecondary !== false && (0, jsx_runtime_1.jsx)(ui_native_1.BscSecondaryButton, { label: secondaryLabel ?? 'End session', onPress: onSecondary ?? props.onClose, style: { ...styles_1.styles.cancel, width: '100%' } })] });
});
exports.SessionExpiredModal = (0, react_1.forwardRef)(function SessionExpiredModal(props, ref) { return (0, jsx_runtime_1.jsx)(SessionDialog, { ...props, ref: ref }); });
exports.WarningSessionModal = (0, react_1.forwardRef)(function WarningSessionModal(props, ref) { return (0, jsx_runtime_1.jsx)(SessionDialog, { ...props, warning: true, ref: ref }); });
