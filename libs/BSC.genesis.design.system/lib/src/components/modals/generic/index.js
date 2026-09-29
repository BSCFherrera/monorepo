"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackModal = exports.ContentModal = exports.BottomSheetModal = exports.CenteredModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const common_1 = require("../common");
const onboarding_1 = require("../onboarding");
var surfaces_1 = require("../surfaces");
Object.defineProperty(exports, "CenteredModal", { enumerable: true, get: function () { return surfaces_1.CenteredModal; } });
Object.defineProperty(exports, "BottomSheetModal", { enumerable: true, get: function () { return surfaces_1.BottomSheetModal; } });
/**
 * @deprecated Compatibility adapter. Prefer TermsAndConditionsModal or DisclaimerModal for named content flows.
 */
exports.ContentModal = (0, react_1.forwardRef)(function ContentModal({ visible, defaultVisible, onOpenChange, onDismiss, canDismiss = true, children, actions, title = '', variant = 'terms', closeLabel = 'Close', acceptLabel = 'Accept', onAccept, bottomInset, subtitle = '', requirements = [], logo, logoSource, onExit, exitLabel }, ref) {
    const dismiss = onDismiss ?? (() => { });
    const guardedDismiss = () => { if (canDismiss)
        dismiss(); };
    if (variant === 'disclaimer') {
        return (0, jsx_runtime_1.jsx)(onboarding_1.DisclaimerModal, { visible: visible, defaultVisible: defaultVisible, onOpenChange: onOpenChange, onClose: dismiss, canDismiss: canDismiss, onBack: onExit ?? guardedDismiss, onContinue: onAccept ?? (() => { }), title: title, subtitle: subtitle, requirements: requirements, logo: logo, logoSource: logoSource, continueLabel: acceptLabel, exitLabel: exitLabel, bottomInset: bottomInset, actions: actions, showContinue: !!onAccept, ref: ref, children: children });
    }
    return (0, jsx_runtime_1.jsx)(onboarding_1.TermsAndConditionsModal, { visible: visible, defaultVisible: defaultVisible, onOpenChange: onOpenChange, onClose: dismiss, canDismiss: canDismiss, onAccept: onAccept ?? (() => { }), title: title, content: children, ref: ref, closeLabel: closeLabel, acceptLabel: acceptLabel, bottomInset: bottomInset, actions: actions, showAccept: !!onAccept });
});
/** Preserve generic callbacks and slots without keeping a second visual implementation. */
exports.FeedbackModal = (0, react_1.forwardRef)(function FeedbackModal({ variant = 'info', visible, defaultVisible, onOpenChange, onDismiss, canDismiss = true, title, message, icon, iconName, iconColor, iconSize, children, actions, confirmLabel = 'Continue', onConfirm, confirming, secondaryLabel, onSecondary, warningMessage, subtitle, bottomInset, illustrationSource, logo, logoSource, details, detailLabel = '', serviceError, closeLabel }, ref) {
    const props = {
        visible, defaultVisible, onOpenChange, onClose: onDismiss ?? (() => { }), canDismiss, title, message, illustration: icon, iconName, iconColor, iconSize,
        illustrationSource, children, actions, confirmLabel, onConfirm, loading: confirming,
        bottomInset, showConfirm: !!onConfirm, showSecondary: !!(onSecondary && secondaryLabel),
    };
    switch (variant) {
        case 'service': return (0, jsx_runtime_1.jsx)(common_1.ErrorServiceGeneral, { ...props, ref: ref });
        case 'contact': return (0, jsx_runtime_1.jsx)(common_1.ErrorGeneral, { ...props, ref: ref });
        case 'userData': return (0, jsx_runtime_1.jsx)(common_1.ErrorUserWithoutData, { ...props, ref: ref });
        case 'maxAttempts': return (0, jsx_runtime_1.jsx)(common_1.MaximumIntentsModal, { ...props, warningMessage: warningMessage, ref: ref });
        case 'unvalidatedClient': return (0, jsx_runtime_1.jsx)(common_1.NotValidatedClientModal, { ...props, secondaryLabel: secondaryLabel ?? '', onSecondary: onSecondary ?? (() => { }), ref: ref });
        case 'timeout': return (0, jsx_runtime_1.jsx)(common_1.TimeoutErrorModal, { ...props, ref: ref });
        case 'success': return (0, jsx_runtime_1.jsx)(common_1.SuccessModal, { ...props, ref: ref });
        case 'sessionExpired': return (0, jsx_runtime_1.jsx)(common_1.SessionExpiredModal, { ...props, ref: ref });
        case 'sessionWarning': return (0, jsx_runtime_1.jsx)(common_1.WarningSessionModal, { ...props, secondaryLabel: secondaryLabel ?? '', onSecondary: onSecondary ?? (() => { }), ref: ref });
        case 'blockedLogin': return (0, jsx_runtime_1.jsx)(onboarding_1.ModalErrorUserBlockedLogin, { ...props, ref: ref });
        case 'welcome': return (0, jsx_runtime_1.jsx)(onboarding_1.WelcomeModal, { ...props, onAccessChat: onConfirm ?? (() => { }), closeLabel: closeLabel, ref: ref });
        case 'clientVerified': return (0, jsx_runtime_1.jsxs)(onboarding_1.OnboardingClientVerifiedModal, { ...props, message: subtitle, logo: logo, logoSource: logoSource, details: details ?? (typeof message === 'string' && message ? [{ label: detailLabel, value: message }] : []), secondaryLabel: secondaryLabel ?? '', onSecondary: onSecondary ?? (() => { }), serviceError: serviceError, ref: ref, children: [typeof message !== 'string' && message, children] });
        default: return (0, jsx_runtime_1.jsx)(common_1.ErrorGeneric, { ...props, ref: ref });
    }
});
