"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = exports.BoldText = exports.WithTimestamp = exports.Outgoing = exports.Incoming = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const src_1 = require("../src");
const meta = {
    title: 'Conversation/MessageBubble',
    component: src_1.MessageBubble,
    args: { children: 'How can I help you today?', direction: 'incoming' },
};
exports.default = meta;
exports.Incoming = {};
exports.Outgoing = { args: { direction: 'outgoing', children: 'Show me the available options.' } };
exports.WithTimestamp = { args: { timestampLabel: '10:00 AM' } };
exports.BoldText = { args: { children: 'Your **account balance** is $1,500.00' } };
exports.Conversation = {
    render: () => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: 4 }, children: [(0, jsx_runtime_1.jsx)(src_1.MessageBubble, { timestampLabel: "10:00", children: "How can I help you?" }), (0, jsx_runtime_1.jsx)(src_1.MessageBubble, { direction: "outgoing", timestampLabel: "10:01", children: "Show me the available options." }), (0, jsx_runtime_1.jsx)(src_1.MessageBubble, { timestampLabel: "10:02", children: "Here are your **current options** for assistance." })] })),
};
