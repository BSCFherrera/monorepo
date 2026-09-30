"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empty = exports.Default = void 0;
const src_1 = require("../src");
const meta = {
    title: 'Forms/ErrorText',
    component: src_1.ErrorText,
    args: { children: 'This field is required.' },
};
exports.default = meta;
exports.Default = {};
exports.Empty = { args: { children: undefined } };
