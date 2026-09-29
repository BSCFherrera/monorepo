"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionCard = ActionCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const tokens_1 = require("../../tokens");
const icons_1 = require("../icons");
const styles_1 = require("./styles");
function ActionCard({ title, subtitle, icon, iconName, variant = 'standard', onPress, disabled = false, actionLabel, }) {
    const isRegistration = variant === 'registration';
    const iconColor = isRegistration ? tokens_1.tokens.colors.secondary : tokens_1.tokens.colors.primaryLight;
    const chevronColor = isRegistration ? tokens_1.tokens.colors.secondary : tokens_1.tokens.colors.primaryLight;
    const bg = isRegistration ? tokens_1.tokens.colors.registrationCard : tokens_1.tokens.colors.cardBg;
    const iconContent = icon ?? (iconName ? (0, icons_1.renderFeatherIcon)({ name: iconName, size: 24, color: iconColor }) : null);
    const chevron = (0, icons_1.renderFeatherIcon)({ name: 'chevron-right', size: 24, color: chevronColor });
    return ((0, jsx_runtime_1.jsxs)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: actionLabel ?? title, accessibilityState: { disabled }, disabled: disabled, onPress: disabled ? undefined : onPress, style: ({ pressed }) => [
            styles_1.styles.actionCard,
            { backgroundColor: bg },
            isRegistration ? styles_1.styles.actionCardRegistration : styles_1.styles.actionCardStandard,
            pressed && !disabled && { opacity: 0.85 },
            disabled && { opacity: 0.5 },
        ], children: [iconContent && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles_1.styles.actionCardIconCircle, children: iconContent })), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles_1.styles.actionCardTextContainer, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.actionCardTitle, children: title }), subtitle && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.actionCardSubtitle, children: subtitle })] }), chevron ?? (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { fontSize: 24, color: chevronColor }, children: "\u203A" })] }));
}
