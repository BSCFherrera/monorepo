"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoCard = InfoCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const icons_1 = require("../icons");
const styles_1 = require("./styles");
function InfoCard({ title, subtitle, icon, iconName, iconBackgroundColor, children, testID, style, }) {
    const iconContent = icon ?? (iconName ? (0, icons_1.renderFeatherIcon)({ name: iconName, size: 24, color: ui_native_1.BscColors.primary }) : null);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { testID: testID, style: [styles_1.styles.infoCard, style], children: [iconContent && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles_1.styles.infoCardIconCircle, { backgroundColor: iconBackgroundColor ?? ui_native_1.BscColors.surface }], children: iconContent })), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles_1.styles.infoCardTextContainer, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.infoCardTitle, children: title }), subtitle && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.infoCardSubtitle, children: subtitle }), children] })] }));
}
