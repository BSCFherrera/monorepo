"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const src_1 = require("../src");
const meta = {
    title: 'Selection/SelectPill',
    component: src_1.SelectPill,
    args: {
        onSelect: () => { },
        label: 'View mode',
        options: [
            { label: 'Personal', value: 'personal', iconName: 'user' },
            { label: 'Business', value: 'business', iconName: 'file-text' },
        ],
        value: 'personal',
    },
};
exports.default = meta;
function ControlledPill(props) {
    const [value, setValue] = (0, react_1.useState)('personal');
    return (0, jsx_runtime_1.jsx)(src_1.SelectPill, { ...props, value: value, onSelect: setValue });
}
exports.Default = { render: (args) => (0, jsx_runtime_1.jsx)(ControlledPill, { ...args }) };
