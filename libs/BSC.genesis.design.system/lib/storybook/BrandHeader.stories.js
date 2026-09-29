"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoNotifications = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const BrandPlaceholder_1 = require("./BrandPlaceholder");
const meta = {
    title: 'Navigation/BrandHeader',
    parameters: { layout: 'fullscreen' },
    component: src_1.BankHeader,
    args: {
        title: 'Assistant',
        showMenu: true,
        showProfile: true,
        showNotification: true,
        userInitials: 'JD',
        hasNotification: true,
    },
};
exports.default = meta;
exports.Default = {
    args: {
        brand: (0, jsx_runtime_1.jsx)(BrandPlaceholder_1.BrandPlaceholder, { compact: true }),
    },
};
exports.NoNotifications = {
    args: {
        brand: (0, jsx_runtime_1.jsx)(BrandPlaceholder_1.BrandPlaceholder, { compact: true }),
        showNotification: false,
    },
};
