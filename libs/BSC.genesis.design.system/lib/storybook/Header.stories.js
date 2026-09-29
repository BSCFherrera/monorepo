"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitleOnly = exports.WithBack = exports.Default = void 0;
const src_1 = require("../src");
const meta = {
    title: 'Navigation/Header',
    parameters: { layout: 'fullscreen' },
    component: src_1.Header,
    args: { title: 'Account Details', subtitle: 'View and manage' },
};
exports.default = meta;
exports.Default = {};
exports.WithBack = { args: { onBack: () => { } } };
exports.TitleOnly = { args: { subtitle: undefined } };
