"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = { title: 'Modals/Dialog Recipes/Error/ErrorGeneral', component: src_1.ErrorGeneral, args: { ...CommonDialogExample_1.dialogArgs, title: 'We need your attention', message: CommonDialogExample_1.supportMessage, confirmLabel: 'Return home' }, parameters: { layout: 'fullscreen' } };
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<ErrorGeneral
  visible={visible}
  onClose={handleClose}
  title="We need your attention"
  message={supportMessage}
  confirmLabel="Return home"
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.ErrorGeneral, { ...args, visible: visible, onClose: onClose }) }),
};
