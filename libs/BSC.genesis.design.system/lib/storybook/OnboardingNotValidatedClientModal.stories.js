"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = {
    title: 'Modals/Dialog Recipes/Client Verification/OnboardingNotValidatedClientModal', component: src_1.NotValidatedClientModal,
    args: { ...CommonDialogExample_1.dialogArgs, title: 'Your demo profile is not validated', confirmLabel: 'Review profile', secondaryLabel: 'Return home', onSecondary: () => { } },
    tags: ['compatibility'],
    parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility copy variant of NotValidatedClientModal: two filled full-width pills below the information panel.' } } },
};
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<NotValidatedClientModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleReviewProfile}
  onSecondary={handleReturnHome}
  title="Your demo profile is not validated"
  confirmLabel="Review profile"
  secondaryLabel="Return home"
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.NotValidatedClientModal, { ...args, visible: visible, onClose: onClose, onConfirm: onClose, onSecondary: onClose }) }),
};
