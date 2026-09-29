"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppHeader = AppHeader;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const tokens_1 = require("../../tokens");
const icons_1 = require("../icons");
const styles_1 = require("./styles");
function AppHeader({ brand, logo, showBackButton = false, onBackPress, showBottomLine = false, actions, avatar, }) {
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles_1.styles.appHeaderWrapper, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles_1.styles.appHeaderContent, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles_1.styles.appHeaderSide, children: showBackButton && onBackPress && ((0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: "Back", onPress: onBackPress, style: styles_1.styles.appHeaderBack, children: (0, icons_1.renderFeatherIcon)({ name: 'arrow-left', size: 24, color: tokens_1.tokens.colors.text }) ?? (0, jsx_runtime_1.jsx)(react_native_1.Text, { children: "\u2039" }) })) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles_1.styles.appHeaderCenter, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: { width: 120, height: 60 }, children: brand ?? logo }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles_1.styles.appHeaderSide, children: avatar ?? actions })] }), showBottomLine && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles_1.styles.appHeaderLine })] }));
}
