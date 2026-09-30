"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithLabels = exports.LastStep = exports.FirstStep = exports.Default = void 0;
const src_1 = require("../src");
const meta = {
    title: 'Verification/Steps',
    component: src_1.Steps,
    args: { totalSteps: 4, current: 1 },
};
exports.default = meta;
exports.Default = {};
exports.FirstStep = { args: { current: 0 } };
exports.LastStep = { args: { current: 3 } };
exports.WithLabels = { args: { labels: ['Details', 'Review', 'Confirm', 'Finish'], current: 2 } };
