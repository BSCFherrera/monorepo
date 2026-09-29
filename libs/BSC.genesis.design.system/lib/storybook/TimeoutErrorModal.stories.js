"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = { title: 'Modals/Dialog Recipes/Error/TimeoutErrorModal', component: src_1.TimeoutErrorModal, args: { ...CommonDialogExample_1.dialogArgs, title: 'This request took too long', message: 'The demo request has timed out. You can return home and start again.' }, parameters: { layout: 'fullscreen' } };
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<TimeoutErrorModal
  visible={visible}
  onClose={handleClose}
  title="This request took too long"
  message="The request has timed out. You can return home and start again."
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.TimeoutErrorModal, { ...args, visible: visible, onClose: onClose }) }),
};
