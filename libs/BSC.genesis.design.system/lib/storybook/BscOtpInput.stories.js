"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FourDigits = exports.Disabled = exports.WithError = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ui_native_1 = require("@bsc/ui-native");
const meta = {
    title: 'Verification/BscOtpInput',
    component: ui_native_1.BscOtpInput,
    args: { length: 6, value: '', onChangeText: () => { } },
};
exports.default = meta;
function ControlledOtp(props) {
    const [value, setValue] = (0, react_1.useState)(props.value ?? '');
    return (0, jsx_runtime_1.jsx)(ui_native_1.BscOtpInput, { ...props, value: value, onChangeText: setValue });
}
exports.Default = { args: {}, render: args => (0, jsx_runtime_1.jsx)(ControlledOtp, { ...args }) };
exports.WithError = {
    args: { hasError: true, errorMessage: 'Invalid code.' },
    render: args => (0, jsx_runtime_1.jsx)(ControlledOtp, { ...args }),
};
exports.Disabled = {
    args: { value: '123456', enabled: false },
};
exports.FourDigits = {
    args: { length: 4 },
    render: args => (0, jsx_runtime_1.jsx)(ControlledOtp, { ...args }),
};
