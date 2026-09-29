"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportMessage = exports.dialogArgs = void 0;
exports.CommonDialogExample = CommonDialogExample;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
exports.dialogArgs = { visible: true, onClose: () => { }, title: 'Please review this request', message: 'This demo request needs your attention. Review the available information before continuing.', confirmLabel: 'Continue' };
function CommonDialogExample({ children }) {
    const [visible, setVisible] = (0, react_1.useState)(true);
    return (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { minHeight: 100 }, children: [(0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Open example", onPress: () => setVisible(true) }), children(visible, () => setVisible(false))] });
}
exports.supportMessage = (0, jsx_runtime_1.jsxs)(react_native_1.Text, { children: ["Review the ", (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { fontWeight: '700', color: '#1A1A1A' }, children: "demo support instructions" }), " or select ", (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { fontWeight: '700', color: '#002d80' }, children: "help resources" }), " to learn about the next step. No external service is connected."] });
