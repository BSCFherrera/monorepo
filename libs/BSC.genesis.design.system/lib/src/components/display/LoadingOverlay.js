"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingOverlay = LoadingOverlay;
const jsx_runtime_1 = require("react/jsx-runtime");
const ui_native_1 = require("@bsc/ui-native");
function LoadingOverlay({ visible, label, animated = true }) {
    return (0, jsx_runtime_1.jsx)(ui_native_1.BscLoadingOverlay, { visible: visible, label: label, animated: animated });
}
