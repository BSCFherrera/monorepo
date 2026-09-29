"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disabled = exports.Checked = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ui_native_1 = require("@bsc/ui-native");
const meta = {
    title: 'Forms/Checkbox',
    component: ui_native_1.BscCheckbox,
    argTypes: { checked: { control: 'boolean' }, disabled: { control: 'boolean' } },
    args: { label: 'Receive updates', checked: false, onChange: () => { } },
};
exports.default = meta;
function ControlledCheckbox(props) {
    const [checked, setChecked] = (0, react_1.useState)(false);
    return (0, jsx_runtime_1.jsx)(ui_native_1.BscCheckbox, { ...props, checked: checked, onChange: setChecked });
}
exports.Default = { render: (args) => (0, jsx_runtime_1.jsx)(ControlledCheckbox, { ...args }) };
exports.Checked = { args: { checked: true } };
exports.Disabled = { args: { disabled: true } };
