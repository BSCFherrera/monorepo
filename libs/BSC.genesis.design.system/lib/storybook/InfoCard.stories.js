"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithIcon = exports.Default = void 0;
const src_1 = require("../src");
const meta = {
    title: 'Cards/InfoCard',
    component: src_1.InfoCard,
    args: { title: 'Account summary', subtitle: 'View your latest transactions' },
};
exports.default = meta;
exports.Default = {};
exports.WithIcon = { args: { iconName: 'info' } };
