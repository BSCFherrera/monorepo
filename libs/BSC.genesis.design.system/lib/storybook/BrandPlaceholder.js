"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandPlaceholder = BrandPlaceholder;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
/** Neutral fixture, not a reproduction of the source brand artwork. */
function BrandPlaceholder({ compact = false }) {
    return (0, jsx_runtime_1.jsx)(react_native_1.View, { accessibilityLabel: "Brand placeholder", style: { width: compact ? 28 : 120, height: compact ? 28 : 60, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EBF0' }, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { color: '#666666', fontSize: compact ? 10 : 12 }, children: "Demo" }) });
}
