"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = {
    title: 'Modals/Compatibility/TimoutErrorModal', component: src_1.TimoutErrorModal,
    args: { ...CommonDialogExample_1.dialogArgs, title: 'This demo request took too long', message: 'You can return home and start a new example request.', confirmLabel: 'Return home' },
    tags: ['compatibility', 'deprecated'],
    parameters: { layout: 'fullscreen', docs: { description: { component: 'Deprecated compatibility alias preserving the misspelled public export TimoutErrorModal. Prefer TimeoutErrorModal for new code.' } } },
};
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<TimoutErrorModal
  visible={visible}
  onClose={handleClose}
  title="This demo request took too long"
  message="You can return home and start a new example request."
  confirmLabel="Return home"
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.TimoutErrorModal, { ...args, visible: visible, onClose: onClose, onConfirm: onClose }) }),
};
