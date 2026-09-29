"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisclaimerModal = exports.TermsAndConditionsModal = exports.TimoutErrorModal = exports.OnboardingClientVerifiedModal = exports.ProofOfLifeSuccessModal = exports.ModalErrorUserBlockedLogin = exports.WelcomeModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const common_1 = require("../common");
const icons_1 = require("../../icons");
const tokens_1 = require("../../../tokens");
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer composing ModalCommon or FeedbackModal for new flows.
 */
exports.WelcomeModal = (0, react_1.forwardRef)(function WelcomeModal({ onAccessChat, closeLabel = 'Close', ...props }, ref) {
    return (0, jsx_runtime_1.jsxs)(common_1.ModalCommon, { visible: props.visible, defaultVisible: props.defaultVisible, onOpenChange: props.onOpenChange, onClose: props.onClose, closeOnBackdropPress: props.canDismiss, bottomInset: props.bottomInset, actions: props.actions, ref: ref, children: [(0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: closeLabel, accessibilityState: { disabled: props.canDismiss === false }, disabled: props.canDismiss === false, onPress: props.canDismiss === false ? undefined : props.onClose, style: styles.welcomeClose, children: (0, icons_1.renderFeatherIcon)({ name: 'x', size: 24, color: tokens_1.tokens.colors.textDisabled }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.welcomeIcon, children: props.illustration ?? (0, icons_1.renderFeatherIcon)({ name: 'message-circle', size: 32, color: tokens_1.tokens.colors.primary }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.welcomeTitle, children: props.title }), props.message != null && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.dialogBody, children: props.message }), props.children, props.showConfirm !== false && (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: props.confirmLabel ?? 'Continue', loading: props.loading, onPress: onAccessChat, style: { width: '100%' } })] });
});
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer the blockedLogin FeedbackModal variant for new flows.
 */
exports.ModalErrorUserBlockedLogin = (0, react_1.forwardRef)(function ModalErrorUserBlockedLogin(props, ref) {
    return (0, jsx_runtime_1.jsxs)(common_1.ModalCommon, { visible: props.visible, defaultVisible: props.defaultVisible, onOpenChange: props.onOpenChange, onClose: props.onClose, closeOnBackdropPress: props.canDismiss, bottomInset: props.bottomInset, actions: props.actions, ref: ref, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.blockedCircle, children: props.illustration ?? (0, icons_1.renderFeatherIcon)({ name: 'lock', size: 32, color: tokens_1.tokens.colors.error }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.blockedTitle, children: props.title }), props.message != null && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.dialogBody, children: props.message }), props.children, props.showConfirm !== false && (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: props.confirmLabel ?? 'Continue', loading: props.loading, onPress: props.onConfirm ?? props.onClose, style: { width: '100%' } })] });
});
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer SuccessModal for the shared success layout.
 */
exports.ProofOfLifeSuccessModal = (0, react_1.forwardRef)(function ProofOfLifeSuccessModal({ onContinue, ...props }, ref) {
    return (0, jsx_runtime_1.jsx)(common_1.SuccessModal, { ...props, onClose: onContinue, onConfirm: onContinue, ref: ref });
});
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer ClientVerifiedModal for new client-verification flows.
 */
exports.OnboardingClientVerifiedModal = (0, react_1.forwardRef)(function OnboardingClientVerifiedModal({ serviceError, ...props }, ref) {
    // One active surface avoids stacking two native Modal controllers on iOS.
    return serviceError?.visible ? (0, jsx_runtime_1.jsx)(common_1.ErrorServiceGeneral, { ...serviceError, ref: ref }) : (0, jsx_runtime_1.jsx)(common_1.ClientVerifiedModal, { ...props, ref: ref });
});
/**
 * @deprecated Typo compatibility alias. Prefer TimeoutErrorModal for new code.
 */
