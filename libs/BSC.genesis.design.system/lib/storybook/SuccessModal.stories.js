"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = { title: 'Modals/Dialog Recipes/Success/SuccessModal', component: src_1.SuccessModal, args: { ...CommonDialogExample_1.dialogArgs, title: 'Request completed', message: 'Your demo request was completed successfully. You can now continue.' }, parameters: { layout: 'fullscreen' } };
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<SuccessModal
  visible={visible}
  onClose={handleClose}
  title="Request completed"
  message="Your request was completed successfully."
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.SuccessModal, { ...args, visible: visible, onClose: onClose }) }),
};
