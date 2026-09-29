"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = { title: 'Modals/Dialog Recipes/Session/SessionExpiredModal', component: src_1.SessionExpiredModal, args: { ...CommonDialogExample_1.dialogArgs, title: 'Your session has expired', message: 'This demo session is no longer active. Please acknowledge this message to continue.', confirmLabel: 'Acknowledge' }, parameters: { layout: 'fullscreen' } };
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<SessionExpiredModal
  visible={visible}
  onClose={handleClose}
  title="Your session has expired"
  message="This session is no longer active."
  confirmLabel="Acknowledge"
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.SessionExpiredModal, { ...args, visible: visible, onClose: onClose }) }),
};
