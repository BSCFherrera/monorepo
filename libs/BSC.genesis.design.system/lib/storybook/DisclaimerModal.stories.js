"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const BrandPlaceholder_1 = require("./BrandPlaceholder");
const meta = { title: 'Modals/Dialog Recipes/Disclaimer/DisclaimerModal', component: src_1.DisclaimerModal, args: { visible: true, onClose: () => { }, onBack: () => { }, onContinue: () => { }, title: 'Before you continue', subtitle: 'Prepare the following items for this demo.', logo: (0, jsx_runtime_1.jsx)(BrandPlaceholder_1.BrandPlaceholder, {}), requirements: [{ label: 'A demo profile', iconName: 'user' }, { label: 'A sample document', iconName: 'file-text' }, { label: 'Time to complete the steps', iconName: 'clock' }, { label: 'Your confirmation', iconName: 'check-circle' }] }, parameters: { layout: 'fullscreen', docs: { description: { component: 'Named disclaimer recipe built on the shared ModalCommon surface. Prefer this over the generic ContentModal adapter for disclaimer-specific flows.' } } } };
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<DisclaimerModal
  visible={visible}
  onClose={handleClose}
  onBack={handleBack}
  onContinue={handleContinue}
  title="Before you continue"
  subtitle="Prepare the following items for this demo."
  requirements={requirements}
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.DisclaimerModal, { ...args, visible: visible, onClose: onClose, onBack: onClose, onContinue: onClose }) }),
};
