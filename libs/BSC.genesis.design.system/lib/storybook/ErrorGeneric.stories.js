"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = { title: 'Modals/Dialog Recipes/Error/ErrorGeneric', component: src_1.ErrorGeneric, args: { ...CommonDialogExample_1.dialogArgs, title: 'Unable to complete this request' }, parameters: { layout: 'fullscreen' } };
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<ErrorGeneric
  visible={visible}
  onClose={handleClose}
  title="Unable to complete this request"
  message="Please try again later."
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.ErrorGeneric, { ...args, visible: visible, onClose: onClose }) }),
};
