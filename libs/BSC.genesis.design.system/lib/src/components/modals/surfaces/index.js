"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BottomSheetModal = exports.CenteredModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const useKeyboardOffset_1 = require("../../../hooks/useKeyboardOffset");
function useModalVisibility({ visible, defaultVisible = false, onOpenChange, onDismiss }) {
    const [internalVisible, setInternalVisible] = (0, react_1.useState)(defaultVisible);
    const isControlled = visible !== undefined;
    const currentVisible = isControlled ? visible : internalVisible;
    const setVisible = (0, react_1.useCallback)((nextVisible, notifyDismiss = false) => {
        if (!isControlled)
            setInternalVisible(nextVisible);
        if (currentVisible !== nextVisible)
            onOpenChange?.(nextVisible);
        if (notifyDismiss && currentVisible)
            onDismiss?.();
    }, [currentVisible, isControlled, onDismiss, onOpenChange]);
    return { visible: currentVisible, setVisible };
}
// Keep surfaces below recipes in the dependency graph: no circular dialog imports.
const ModalSurface = (0, react_1.forwardRef)(function ModalSurface({ centered, visible: controlledVisible, defaultVisible, onOpenChange, onDismiss, canDismiss = true, animationType, contentStyle, title, children, actions, bottomInset = 0 }, ref) {
    const { visible, setVisible } = useModalVisibility({ visible: controlledVisible, defaultVisible, onOpenChange, onDismiss });
    const keyboardOffset = (0, useKeyboardOffset_1.useKeyboardOffset)(visible);
    const close = (0, react_1.useCallback)(() => setVisible(false, true), [setVisible]);
    const dismiss = () => { if (canDismiss)
        close(); };
    (0, react_1.useImperativeHandle)(ref, () => ({
        open: () => setVisible(true),
        close,
        toggle: nextVisible => setVisible(nextVisible ?? !visible, nextVisible === false || (nextVisible === undefined && visible)),
        isOpen: () => visible,
    }), [close, setVisible, visible]);
    return (0, jsx_runtime_1.jsx)(react_native_1.Modal, { visible: visible, transparent: true, animationType: animationType ?? (centered ? 'fade' : 'slide'), onRequestClose: dismiss, statusBarTranslucent: true, children: (0, jsx_runtime_1.jsx)(react_native_1.Pressable, { testID: "modal-backdrop", style: [styles.backdrop, centered ? styles.centeredBackdrop : styles.sheetBackdrop], onPress: e => { e?.stopPropagation?.(); dismiss(); }, children: (0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [styles.keyboardAvoiding, centered && styles.centeredKeyboardAvoiding, { paddingBottom: keyboardOffset }], children: (0, jsx_runtime_1.jsxs)(react_native_1.Pressable, { style: [centered ? styles.centeredContent : styles.sheetContent, { paddingBottom: (centered ? 20 : 16) + bottomInset }, contentStyle], onPress: e => e?.stopPropagation?.(), children: [title && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.title, children: title }), children, actions] }) }) }) });
});
exports.CenteredModal = (0, react_1.forwardRef)(function CenteredModal(props, ref) { return (0, jsx_runtime_1.jsx)(ModalSurface, { ...props, centered: true, ref: ref }); });
exports.BottomSheetModal = (0, react_1.forwardRef)(function BottomSheetModal({ visible, defaultVisible, onOpenChange, onDismiss, canDismiss = true, title = '', children, actions, footer, footnote, maxHeightFactor, testID }, ref) {
    const sheetRef = (0, react_1.useRef)(null);
    (0, react_1.useImperativeHandle)(ref, () => ({
        open: () => sheetRef.current?.open(),
        close: () => sheetRef.current?.close(),
        toggle: nextVisible => sheetRef.current?.toggle(nextVisible),
        isOpen: () => sheetRef.current?.isOpen() ?? false,
    }), []);
    return (0, jsx_runtime_1.jsxs)(ui_native_1.BscSheet, { ref: sheetRef, visible: visible, defaultVisible: defaultVisible, onOpenChange: onOpenChange, onClose: onDismiss, canDismiss: canDismiss, title: title, footnote: footnote, footer: footer, maxHeightFactor: maxHeightFactor, testID: testID, children: [children, actions] });
});
const styles = react_native_1.StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: (0, ui_native_1.withAlpha)(ui_native_1.BscColors.primaryDeep, 0.45) },
    centeredBackdrop: { justifyContent: 'center', alignItems: 'center', padding: ui_native_1.BscSpacing.lg },
    sheetBackdrop: { justifyContent: 'flex-end' },
    keyboardAvoiding: { width: '100%' },
    centeredKeyboardAvoiding: { alignItems: 'center' },
    centeredContent: { backgroundColor: ui_native_1.BscColors.surface, borderRadius: ui_native_1.BscRadius.sheet, padding: ui_native_1.BscSpacing.lg, maxWidth: '100%' },
    sheetContent: { backgroundColor: ui_native_1.BscColors.surface, borderTopLeftRadius: ui_native_1.BscRadius.sheet, borderTopRightRadius: ui_native_1.BscRadius.sheet, paddingHorizontal: ui_native_1.BscSpacing.lg, paddingTop: ui_native_1.BscSpacing.sm, width: '100%' },
    title: { ...ui_native_1.BscTextStyles['Body M/16 Bold'], color: ui_native_1.BscColors.textPrimary },
});
