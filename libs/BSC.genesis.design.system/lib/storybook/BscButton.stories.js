"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loading = exports.Disabled = exports.Large = exports.Small = exports.Text = exports.Secondary = exports.Primary = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const addon_actions_1 = require("@storybook/addon-actions");
const ui_native_1 = require("@bsc/ui-native");
const meta = {
    title: 'Actions/BscButton',
    component: ui_native_1.BscPrimaryButton,
    argTypes: {
        label: { control: 'text' },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        disabled: { control: 'boolean' },
        loading: { control: 'boolean' },
        onPress: { control: false },
    },
    args: {
        label: 'Save',
        onPress: () => (0, addon_actions_1.action)('BscButton pressed')(),
    },
};
exports.default = meta;
exports.Primary = {};
exports.Secondary = {
    render: args => (0, jsx_runtime_1.jsx)(ui_native_1.BscSecondaryButton, { ...args }),
};
exports.Text = {
    args: { label: 'Text button' },
    render: args => (0, jsx_runtime_1.jsx)(ui_native_1.BscTextButton, { ...args }),
};
exports.Small = { args: { size: 'sm' } };
exports.Large = { args: { size: 'lg' } };
exports.Disabled = { args: { disabled: true } };
exports.Loading = { args: { loading: true } };
