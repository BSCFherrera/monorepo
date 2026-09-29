"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Static = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const src_1 = require("../src");
const meta = {
    title: 'Feedback/LoadingOverlay',
    component: src_1.LoadingOverlay,
    args: { visible: true, label: 'Loading...' },
};
exports.default = meta;
exports.Default = {
    render: (args) => ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: { height: 300, width: '100%', position: 'relative' }, children: (0, jsx_runtime_1.jsx)(src_1.LoadingOverlay, { ...args }) })),
};
exports.Static = {
    render: (args) => ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: { height: 300, width: '100%', position: 'relative' }, children: (0, jsx_runtime_1.jsx)(src_1.LoadingOverlay, { ...args, animated: false }) })),
};
