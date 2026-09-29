"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = { title: 'Modals/Dialog Recipes/Session/WarningSessionModal', component: src_1.WarningSessionModal, args: { ...CommonDialogExample_1.dialogArgs, title: 'Your session will expire soon', message: 'This demo session has been inactive. Choose whether to continue or end it now.', confirmLabel: 'Continue session', secondaryLabel: 'End session', onSecondary: () => { } }, parameters: { layout: 'fullscreen' } };
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<WarningSessionModal
  visible={visible}
  onClose={handleClose}
  onSecondary={handleEndSession}
  title="Your session will expire soon"
  message="Choose whether to continue or end it now."
  confirmLabel="Continue session"
  secondaryLabel="End session"
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.WarningSessionModal, { ...args, visible: visible, onClose: onClose, onSecondary: onClose }) }),
};
