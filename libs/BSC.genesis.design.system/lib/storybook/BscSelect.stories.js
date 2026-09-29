"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithError = exports.Disabled = exports.Preselected = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ui_native_1 = require("@bsc/ui-native");
const options = [
    { key: 'never', label: 'Never', value: 0 },
    { key: 'weekly', label: 'Weekly', detail: 'Every week', value: 1 },
    { key: 'monthly', label: 'Monthly', detail: 'Every month', value: 2 },
];
const meta = {
    title: 'Selection/BscSelect',
    component: ui_native_1.BscSelect,
    args: {
        title: 'Frequency',
        placeholder: 'Select an option',
        options,
        selectedKey: null,
        onSelect: () => { },
    },
};
exports.default = meta;
function ControlledSelect(props) {
    const [selectedKey, setSelectedKey] = (0, react_1.useState)(props.selectedKey ?? null);
    return ((0, jsx_runtime_1.jsx)(ui_native_1.BscSelect, { ...props, selectedKey: selectedKey, onSelect: option => setSelectedKey(option.key) }));
}
exports.Default = { args: {}, render: args => (0, jsx_runtime_1.jsx)(ControlledSelect, { ...args }) };
exports.Preselected = {
    args: { selectedKey: 'weekly' },
    render: args => (0, jsx_runtime_1.jsx)(ControlledSelect, { ...args }),
};
exports.Disabled = { args: { enabled: false } };
exports.WithError = {
    args: { error: 'Choose one option.' },
    render: args => (0, jsx_runtime_1.jsx)(ControlledSelect, { ...args }),
};
