"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxLevel = exports.Strong = exports.Medium = exports.Weak = exports.Empty = void 0;
const src_1 = require("../src");
const meta = {
    title: 'Forms/PasswordStrengthMeter',
    component: src_1.PasswordStrengthMeter,
    argTypes: { level: { control: { type: 'range', min: 0, max: 4, step: 1 } } },
    args: { level: 2, label: 'Medium strength' },
};
exports.default = meta;
exports.Empty = { args: { level: 0, label: '' } };
exports.Weak = { args: { level: 1, label: 'Weak' } };
exports.Medium = { args: { level: 2, label: 'Medium' } };
exports.Strong = { args: { level: 3, label: 'Strong' } };
exports.MaxLevel = { args: { level: 4, label: 'Very strong' } };
