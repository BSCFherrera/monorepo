"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = {
    title: 'Modals/Dialog Recipes/Success/ProofOfLifeSuccessModal', component: src_1.ProofOfLifeSuccessModal,
    tags: ['compatibility'],
    parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility success recipe sharing the SuccessModal layout. This example does not perform identity verification.' } } },
    args: { visible: true, onContinue: () => { }, title: 'Demo verification completed', message: 'The example verification step is complete. You can continue with the remaining steps.', confirmLabel: 'Continue' },
};
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<ProofOfLifeSuccessModal
  visible={visible}
  onContinue={handleContinue}
  title="Demo verification completed"
  message="The example verification step is complete."
  confirmLabel="Continue"
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.ProofOfLifeSuccessModal, { ...args, visible: visible, onContinue: onClose }) }),
};
