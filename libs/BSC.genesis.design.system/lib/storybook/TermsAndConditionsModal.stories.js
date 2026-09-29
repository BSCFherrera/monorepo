"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = { title: 'Modals/Dialog Recipes/Terms/TermsAndConditionsModal', component: src_1.TermsAndConditionsModal, args: { visible: true, onClose: () => { }, onAccept: () => { }, title: 'Demo participation information', content: 'This is synthetic display content, not legal advice or a service agreement. Review how the example arranges longer paragraphs before adding your own approved content.\n\nThe host application owns acceptance, persistence, and any decision to continue. This catalog does not send information to a service or store an acceptance record.' }, parameters: { layout: 'fullscreen', docs: { description: { component: 'Named terms recipe built on the shared ModalCommon surface. Prefer this over the generic ContentModal adapter for terms-specific flows.' } } } };
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<TermsAndConditionsModal
  visible={visible}
  onClose={handleClose}
  onAccept={handleAccept}
  title="Demo participation information"
  content={termsContent}
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.TermsAndConditionsModal, { ...args, visible: visible, onClose: onClose, onAccept: onClose }) }),
};
