"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = Card;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const tokens_1 = require("../../tokens");
function Card({ children, style, ...props }) {
    return (0, jsx_runtime_1.jsx)(react_native_1.View, { ...props, style: [styles.card, style], children: children });
}
const styles = react_native_1.StyleSheet.create({
    card: {
        backgroundColor: tokens_1.tokens.colors.surface,
        borderColor: tokens_1.tokens.colors.border,
        borderWidth: 1,
        borderRadius: tokens_1.tokens.radius,
        padding: tokens_1.tokens.spacing.md,
        gap: tokens_1.tokens.spacing.md,
    },
});
