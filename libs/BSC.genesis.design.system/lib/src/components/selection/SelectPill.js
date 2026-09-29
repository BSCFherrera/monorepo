"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectPill = SelectPill;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const tokens_1 = require("../../tokens");
const icons_1 = require("../icons");
const styles_1 = require("./styles");
function SelectPill({ options, value, onSelect, label, containerStyle }) {
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: containerStyle, children: [label && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.selectLabel, children: label }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles_1.styles.pillContainer, children: options.map((option) => {
                    const isSelected = option.value === value;
                    return ((0, jsx_runtime_1.jsxs)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: option.label, accessibilityState: { selected: isSelected }, onPress: () => onSelect(option.value), style: [styles_1.styles.pill, isSelected ? styles_1.styles.pillSelected : styles_1.styles.pillUnselected], children: [option.iconName &&
                                ((0, icons_1.renderFeatherIcon)({
                                    name: option.iconName,
                                    size: 16,
                                    color: isSelected ? '#FFFFFF' : tokens_1.tokens.colors.text,
                                }) ?? null), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                    styles_1.styles.pillLabel,
                                    isSelected ? styles_1.styles.pillLabelSelected : styles_1.styles.pillLabelUnselected,
                                ], children: option.label })] }, option.value));
                }) })] }));
}
