"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisclaimerModal = exports.TermsAndConditionsModal = exports.TimoutErrorModal = exports.OnboardingClientVerifiedModal = exports.ProofOfLifeSuccessModal = exports.ModalErrorUserBlockedLogin = exports.WelcomeModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const common_1 = require("../common");
const icons_1 = require("../../icons");
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer composing ModalCommon or FeedbackModal for new flows.
 */
exports.WelcomeModal = (0, react_1.forwardRef)(function WelcomeModal({ onAccessChat, closeLabel = 'Close', ...props }, ref) {
    return (0, jsx_runtime_1.jsxs)(common_1.ModalCommon, { visible: props.visible, defaultVisible: props.defaultVisible, onOpenChange: props.onOpenChange, onClose: props.onClose, closeOnBackdropPress: props.canDismiss, bottomInset: props.bottomInset, actions: props.actions, ref: ref, children: [(0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: closeLabel, accessibilityState: { disabled: props.canDismiss === false }, disabled: props.canDismiss === false, onPress: props.canDismiss === false ? undefined : props.onClose, style: styles.welcomeClose, children: (0, icons_1.renderFeatherIcon)({ name: 'x', size: 24, color: ui_native_1.BscColors.textTertiary }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.welcomeIcon, children: props.illustration ?? (0, icons_1.renderFeatherIcon)({ name: 'message-circle', size: 32, color: ui_native_1.BscColors.primary }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.welcomeTitle, children: props.title }), props.message != null && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.dialogBody, children: props.message }), props.children, props.showConfirm !== false && (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: props.confirmLabel ?? 'Continue', loading: props.loading, onPress: onAccessChat, style: { width: '100%' } })] });
});
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer the blockedLogin FeedbackModal variant for new flows.
 */
