"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Illustration = Illustration;
exports.resolveCommonDialogProps = resolveCommonDialogProps;
exports.Panel = Panel;
exports.Confirm = Confirm;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const icons_1 = require("../../icons");
const styles_1 = require("./styles");
function Illustration({ illustration, illustrationSource, size = 40, name = 'info', color = ui_native_1.BscColors.primary }) {
    return (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles_1.styles.illustration, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: { width: size, height: size, alignItems: 'center', justifyContent: 'center' }, children: illustration ?? (illustrationSource ? (0, jsx_runtime_1.jsx)(react_native_1.Image, { source: illustrationSource, style: { width: size, height: size }, resizeMode: "contain" }) : (0, icons_1.renderFeatherIcon)({ name, size, color })) }) });
}
function resolveCommonDialogProps(props) {
    return {
        ...props,
        message: props.message ?? props.description,
        illustration: props.illustration ?? props.icon,
        confirmLabel: props.confirmLabel ?? props.closeButtonLabel,
    };
}
function Panel({ children, warning = false }) {
    return (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles_1.styles.panel, warning && styles_1.styles.warning], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.body, children: children }) });
}
function Confirm({ props, pill = false }) {
    void pill;
    if (props.showConfirm === false)
        return null;
    const action = props.onConfirm ?? props.onClose;
    return (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: props.confirmLabel ?? 'Continue', onPress: action, loading: props.loading, style: { width: '100%' } });
}
