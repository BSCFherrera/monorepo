"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = Card;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
function Card({ children, style, ...props }) {
    return (0, jsx_runtime_1.jsx)(react_native_1.View, { ...props, style: [styles.card, style], children: children });
}
const styles = react_native_1.StyleSheet.create({
    card: {
        backgroundColor: ui_native_1.BscColors.surface,
        borderColor: ui_native_1.BscColors.border,
        borderWidth: 1,
        borderRadius: ui_native_1.BscRadius.xs,
        padding: ui_native_1.BscSpacing.md,
        gap: ui_native_1.BscSpacing.md,
    },
});
