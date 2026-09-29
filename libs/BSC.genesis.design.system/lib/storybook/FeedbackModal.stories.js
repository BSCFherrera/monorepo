"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientVerified = exports.UnvalidatedClient = exports.MaxAttempts = exports.Welcome = exports.BlockedLogin = exports.SessionWarning = exports.SessionExpired = exports.Timeout = exports.Success = exports.UserData = exports.Contact = exports.Service = exports.ImperativeRef = exports.Info = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const src_1 = require("../src");
const BrandPlaceholder_1 = require("./BrandPlaceholder");
const meta = {
    title: 'Feedback/FeedbackModal',
    component: src_1.FeedbackModal,
    args: { visible: false, onDismiss: () => { }, title: 'Example feedback' },
    parameters: {
        layout: 'fullscreen',
        docs: { description: { component: 'FeedbackModal adapts shared dialog recipes behind one variant prop. Use controlled `visible` when feedback follows app state. Use the imperative `ref` for local, one-off feedback triggers. Specialized recipe exports remain available for compatibility and clearer migration paths.' } },
    },
};
exports.default = meta;
function FeedbackExample({ variant, initiallyOpen = false }) {
    const [visible, setVisible] = (0, react_1.useState)(initiallyOpen);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: 16 }, children: [(0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: `Open ${variant}`, onPress: () => setVisible(true) }), (0, jsx_runtime_1.jsx)(src_1.FeedbackModal, { visible: visible, onDismiss: () => setVisible(false), title: variant === 'success' ? 'Process completed' : variant === 'timeout' ? 'Session timeout' : variant === 'sessionExpired' ? 'Session expired' : variant === 'sessionWarning' ? 'Session about to expire' : variant === 'blockedLogin' ? 'Account locked' : variant === 'welcome' ? 'Welcome!' : variant === 'clientVerified' ? 'Verify your data' : variant === 'maxAttempts' ? 'Maximum attempts reached' : variant === 'unvalidatedClient' ? 'Unvalidated client' : 'Information', variant: variant, message: variant === 'success' ? 'Your demo request has been processed successfully.' : variant === 'timeout' ? 'The demo request took too long to complete.' : variant === 'sessionExpired' ? 'Your previous demo session is no longer valid.' : variant === 'sessionWarning' ? 'Your demo session will expire soon due to inactivity.' : variant === 'blockedLogin' ? 'Please review the demo support instructions before trying again.' : variant === 'welcome' ? 'Explore your new conversation space and discover the available tools at your own pace.' : variant === 'maxAttempts' ? 'Review the demo help resources to learn about the next step.' : variant === 'unvalidatedClient' ? 'Your demo profile has not been validated yet.' : variant === 'clientVerified' ? 'Example Participant' : 'This is a synthetic informational message.', warningMessage: variant === 'maxAttempts' ? 'You have exceeded the maximum number of attempts.' : undefined, subtitle: variant === 'clientVerified' ? 'Please confirm your information below.' : undefined, canDismiss: variant !== 'sessionExpired' && variant !== 'sessionWarning', confirmLabel: variant === 'sessionWarning' ? 'Extend session' : variant === 'welcome' ? 'Get started' : 'Continue', onConfirm: () => setVisible(false), secondaryLabel: variant === 'sessionWarning' ? 'Log out' : variant === 'clientVerified' ? 'This is not me' : variant === 'unvalidatedClient' ? 'Go home' : undefined, onSecondary: variant === 'sessionWarning' || variant === 'clientVerified' || variant === 'unvalidatedClient' ? () => setVisible(false) : undefined, logo: variant === 'clientVerified' ? (0, jsx_runtime_1.jsx)(BrandPlaceholder_1.BrandPlaceholder, {}) : undefined, detailLabel: variant === 'clientVerified' ? 'Display name' : undefined })] }));
}
exports.Info = {
    parameters: {
        docs: {
            source: {
                code: `<FeedbackModal
  visible={visible}
  onDismiss={handleDismiss}
  variant="info"
  title="Information"
  message="This is a synthetic informational message."
  confirmLabel="Continue"
  onConfirm={handleDismiss}
/>`,
            },
        },
    },
    render: () => (0, jsx_runtime_1.jsx)(FeedbackExample, { variant: "info" }),
};
exports.ImperativeRef = {
    parameters: {
        docs: {
            source: {
                code: `const modalRef = useRef<ModalHandle>(null);

<>
  <BscPrimaryButton label="Open feedback with ref" onPress={() => modalRef.current?.open()} />
  <BscPrimaryButton label="Close feedback with ref" onPress={() => modalRef.current?.close()} />
  <FeedbackModal
    ref={modalRef}
    variant="success"
    title="Saved"
    message="This feedback modal was opened through ModalHandle.open()."
    confirmLabel="Close"
    onConfirm={() => modalRef.current?.close()}
  />
</>`,
            },
        },
    },
    render: () => {
        const modalRef = (0, react_1.useRef)(null);
        return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: 16 }, children: [(0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Open feedback with ref", onPress: () => modalRef.current?.open() }), (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Close feedback with ref", onPress: () => modalRef.current?.close() }), (0, jsx_runtime_1.jsx)(src_1.FeedbackModal, { ref: modalRef, variant: "success", title: "Saved", message: "This feedback modal was opened through ModalHandle.open().", confirmLabel: "Close", onConfirm: () => modalRef.current?.close() })] }));
    },
};
exports.Service = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="service" title="Information" message="The service could not complete the request." />' } } }, render: () => (0, jsx_runtime_1.jsx)(FeedbackExample, { variant: "service" }) };
exports.Contact = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="contact" title="Information" message="Contact support for help with this request." />' } } }, render: () => (0, jsx_runtime_1.jsx)(FeedbackExample, { variant: "contact" }) };
exports.UserData = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="userData" title="Information" message="Review the information associated with this profile." />' } } }, render: () => (0, jsx_runtime_1.jsx)(FeedbackExample, { variant: "userData" }) };
exports.Success = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="success" title="Process completed" message="Your request has been processed successfully." />' } } }, render: () => (0, jsx_runtime_1.jsx)(FeedbackExample, { variant: "success", initiallyOpen: true }) };
exports.Timeout = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="timeout" title="Session timeout" message="The request took too long to complete." />' } } }, render: () => (0, jsx_runtime_1.jsx)(FeedbackExample, { variant: "timeout" }) };
exports.SessionExpired = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="sessionExpired" title="Session expired" message="Your previous session is no longer valid." />' } } }, render: () => (0, jsx_runtime_1.jsx)(FeedbackExample, { variant: "sessionExpired" }) };
exports.SessionWarning = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="sessionWarning" title="Session about to expire" message="Your session will expire soon." secondaryLabel="Log out" onSecondary={handleLogout} />' } } }, render: () => (0, jsx_runtime_1.jsx)(FeedbackExample, { variant: "sessionWarning" }) };
exports.BlockedLogin = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="blockedLogin" title="Account locked" message="Please review the support instructions before trying again." />' } } }, render: () => (0, jsx_runtime_1.jsx)(FeedbackExample, { variant: "blockedLogin" }) };
exports.Welcome = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="welcome" title="Welcome!" message="Explore your new conversation space." confirmLabel="Get started" />' } } }, render: () => (0, jsx_runtime_1.jsx)(FeedbackExample, { variant: "welcome" }) };
exports.MaxAttempts = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="maxAttempts" title="Maximum attempts reached" warningMessage="You have exceeded the maximum number of attempts." />' } } }, render: () => (0, jsx_runtime_1.jsx)(FeedbackExample, { variant: "maxAttempts" }) };
exports.UnvalidatedClient = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="unvalidatedClient" title="Unvalidated client" message="Your profile has not been validated yet." secondaryLabel="Go home" onSecondary={handleGoHome} />' } } }, render: () => (0, jsx_runtime_1.jsx)(FeedbackExample, { variant: "unvalidatedClient" }) };
exports.ClientVerified = { parameters: { docs: { source: { code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="clientVerified" title="Verify your data" message="Example Participant" logo={<BrandLogo />} />' } } }, render: () => (0, jsx_runtime_1.jsx)(FeedbackExample, { variant: "clientVerified" }) };
