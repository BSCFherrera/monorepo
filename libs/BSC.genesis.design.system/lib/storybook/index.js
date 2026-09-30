"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
require("@storybook/addon-ondevice-actions/register");
const react_native_1 = require("@storybook/react-native");
const react_native_2 = require("react-native");
const catalog_1 = require("./catalog");
const iconAdapter_1 = require("./iconAdapter");
const preview = {
    decorators: [(Story) => ((0, jsx_runtime_1.jsx)(iconAdapter_1.FeatherIconProvider, { children: (0, jsx_runtime_1.jsx)(react_native_2.View, { style: { flex: 1, padding: 16, backgroundColor: '#F5F7FA' }, children: (0, jsx_runtime_1.jsx)(Story, {}) }) }))],
};
const view = (0, react_native_1.start)({ storyEntries: catalog_1.storyEntries, annotations: [preview] });
exports.default = view.getStorybookUI({
    onDeviceUI: true,
    enableWebsockets: false,
    shouldPersistSelection: false,
    initialSelection: 'components-button--primary',
});
