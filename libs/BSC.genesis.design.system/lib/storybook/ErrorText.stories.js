"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empty = exports.Default = void 0;
const ui_native_1 = require("@bsc/ui-native");
const meta = {
    title: 'Forms/ErrorText',
    component: ui_native_1.BscErrorText,
    args: { children: 'This field is required.' },
};
exports.default = meta;
exports.Default = {};
exports.Empty = { args: { children: undefined } };
