"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = { title: 'Modals/Dialog Recipes/Error/ErrorServiceGeneral', component: src_1.ErrorServiceGeneral, args: { ...CommonDialogExample_1.dialogArgs, title: 'Service temporarily unavailable', message: 'The demo service could not complete your request. Please try again later.', confirmLabel: 'Close' }, parameters: { layout: 'fullscreen' } };
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<ErrorServiceGeneral
  visible={visible}
  onClose={handleClose}
  title="Service temporarily unavailable"
  message="The service could not complete your request. Please try again later."
  confirmLabel="Close"
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.ErrorServiceGeneral, { ...args, visible: visible, onClose: onClose }) }),
};
