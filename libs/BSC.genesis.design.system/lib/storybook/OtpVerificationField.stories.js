"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resend = exports.SentState = exports.WithError = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const src_1 = require("../src");
const meta = {
    title: 'Verification/OtpVerificationField', component: src_1.OtpVerificationField,
    args: { value: '', onChange: () => { }, onVerify: () => { }, options: [{ label: 'Demo destination A', value: 0 }, { label: 'Demo destination B', value: 1 }], selectedValue: 0 },
};
exports.default = meta;
function Example(props) {
    const [value, setValue] = (0, react_1.useState)(props.value);
    const [sent, setSent] = (0, react_1.useState)(props.codeSent ?? false);
    const [verified, setVerified] = (0, react_1.useState)(false);
    const [destination, setDestination] = (0, react_1.useState)(0);
    return (0, jsx_runtime_1.jsx)(src_1.OtpVerificationField, { ...props, value: value, onChange: setValue, codeSent: sent, verified: verified, selectedValue: destination, onSelect: setDestination, onSend: () => setSent(true), onResend: () => setValue(''), onVerify: () => setVerified(true), sentText: "A demo code was prepared for the selected destination." });
}
exports.Default = { render: args => (0, jsx_runtime_1.jsx)(Example, { ...args }) };
exports.WithError = { args: { codeSent: true, error: true, errorText: 'Please check the six-digit demo code.' }, render: args => (0, jsx_runtime_1.jsx)(Example, { ...args }) };
exports.SentState = { args: { codeSent: true, timer: { finished: false, label: '00:45' } }, render: args => (0, jsx_runtime_1.jsx)(Example, { ...args }) };
exports.Resend = { args: { codeSent: true }, render: args => (0, jsx_runtime_1.jsx)(Example, { ...args }) };