exports.ModalErrorUserBlockedLogin = (0, react_1.forwardRef)(function ModalErrorUserBlockedLogin(props, ref) {
    return (0, jsx_runtime_1.jsxs)(common_1.ModalCommon, { visible: props.visible, defaultVisible: props.defaultVisible, onOpenChange: props.onOpenChange, onClose: props.onClose, closeOnBackdropPress: props.canDismiss, bottomInset: props.bottomInset, actions: props.actions, ref: ref, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.blockedCircle, children: props.illustration ?? (0, icons_1.renderFeatherIcon)({ name: 'lock', size: 32, color: ui_native_1.BscColors.error }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.blockedTitle, children: props.title }), props.message != null && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.dialogBody, children: props.message }), props.children, props.showConfirm !== false && (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: props.confirmLabel ?? 'Continue', loading: props.loading, onPress: props.onConfirm ?? props.onClose, style: { width: '100%' } })] });
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
    return (0, jsx_runtime_1.jsxs)(common_1.ModalCommon, { visible: visible, defaultVisible: defaultVisible, onOpenChange: onOpenChange, onClose: onClose, bottomInset: bottomInset, closeOnBackdropPress: canDismiss, actions: actions, ref: ref, children: [(0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: closeLabel, accessibilityState: { disabled: !canDismiss }, disabled: !canDismiss, onPress: canDismiss ? onClose : undefined, style: styles.close, children: (0, icons_1.renderFeatherIcon)({ name: 'x', size: 24, color: ui_native_1.BscColors.textPrimary }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.termsTitle, children: title }), (0, jsx_runtime_1.jsx)(react_native_1.ScrollView, { style: { maxHeight: height * 0.5 }, showsVerticalScrollIndicator: false, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.termsBody, children: content }) }), showAccept && (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: acceptLabel, onPress: onAccept, style: { width: '100%', marginTop: 24 } })] });
});
exports.DisclaimerModal = (0, react_1.forwardRef)(function DisclaimerModal({ visible, defaultVisible, onOpenChange, onClose, onBack, onContinue, title, subtitle, logo, logoSource, requirements, continueLabel = 'Continue', exitLabel = 'Exit', backLabel = 'Back', bottomInset, canDismiss = true, children, actions, showContinue = true }, ref) {
    return (0, jsx_runtime_1.jsxs)(common_1.ModalCommon, { visible: visible, defaultVisible: defaultVisible, onOpenChange: onOpenChange, onClose: onClose, bottomInset: bottomInset, closeOnBackdropPress: canDismiss, actions: actions, ref: ref, children: [(0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: backLabel, onPress: onBack, style: styles.back, children: (0, icons_1.renderFeatherIcon)({ name: 'arrow-left', size: 24, color: ui_native_1.BscColors.textPrimary }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.logo, children: logo ?? (logoSource && (0, jsx_runtime_1.jsx)(react_native_1.Image, { source: logoSource, style: { width: 120, height: 60 }, resizeMode: "contain" })) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.title, children: title }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.subtitle, children: subtitle }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.list, children: requirements.map((item, index) => (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.requirement, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.icon, children: item.icon ?? (0, icons_1.renderFeatherIcon)({ name: item.iconName ?? 'info', size: 24, color: ui_native_1.BscColors.primary }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.label, numberOfLines: 1, children: item.label })] }, index)) }), children, showContinue && (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: continueLabel, onPress: onContinue, style: { width: '100%' } }), (0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", onPress: onBack, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.exit, children: exitLabel }) })] });
});
const styles = react_native_1.StyleSheet.create({
    welcomeClose: { alignSelf: 'flex-end', marginTop: ui_native_1.BscSpacing.xs },
    welcomeIcon: { alignSelf: 'center', width: 64, height: 64, borderRadius: ui_native_1.BscRadius.md, backgroundColor: '#EAF0FE', justifyContent: 'center', alignItems: 'center', marginBottom: ui_native_1.BscSpacing.md },
    welcomeTitle: { ...ui_native_1.BscTextStyles['Body L/18 Bold'], color: ui_native_1.BscColors.textPrimary, textAlign: 'center', marginBottom: ui_native_1.BscSpacing.xs },
    dialogBody: { ...ui_native_1.BscTextStyles['Body S/14 Regular'], color: ui_native_1.BscColors.textSecondary, textAlign: 'center', marginBottom: ui_native_1.BscSpacing.xl },
    blockedCircle: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: '#FDECEC', justifyContent: 'center', alignItems: 'center', marginTop: ui_native_1.BscSpacing.md, marginBottom: ui_native_1.BscSpacing.xl },
    blockedTitle: { ...ui_native_1.BscTextStyles['Body L/18 Bold'], color: ui_native_1.BscColors.textPrimary, textAlign: 'center', marginBottom: ui_native_1.BscSpacing.xl, paddingHorizontal: 48 },
    close: { width: 32, height: 32, borderRadius: ui_native_1.BscRadius.md, backgroundColor: ui_native_1.BscColors.surfaceMuted, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' },
    termsTitle: { ...ui_native_1.BscTextStyles['Body M/16 Bold'], color: ui_native_1.BscColors.textPrimary, marginVertical: ui_native_1.BscSpacing.xs },
    termsBody: { ...ui_native_1.BscTextStyles['Caption/12 Regular'], color: ui_native_1.BscColors.textPrimary, textAlign: 'justify' },
    back: { width: 40, height: 40, borderRadius: 20, backgroundColor: ui_native_1.BscColors.surfaceMuted, justifyContent: 'center', alignItems: 'center', marginTop: ui_native_1.BscSpacing.xs },
    logo: { width: 120, height: 60, alignSelf: 'center', marginBottom: ui_native_1.BscSpacing.md },
    title: { ...ui_native_1.BscTextStyles['Heading M/24 Bold'], color: ui_native_1.BscColors.textPrimary },
    subtitle: { ...ui_native_1.BscTextStyles['Body S/14 Regular'], color: ui_native_1.BscColors.textSecondary, marginTop: ui_native_1.BscSpacing.xxs, marginBottom: ui_native_1.BscSpacing.md },
    list: { width: '100%', paddingVertical: ui_native_1.BscSpacing.md, gap: ui_native_1.BscSpacing.sm },
    requirement: { width: '100%', backgroundColor: '#F6FBFF', borderWidth: 1, borderColor: '#dbeafe', borderRadius: ui_native_1.BscRadius.md, flexDirection: 'row', alignItems: 'center', paddingVertical: ui_native_1.BscSpacing.xl, paddingHorizontal: ui_native_1.BscSpacing.sm },
    icon: { width: 32, height: 32, borderRadius: ui_native_1.BscRadius.md, backgroundColor: ui_native_1.BscColors.surface, justifyContent: 'center', alignItems: 'center', marginRight: ui_native_1.BscSpacing.sm },
    label: { ...ui_native_1.BscTextStyles['Body M/16 Bold'], flex: 1, color: ui_native_1.BscColors.textPrimary, textAlign: 'left' },
    exit: { ...ui_native_1.BscTextStyles['Body M/16 Bold'], color: ui_native_1.BscColors.textSecondary, textAlign: 'center', paddingVertical: ui_native_1.BscSpacing.md },
});
