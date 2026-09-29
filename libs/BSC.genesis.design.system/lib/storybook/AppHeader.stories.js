"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithBackButton = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const src_1 = require("../src");
const BrandPlaceholder_1 = require("./BrandPlaceholder");
const meta = {
    title: 'Navigation/AppHeader',
    parameters: { layout: 'fullscreen' },
    component: src_1.HeaderOnboarding,
};
exports.default = meta;
exports.Default = {
    args: {
        logo: (0, jsx_runtime_1.jsx)(BrandPlaceholder_1.BrandPlaceholder, {}),
        showBackButton: true,
        onBackPress: () => { },
        showBottomLine: true,
    },
};
exports.WithBackButton = {
    args: {
        brand: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { fontSize: 18, fontWeight: '700' }, children: "Logo" }),
        showBackButton: true,
        onBackPress: () => { },
        showBottomLine: false,
    },
};
