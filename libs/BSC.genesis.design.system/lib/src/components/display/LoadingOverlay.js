"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingOverlay = LoadingOverlay;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const tokens_1 = require("../../tokens");
const styles_1 = require("./styles");
function LoadingOverlay({ visible, label, animated = true }) {
    if (!visible)
        return null;
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { accessibilityRole: "progressbar", accessibilityLabel: label ?? 'Loading', accessibilityState: { busy: true }, style: styles_1.styles.loadingOverlay, pointerEvents: "auto", children: [animated && (0, jsx_runtime_1.jsx)(react_native_1.ActivityIndicator, { size: "large", color: tokens_1.tokens.colors.primary }), label && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.loadingLabel, children: label })] }));
}
