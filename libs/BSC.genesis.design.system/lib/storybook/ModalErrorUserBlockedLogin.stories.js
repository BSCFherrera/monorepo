"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = {
    title: 'Modals/Dialog Recipes/Error/ModalErrorUserBlockedLogin', component: src_1.ModalErrorUserBlockedLogin,
    tags: ['compatibility'],
    parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility onboarding error recipe that delegates to the shared ModalCommon information-panel layout.' } } },
    args: {
        visible: true, onClose: () => { }, title: 'Your demo access is temporarily blocked', confirmLabel: 'Acknowledge',
        message: (0, jsx_runtime_1.jsxs)(react_native_1.Text, { children: ["Please review the ", (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { fontWeight: '700', color: '#1A1A1A' }, children: "demo support instructions" }), " before attempting to access the workspace again."] }),
    },
};
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<ModalErrorUserBlockedLogin
  visible={visible}
  onClose={handleClose}
  title="Your demo access is temporarily blocked"
  message={blockedAccessMessage}
  confirmLabel="Acknowledge"
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.ModalErrorUserBlockedLogin, { ...args, visible: visible, onClose: onClose }) }),
};
