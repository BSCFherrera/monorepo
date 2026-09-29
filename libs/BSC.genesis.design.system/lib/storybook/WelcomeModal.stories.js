"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = {
    title: 'Modals/Dialog Recipes/Welcome/WelcomeModal', component: src_1.WelcomeModal,
    tags: ['compatibility'],
    parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility onboarding recipe that delegates to the shared ModalCommon surface with welcome-specific copy and action wiring.' } } },
    args: {
        visible: true, onClose: () => { }, onAccessChat: () => { }, title: 'Welcome to your demo workspace', confirmLabel: 'Open conversation',
        message: (0, jsx_runtime_1.jsxs)(react_native_1.Text, { children: ["You can now explore ", (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { fontWeight: '700', color: '#1A1A1A' }, children: "your new conversation space" }), " and discover the available tools at your own pace."] }),
    },
};
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<WelcomeModal
  visible={visible}
  onClose={handleClose}
  onAccessChat={handleAccessChat}
  title="Welcome to your demo workspace"
  confirmLabel="Open conversation"
  message={welcomeMessage}
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.WelcomeModal, { ...args, visible: visible, onClose: onClose, onAccessChat: onClose }) }),
};
