"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientVerifiedModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const icons_1 = require("../../icons");
const compatibility_1 = require("./compatibility");
const dialogParts_1 = require("./dialogParts");
const styles_1 = require("./styles");
exports.ClientVerifiedModal = (0, react_1.forwardRef)(function ClientVerifiedModal({ logo, logoSource, details, secondaryLabel, onSecondary, backLabel = 'Back', ...props }, ref) {
    return (0, jsx_runtime_1.jsxs)(compatibility_1.ModalCommon, { visible: props.visible, defaultVisible: props.defaultVisible, onOpenChange: props.onOpenChange, onClose: props.onClose, bottomInset: props.bottomInset, closeOnBackdropPress: props.canDismiss, actions: props.actions, ref: ref, children: [(0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: backLabel, accessibilityState: { disabled: props.canDismiss === false }, disabled: props.canDismiss === false, onPress: props.canDismiss === false ? undefined : props.onClose, style: styles_1.styles.back, children: (0, icons_1.renderFeatherIcon)({ name: 'arrow-left', size: 24, color: ui_native_1.BscColors.textPrimary }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles_1.styles.logo, children: logo ?? (logoSource && (0, jsx_runtime_1.jsx)(react_native_1.Image, { source: logoSource, style: { width: 120, height: 60 }, resizeMode: "contain" })) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.clientTitle, children: props.title }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles_1.styles.body, { marginTop: 4, marginBottom: 24 }], children: props.message }), details.length > 0 && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles_1.styles.details, children: details.map((detail, index) => (0, jsx_runtime_1.jsxs)(react_native_1.View, { children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.detailLabel, children: detail.label }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.detailValue, children: detail.value })] }, index)) }), props.children, (0, jsx_runtime_1.jsx)(dialogParts_1.Confirm, { props: props, pill: true }), props.showSecondary !== false && (0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", onPress: onSecondary, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.secondary, children: secondaryLabel }) })] });
});
