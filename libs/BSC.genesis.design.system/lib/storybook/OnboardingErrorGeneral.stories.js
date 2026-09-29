"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = {
    title: 'Modals/Dialog Recipes/Error/OnboardingErrorGeneral', component: src_1.ErrorGeneral,
    args: { ...CommonDialogExample_1.dialogArgs, title: 'This demo request needs attention', message: CommonDialogExample_1.supportMessage, confirmLabel: 'Return home' },
    tags: ['compatibility'],
    parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility copy variant of ErrorGeneral with the same illustration, heading, rich information panel, spacing, and standard button. Only host callbacks and copy differ.' } } },
};
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<ErrorGeneral
  visible={visible}
  onClose={handleClose}
  onConfirm={handleClose}
  title="This demo request needs attention"
  message={supportMessage}
  confirmLabel="Return home"
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.ErrorGeneral, { ...args, visible: visible, onClose: onClose, onConfirm: onClose }) }),
};
