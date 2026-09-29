"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceError = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const src_1 = require("../src");
const BrandPlaceholder_1 = require("./BrandPlaceholder");
const CommonDialogExample_1 = require("./CommonDialogExample");
const serviceError = { visible: true, onClose: () => { }, title: 'Unable to complete the demo step', message: 'No registration service is connected. Return to the profile and try this example again.', confirmLabel: 'Return to profile' };
const meta = {
    title: 'Modals/Dialog Recipes/Client Verification/OnboardingClientVerifiedModal', component: src_1.OnboardingClientVerifiedModal,
    tags: ['compatibility'],
    parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility client-verification recipe matching ClientVerifiedModal. The optional service-error state uses ErrorServiceGeneral without invoking a backend.' } } },
    args: { visible: true, onClose: () => { }, title: 'Confirm your information', message: 'Review the demo profile before continuing to the next step.', details: [{ label: 'Display name', value: 'Example Participant' }], logo: (0, jsx_runtime_1.jsx)(BrandPlaceholder_1.BrandPlaceholder, {}), secondaryLabel: 'This is not me', onSecondary: () => { }, confirmLabel: 'Continue' },
};
exports.default = meta;
function Example(props) {
    const [failed, setFailed] = (0, react_1.useState)(props.serviceError?.visible ?? false);
    return (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.OnboardingClientVerifiedModal, { ...props, visible: visible, onClose: onClose, onSecondary: onClose, onConfirm: () => setFailed(true), serviceError: { ...serviceError, visible: failed, onClose: () => setFailed(false) } }) });
}
exports.Default = {
    parameters: { docs: { source: { code: `<OnboardingClientVerifiedModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleContinue}
  onSecondary={handleReject}
  title="Confirm your information"
  message="Review the demo profile before continuing to the next step."
  details={[{ label: 'Display name', value: 'Example Participant' }]}
  logo={<BrandLogo />}
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(Example, { ...args }),
};
exports.ServiceError = {
    args: { serviceError },
    parameters: { docs: { source: { code: `<OnboardingClientVerifiedModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleContinue}
  title="Confirm your information"
  serviceError={{
    visible: showServiceError,
    onClose: hideServiceError,
    title: 'Unable to complete the step',
    message: 'Please return to the profile and try again.',
  }}
/>` } } },
    render: args => (0, jsx_runtime_1.jsx)(Example, { ...args }),
};
