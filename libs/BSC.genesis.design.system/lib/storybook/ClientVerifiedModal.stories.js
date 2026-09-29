"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const BrandPlaceholder_1 = require("./BrandPlaceholder");
const meta = { title: 'Modals/Dialog Recipes/Client Verification/ClientVerifiedModal', component: src_1.ClientVerifiedModal, args: { ...CommonDialogExample_1.dialogArgs, title: 'Confirm your information', message: 'Please confirm that the following demo profile belongs to you.', details: [{ label: 'Display name', value: 'Example Participant' }], secondaryLabel: 'This is not me', onSecondary: () => { }, logo: (0, jsx_runtime_1.jsx)(BrandPlaceholder_1.BrandPlaceholder, {}) }, parameters: { layout: 'fullscreen' } };
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<ClientVerifiedModal
  visible={visible}
  onClose={handleClose}
  onSecondary={handleReject}
  title="Confirm your information"
  message="Please confirm that the following demo profile belongs to you."
  details={[{ label: 'Display name', value: 'Example Participant' }]}
  secondaryLabel="This is not me"
  logo={<BrandLogo />}
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.ClientVerifiedModal, { ...args, visible: visible, onClose: onClose, onSecondary: onClose }) }),
};
