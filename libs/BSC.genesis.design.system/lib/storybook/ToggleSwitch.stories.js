"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disabled = exports.On = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ui_native_1 = require("@bsc/ui-native");
const meta = {
    title: 'Forms/ToggleSwitch',
    component: ui_native_1.BscToggleSwitch,
    args: { label: 'Notifications', value: false, onValueChange: () => { } },
};
exports.default = meta;
function ControlledToggle(props) {
    const [value, setValue] = (0, react_1.useState)(false);
    return (0, jsx_runtime_1.jsx)(ui_native_1.BscToggleSwitch, { ...props, value: value, onValueChange: setValue });
}
exports.Default = { render: (args) => (0, jsx_runtime_1.jsx)(ControlledToggle, { ...args }) };
exports.On = { args: { value: true } };
exports.Disabled = { args: { disabled: true } };
