"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const src_1 = require("../src");
const meta = {
    title: 'Navigation/DrawerMenu',
    component: src_1.HamburgerMenu,
    args: { visible: false, onDismiss: () => { } },
    parameters: { layout: 'fullscreen' },
};
exports.default = meta;
function DrawerExample() {
    const [visible, setVisible] = (0, react_1.useState)(false);
    const [selected, setSelected] = (0, react_1.useState)('main');
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: 16 }, children: [(0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Open drawer", onPress: () => setVisible(true) }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { children: ["Selected: ", selected] }), (0, jsx_runtime_1.jsx)(src_1.HamburgerMenu, { visible: visible, onDismiss: () => setVisible(false), selectedId: selected, items: [
                    { id: 'main', label: 'Main assistant', onPress: () => { setSelected('main'); setVisible(false); } },
                    { id: 'transactions', label: 'Transactions', onPress: () => { setSelected('transactions'); setVisible(false); } },
                    { id: 'products', label: 'Products', onPress: () => { setSelected('products'); setVisible(false); } },
                    { id: 'profile', label: 'Edit profile', onPress: () => { setSelected('profile'); setVisible(false); } },
                    { id: 'disabled', label: 'Unavailable', disabled: true, onPress: () => { } },
                ], history: [
                    { id: 'h1', title: 'Transfer to contact', preview: 'Limit inquiry and validation', onPress: () => setVisible(false) },
                    { id: 'h2', title: 'Card application', preview: 'Documents for credit card', onPress: () => setVisible(false) },
                ], onNewConversation: () => setVisible(false), onLogout: () => setVisible(false) })] }));
}
exports.Default = { render: () => (0, jsx_runtime_1.jsx)(DrawerExample, {}) };
