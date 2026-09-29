"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithLabels = exports.LastStep = exports.FirstStep = exports.Default = void 0;
const ui_native_1 = require("@bsc/ui-native");
const meta = {
    title: 'Verification/Steps',
    component: ui_native_1.BscSteps,
    args: { totalSteps: 4, current: 1 },
};
exports.default = meta;
exports.Default = {};
exports.FirstStep = { args: { current: 0 } };
exports.LastStep = { args: { current: 3 } };
exports.WithLabels = { args: { labels: ['Details', 'Review', 'Confirm', 'Finish'], current: 2 } };
