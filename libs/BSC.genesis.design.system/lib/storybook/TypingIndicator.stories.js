"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Static = exports.Animated = void 0;
const ui_native_1 = require("@bsc/ui-native");
const meta = {
    title: 'Conversation/TypingIndicator',
    component: ui_native_1.BscTypingIndicator,
    args: { animated: true },
};
exports.default = meta;
exports.Animated = {};
exports.Static = { args: { animated: false } };
