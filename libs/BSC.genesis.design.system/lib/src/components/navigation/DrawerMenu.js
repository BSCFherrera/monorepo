"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawerMenu = DrawerMenu;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const icons_1 = require("../icons");
const styles_1 = require("./styles");
const LEGACY_MENU_OPTIONS = [
    { route: 'Chat', label: 'Asistente principal', icon: '✦' },
    { route: 'Transactions', label: 'Transacciones', icon: '▦' },
    { route: 'Products', label: 'Productos', icon: '◈' },
    { route: 'Profile', label: 'Editar perfil', icon: '◉' },
];
const LEGACY_CHAT_HISTORIES = [
    { id: 'h1', title: 'Transferencia a contacto', preview: 'Consulta de limite y validacion' },
    { id: 'h2', title: 'Solicitud de tarjeta', preview: 'Documentos para tarjeta de credito' },
    { id: 'h3', title: 'Prestamo personal', preview: 'Plazo y simulacion de cuotas' },
    { id: 'h4', title: 'Actualizacion de datos', preview: 'Cambio de telefono y correo' },
];
function DrawerMenu({ visible, onDismiss, onClose, groups, items, selectedId, history = [], newConversationLabel = '+ New conversation', onNewConversation, logoutLabel = 'Log out', onLogout, footer, title = 'Menu', onNavigate, onOpenHistory, currentRoute, }) {
    const dismiss = onDismiss ?? onClose ?? (() => { });
    const isLegacyRouteMode = !items && !groups && !!onNavigate;
    const panelWidth = Math.min((0, react_native_1.useWindowDimensions)().width * 0.82, 360);
    const [isMounted, setIsMounted] = (0, react_1.useState)(visible);
    const slideX = (0, react_1.useRef)(new react_native_1.Animated.Value(-panelWidth)).current;
    const backdropOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(() => {
        if (visible) {
            if (!isMounted) {
                slideX.setValue(-panelWidth);
                backdropOpacity.setValue(0);
                setIsMounted(true);
                return;
            }
            const animation = react_native_1.Animated.parallel([
                react_native_1.Animated.timing(slideX, { toValue: 0, duration: 260, easing: react_native_1.Easing.out(react_native_1.Easing.cubic), useNativeDriver: true }),
                react_native_1.Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
            ]);
            animation.start();
            return () => animation.stop();
        }
        if (isMounted) {
            let active = true;
            const animation = react_native_1.Animated.parallel([
                react_native_1.Animated.timing(slideX, { toValue: -panelWidth, duration: 220, easing: react_native_1.Easing.in(react_native_1.Easing.cubic), useNativeDriver: true }),
                react_native_1.Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
            ]);
            animation.start(({ finished }) => {
                if (active && finished)
                    setIsMounted(false);
            });
            return () => { active = false; animation.stop(); };
        }
    }, [visible, isMounted, slideX, backdropOpacity, panelWidth]);
    if (!isMounted)
        return null;
    const legacyItems = isLegacyRouteMode
        ? LEGACY_MENU_OPTIONS.map((option) => ({
            id: option.route,
            label: option.label,
            icon: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.drawerOptionLabel, children: option.icon }),
            onPress: () => {
                onNavigate?.(option.route);
                dismiss();
            },
        }))
        : undefined;
    const effectiveItems = items ?? legacyItems;
    const effectiveGroups = groups ?? (isLegacyRouteMode && legacyItems ? [{ title: 'NAVEGACION', items: legacyItems }] : undefined);
    const allItems = effectiveItems ?? effectiveGroups?.flatMap((g) => g.items) ?? [];
    const effectiveSelectedId = selectedId ?? currentRoute;
    const effectiveNewConversationLabel = isLegacyRouteMode ? '+ Nueva conversacion' : newConversationLabel;
    const effectiveNewConversation = isLegacyRouteMode
        ? () => {
            if (onNewConversation)
                onNewConversation();
            else
                onNavigate?.('Chat');
            dismiss();
        }
        : onNewConversation;
    const effectiveHistory = resolveHistory({ history, onOpenHistory, dismiss });
    const effectiveLogout = isLegacyRouteMode
        ? () => {
            if (onLogout)
                onLogout();
            else
                onNavigate?.('Profile');
            dismiss();
        }
        : onLogout;
    const effectiveLogoutLabel = isLegacyRouteMode ? 'Cerrar sesion' : logoutLabel;
    const historySectionLabel = isLegacyRouteMode ? 'CONVERSACIONES' : 'CONVERSATIONS';
    return ((0, jsx_runtime_1.jsx)(react_native_1.Modal, { visible: isMounted, transparent: true, animationType: "none", onRequestClose: dismiss, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles_1.styles.drawerOverlay, children: [(0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [styles_1.styles.drawerBackdrop, { opacity: backdropOpacity }] }), (0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [styles_1.styles.drawerPanel, { width: panelWidth, transform: [{ translateX: slideX }] }], children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles_1.styles.drawerInner, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles_1.styles.drawerHeaderRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.drawerTitle, children: title }), (0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: "Close menu", style: styles_1.styles.drawerCloseButton, onPress: dismiss, children: (0, icons_1.renderFeatherIcon)({ name: 'x', size: 12, color: '#60708A' }) ?? (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.drawerCloseIcon, children: "X" }) })] }), (0, jsx_runtime_1.jsxs)(react_native_1.ScrollView, { showsVerticalScrollIndicator: false, style: { flex: 1 }, children: [effectiveGroups
                                        ? effectiveGroups.map((group, gi) => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles_1.styles.drawerSection, children: [group.title && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.drawerSectionLabel, children: group.title }), group.items.map((item) => ((0, jsx_runtime_1.jsx)(DrawerItem, { item: item, selected: item.id === effectiveSelectedId }, item.id)))] }, gi)))
                                        : allItems.map((item) => ((0, jsx_runtime_1.jsx)(DrawerItem, { item: item, selected: item.id === effectiveSelectedId }, item.id))), effectiveNewConversation && ((0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", style: styles_1.styles.drawerNewChatButton, onPress: effectiveNewConversation, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.drawerNewChatText, children: effectiveNewConversationLabel }) })), effectiveHistory.length > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles_1.styles.drawerDivider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.drawerSectionLabel, children: historySectionLabel }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles_1.styles.drawerSection, children: effectiveHistory.map((h) => ((0, jsx_runtime_1.jsxs)(react_native_1.Pressable, { accessibilityRole: "button", style: styles_1.styles.drawerHistoryRow, onPress: h.onPress, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.drawerHistoryTitle, children: h.title }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.drawerHistoryPreview, children: h.preview })] }, h.id))) })] }))] }), effectiveLogout && ((0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", style: styles_1.styles.drawerLogoutRow, onPress: effectiveLogout, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles_1.styles.drawerLogoutLabel, children: effectiveLogoutLabel }) })), footer] }) }), (0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: "Dismiss menu", style: styles_1.styles.drawerBackdropTap, onPress: dismiss })] }) }));
}
function resolveHistory({ history, onOpenHistory, dismiss, }) {
    if (history.length > 0) {
        return history.map((item) => ({
            ...item,
            onPress: item.onPress ?? (() => {
                onOpenHistory?.(item);
                dismiss();
            }),
        }));
    }
    if (!onOpenHistory)
        return history;
    return LEGACY_CHAT_HISTORIES.map((item) => ({
        ...item,
        onPress: () => {
            onOpenHistory(item);
            dismiss();
        },
    }));
}
function DrawerItem({ item, selected }) {
    return ((0, jsx_runtime_1.jsxs)(react_native_1.Pressable, { accessibilityRole: "button", accessibilityLabel: item.label, accessibilityState: { disabled: !!item.disabled, selected }, disabled: item.disabled, onPress: item.disabled ? undefined : item.onPress, style: [styles_1.styles.drawerOptionRow, selected ? styles_1.styles.drawerOptionRowActive : undefined], children: [item.icon, (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles_1.styles.drawerOptionLabel, selected ? styles_1.styles.drawerOptionLabelActive : undefined], children: item.label })] }));
}
