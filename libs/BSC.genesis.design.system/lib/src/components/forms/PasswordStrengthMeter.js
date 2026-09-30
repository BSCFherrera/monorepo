"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordStrengthMeter = PasswordStrengthMeter;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const styles_1 = require("./styles");
function PasswordStrengthMeter({ level, label }) {
    // THREE segments: level 1 = weak (1 bar), 2 = medium (2 bars), 3+ = strong (3 bars)
    const segments = level === 0 ? 0 : level <= 1 ? 1 : level <= 2 ? 2 : 3;
    const color = level === 0 ? ui_native_1.BscColors.border : level <= 1 ? ui_native_1.BscColors.error : level <= 2 ? ui_native_1.BscColors.warning : ui_native_1.BscColors.success;
    if (level === 0)
        return null;
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles_1.styles.meterContainer, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { accessibilityRole: "progressbar", accessibilityLabel: label, accessibilityValue: { min: 0, max: 3, now: segments }, style: styles_1.styles.meterRow, children: [0, 1, 2].map((i) => ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: [
                        styles_1.styles.meterSegment,
                        { backgroundColor: i < segments ? color : ui_native_1.BscColors.border },
                    ] }, i))) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles_1.styles.meterLabel, { color }], children: label })] }));
}
