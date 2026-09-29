"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithError = exports.Disabled = exports.Secure = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ui_native_1 = require("@bsc/ui-native");
const meta = {
    title: 'Forms/BscTextField',
    component: ui_native_1.BscTextField,
    args: { label: 'Name', placeholder: 'Type here...', value: '', onChangeText: () => { } },
};
exports.default = meta;
function ControlledField(props) {
    const [value, setValue] = (0, react_1.useState)(props.value ?? '');
    return (0, jsx_runtime_1.jsx)(ui_native_1.BscTextField, { ...props, value: value, onChangeText: setValue });
}
exports.Default = { args: {}, render: args => (0, jsx_runtime_1.jsx)(ControlledField, { ...args }) };
exports.Secure = {
    args: { label: 'Password', placeholder: 'Enter password', secure: true },
    render: args => (0, jsx_runtime_1.jsx)(ControlledField, { ...args }),
};
exports.Disabled = {
    args: { label: 'Disabled', value: 'Disabled content', editable: false },
};
exports.WithError = {
    args: { label: 'Email', value: 'invalid', error: 'Enter a valid email.' },
};
