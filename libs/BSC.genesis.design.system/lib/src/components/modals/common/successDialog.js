"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const compatibility_1 = require("./compatibility");
const dialogParts_1 = require("./dialogParts");
const styles_1 = require("./styles");
exports.SuccessModal = (0, react_1.forwardRef)(function SuccessModal(rawProps, ref) {
    const props = (0, dialogParts_1.resolveCommonDialogProps)({ ...rawProps, onConfirm: rawProps.onConfirm ?? rawProps.onContinue });
    return (0, jsx_runtime_1.jsxs)(compatibility_1.ModalCommon, { visible: props.visible, defaultVisible: props.defaultVisible, onOpenChange: props.onOpenChange, onClose: props.onClose, bottomInset: props.bottomInset, closeOnBackdropPress: props.canDismiss, actions: props.actions, ref: ref, children: [(0, jsx_runtime_1.jsx)(dialogParts_1.Illustration, { ...props, name: props.iconName ?? 'check-circle', color: props.iconColor ?? ui_native_1.BscColors.secondary, size: props.iconSize }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles_1.styles.title, { marginBottom: 8 }], children: props.title }), props.message != null && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles_1.styles.body, styles_1.styles.bodySpacing], children: props.message }), props.children, (0, jsx_runtime_1.jsx)(dialogParts_1.Confirm, { props: props, pill: true })] });
});
