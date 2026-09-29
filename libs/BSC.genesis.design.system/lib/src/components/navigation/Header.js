"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = Header;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const icons_1 = require("../icons");
const styles_1 = require("./styles");
function Header({ title, subtitle, leftComponent, rightComponent, onBack, backLabel = 'Back', actions, topInset = 0, }) {
    const left = leftComponent ?? (onBack ? ((0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: backLabel, onPress: onBack, style: styles_1.styles.headerBack, children: (0, icons_1.renderFeatherIcon)({ name: 'arrow-left', size: 24, color: '#FFFFFF' }) ?? (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.headerBackText, children: "\u2039" }) })) : null);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles_1.styles.headerContainer, { paddingTop: topInset, height: 60 + topInset }], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles_1.styles.headerSide, children: left }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles_1.styles.headerCenter, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.headerTitle, children: title }), subtitle && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.headerSubtitle, children: subtitle })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles_1.styles.headerSide, styles_1.styles.headerRightSide], children: rightComponent ?? actions })] }));
}
