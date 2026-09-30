"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoScreen = DemoScreen;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const src_1 = require("../src");
function DemoScreen() {
    const [count, setCount] = (0, react_1.useState)(0);
    return ((0, jsx_runtime_1.jsx)(react_native_1.SafeAreaView, { style: styles.screen, children: (0, jsx_runtime_1.jsxs)(react_native_1.ScrollView, { contentContainerStyle: styles.content, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.heading, children: "Basic components" }), (0, jsx_runtime_1.jsxs)(src_1.Card, { children: [(0, jsx_runtime_1.jsxs)(react_native_1.Text, { testID: "demo-count", style: styles.text, children: ["Count: ", count] }), (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Increment", onPress: () => setCount(value => value + 1) }), (0, jsx_runtime_1.jsx)(ui_native_1.BscSecondaryButton, { label: "Reset", onPress: () => setCount(0) }), (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Disabled", disabled: true, onPress: () => setCount(value => value + 1) }), (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Loading", loading: true, onPress: () => setCount(value => value + 1) })] })] }) }));
}
const styles = react_native_1.StyleSheet.create({
    screen: { flex: 1, backgroundColor: ui_native_1.BscColors.background },
    content: { padding: ui_native_1.BscSpacing.lg, gap: ui_native_1.BscSpacing.md },
    heading: { fontSize: 24, fontWeight: '700', color: ui_native_1.BscColors.textPrimary },
    text: { fontSize: 18, color: ui_native_1.BscColors.textPrimary },
});