exports.TimoutErrorModal = common_1.TimeoutErrorModal;
exports.TermsAndConditionsModal = (0, react_1.forwardRef)(function TermsAndConditionsModal({ visible, defaultVisible, onOpenChange, onClose, title, content, acceptLabel = 'Accept', onAccept, closeLabel = 'Close', bottomInset, canDismiss = true, actions, showAccept = true }, ref) {
    const { height } = (0, react_native_1.useWindowDimensions)();
    return (0, jsx_runtime_1.jsxs)(common_1.ModalCommon, { visible: visible, defaultVisible: defaultVisible, onOpenChange: onOpenChange, onClose: onClose, bottomInset: bottomInset, closeOnBackdropPress: canDismiss, actions: actions, ref: ref, children: [(0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: closeLabel, accessibilityState: { disabled: !canDismiss }, disabled: !canDismiss, onPress: canDismiss ? onClose : undefined, style: styles.close, children: (0, icons_1.renderFeatherIcon)({ name: 'x', size: 24, color: tokens_1.tokens.colors.text }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.termsTitle, children: title }), (0, jsx_runtime_1.jsx)(react_native_1.ScrollView, { style: { maxHeight: height * 0.5 }, showsVerticalScrollIndicator: false, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.termsBody, children: content }) }), showAccept && (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: acceptLabel, onPress: onAccept, style: { width: '100%', marginTop: 24 } })] });
});
exports.DisclaimerModal = (0, react_1.forwardRef)(function DisclaimerModal({ visible, defaultVisible, onOpenChange, onClose, onBack, onContinue, title, subtitle, logo, logoSource, requirements, continueLabel = 'Continue', exitLabel = 'Exit', backLabel = 'Back', bottomInset, canDismiss = true, children, actions, showContinue = true }, ref) {
    return (0, jsx_runtime_1.jsxs)(common_1.ModalCommon, { visible: visible, defaultVisible: defaultVisible, onOpenChange: onOpenChange, onClose: onClose, bottomInset: bottomInset, closeOnBackdropPress: canDismiss, actions: actions, ref: ref, children: [(0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: backLabel, onPress: onBack, style: styles.back, children: (0, icons_1.renderFeatherIcon)({ name: 'arrow-left', size: 24, color: tokens_1.tokens.colors.text }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.logo, children: logo ?? (logoSource && (0, jsx_runtime_1.jsx)(react_native_1.Image, { source: logoSource, style: { width: 120, height: 60 }, resizeMode: "contain" })) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.title, children: title }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.subtitle, children: subtitle }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.list, children: requirements.map((item, index) => (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.requirement, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.icon, children: item.icon ?? (0, icons_1.renderFeatherIcon)({ name: item.iconName ?? 'info', size: 24, color: tokens_1.tokens.colors.primary }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.label, numberOfLines: 1, children: item.label })] }, index)) }), children, showContinue && (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: continueLabel, onPress: onContinue, style: { width: '100%' } }), (0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", onPress: onBack, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.exit, children: exitLabel }) })] });
});
const styles = react_native_1.StyleSheet.create({
    welcomeClose: { alignSelf: 'flex-end', marginTop: 8 },
    welcomeIcon: { alignSelf: 'center', width: 64, height: 64, borderRadius: 16, backgroundColor: '#EAF0FE', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    welcomeTitle: { fontSize: 18, fontWeight: '700', color: tokens_1.tokens.colors.text, textAlign: 'center', marginBottom: 8 },
    dialogBody: { fontSize: 14, color: tokens_1.tokens.colors.textSecondary, lineHeight: 20, textAlign: 'center', marginBottom: 24 },
    blockedCircle: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: '#FDECEC', justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 24 },
    blockedTitle: { fontSize: 18, fontWeight: '700', color: tokens_1.tokens.colors.text, textAlign: 'center', marginBottom: 24, paddingHorizontal: 48 },
    close: { width: 32, height: 32, borderRadius: 16, backgroundColor: tokens_1.tokens.colors.backgroundDark, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' },
    termsTitle: { fontSize: 16, fontWeight: '700', color: tokens_1.tokens.colors.text, marginVertical: 8 },
    termsBody: { fontSize: 12, color: tokens_1.tokens.colors.text, lineHeight: 20, textAlign: 'justify' },
    back: { width: 40, height: 40, borderRadius: 20, backgroundColor: tokens_1.tokens.colors.backgroundDark, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
    logo: { width: 120, height: 60, alignSelf: 'center', marginBottom: 16 },
    title: { fontSize: 24, fontWeight: '700', color: tokens_1.tokens.colors.text },
    subtitle: { color: tokens_1.tokens.colors.textSecondary, marginTop: 4, marginBottom: 16 },
    list: { width: '100%', paddingVertical: 16, gap: 12 },
    requirement: { width: '100%', backgroundColor: '#F6FBFF', borderWidth: 1, borderColor: '#dbeafe', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingVertical: 24, paddingHorizontal: 12 },
    icon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    label: { flex: 1, color: tokens_1.tokens.colors.text, fontWeight: '700', fontSize: 16, textAlign: 'left' },
    exit: { color: tokens_1.tokens.colors.textSecondary, fontWeight: '700', fontSize: 16, textAlign: 'center', paddingVertical: 16 },
});
