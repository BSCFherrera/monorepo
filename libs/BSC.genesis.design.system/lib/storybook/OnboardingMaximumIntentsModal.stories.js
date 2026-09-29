"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = {
    title: 'Modals/Dialog Recipes/Error/OnboardingMaximumIntentsModal', component: src_1.MaximumIntentsModal,
    args: { ...CommonDialogExample_1.dialogArgs, title: 'Maximum demo attempts reached', warningMessage: 'The allowed number of example attempts has been exceeded.', message: CommonDialogExample_1.supportMessage, confirmLabel: 'Return home' },
    tags: ['compatibility'],
    parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility copy variant of MaximumIntentsModal. A separate red warning panel precedes the blue information panel.' } } },
};
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<MaximumIntentsModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleClose}
  title="Maximum demo attempts reached"
  warningMessage="The allowed number of example attempts has been exceeded."
  message={supportMessage}
  confirmLabel="Return home"
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.MaximumIntentsModal, { ...args, visible: visible, onClose: onClose, onConfirm: onClose }) }),
};
