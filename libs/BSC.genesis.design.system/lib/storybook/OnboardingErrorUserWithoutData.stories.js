"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = {
    title: 'Modals/Dialog Recipes/Error/OnboardingErrorUserWithoutData', component: src_1.ErrorUserWithoutData,
    args: { ...CommonDialogExample_1.dialogArgs, title: 'Your demo profile needs more information', message: CommonDialogExample_1.supportMessage, confirmLabel: 'Return home' },
    tags: ['compatibility'],
    parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility copy variant of ErrorUserWithoutData, including bold/link text inside the information panel.' } } },
};
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<ErrorUserWithoutData
  visible={visible}
  onClose={handleClose}
  onConfirm={handleClose}
  title="Your demo profile needs more information"
  message={supportMessage}
  confirmLabel="Return home"
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.ErrorUserWithoutData, { ...args, visible: visible, onClose: onClose, onConfirm: onClose }) }),
};
