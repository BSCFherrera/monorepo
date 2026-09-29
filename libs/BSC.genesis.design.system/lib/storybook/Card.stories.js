"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const src_1 = require("../src");
const meta = {
    title: 'Cards/Card',
    component: src_1.Card,
    argTypes: { children: { control: false } },
    args: {
        children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { children: "A reusable card with native content." }),
    },
};
exports.default = meta;
exports.Default = {};
