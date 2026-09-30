import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { renderFeatherIcon } from '../icons';
import { styles } from './styles';
import type { DrawerMenuHistoryItem, DrawerMenuItem, DrawerMenuLegacyHistoryItem, DrawerMenuProps, DrawerMenuRoute } from './types';

const LEGACY_MENU_OPTIONS: Array<{ route: DrawerMenuRoute; label: string; icon: string }> = [
  { route: 'Chat', label: 'Asistente principal', icon: '✦' },
  { route: 'Transactions', label: 'Transacciones', icon: '▦' },
  { route: 'Products', label: 'Productos', icon: '◈' },
  { route: 'Profile', label: 'Editar perfil', icon: '◉' },
];

const LEGACY_CHAT_HISTORIES: DrawerMenuLegacyHistoryItem[] = [
  { id: 'h1', title: 'Transferencia a contacto', preview: 'Consulta de limite y validacion' },
  { id: 'h2', title: 'Solicitud de tarjeta', preview: 'Documentos para tarjeta de credito' },
  { id: 'h3', title: 'Prestamo personal', preview: 'Plazo y simulacion de cuotas' },
  { id: 'h4', title: 'Actualizacion de datos', preview: 'Cambio de telefono y correo' },
];

export function DrawerMenu({
  visible,
  onDismiss,
  onClose,
  groups,
  items,
  selectedId,
  history = [],
  newConversationLabel = '+ New conversation',
  onNewConversation,
  logoutLabel = 'Log out',
  onLogout,
  footer,
  title = 'Menu',
  onNavigate,
  onOpenHistory,
  currentRoute,
}: DrawerMenuProps) {
  const dismiss = onDismiss ?? onClose ?? (() => {});
  const isLegacyRouteMode = !items && !groups && !!onNavigate;
  const panelWidth = Math.min(useWindowDimensions().width * 0.82, 360);
  const [isMounted, setIsMounted] = useState(visible);
  const slideX = useRef(new Animated.Value(-panelWidth)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (!isMounted) {
        slideX.setValue(-panelWidth);
        backdropOpacity.setValue(0);
        setIsMounted(true);
        return;
      }
      const animation = Animated.parallel([
        Animated.timing(slideX, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]);
      animation.start();
      return () => animation.stop();
    }
    if (isMounted) {
      let active = true;
      const animation = Animated.parallel([
        Animated.timing(slideX, { toValue: -panelWidth, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]);
      animation.start(({ finished }) => {
        if (active && finished) setIsMounted(false);
      });
      return () => { active = false; animation.stop(); };
    }
  }, [visible, isMounted, slideX, backdropOpacity, panelWidth]);

  if (!isMounted) return null;

  const legacyItems = isLegacyRouteMode
    ? LEGACY_MENU_OPTIONS.map<DrawerMenuItem>((option) => ({
        id: option.route,
        label: option.label,
        icon: <Text style={styles.drawerOptionLabel}>{option.icon}</Text>,
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
        if (onNewConversation) onNewConversation();
        else onNavigate?.('Chat');
        dismiss();
      }
    : onNewConversation;
  const effectiveHistory = resolveHistory({ history, onOpenHistory, dismiss });
  const effectiveLogout = isLegacyRouteMode
    ? () => {
        if (onLogout) onLogout();
        else onNavigate?.('Profile');
        dismiss();
      }
    : onLogout;
  const effectiveLogoutLabel = isLegacyRouteMode ? 'Cerrar sesion' : logoutLabel;
  const historySectionLabel = isLegacyRouteMode ? 'CONVERSACIONES' : 'CONVERSATIONS';

  return (
    <Modal visible={isMounted} transparent animationType="none" onRequestClose={dismiss}>
      <View style={styles.drawerOverlay}>
        <Animated.View style={[styles.drawerBackdrop, { opacity: backdropOpacity }]} />
        <Animated.View style={[styles.drawerPanel, { width: panelWidth, transform: [{ translateX: slideX }] }]}>
          <View style={styles.drawerInner}>
            <View style={styles.drawerHeaderRow}>
              <Text style={styles.drawerTitle}>{title}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close menu" style={styles.drawerCloseButton} onPress={dismiss}>
                {renderFeatherIcon({ name: 'x', size: 12, color: '#60708A' }) ?? <Text style={styles.drawerCloseIcon}>X</Text>}
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {effectiveGroups
                ? effectiveGroups.map((group, gi) => (
                    <View key={gi} style={styles.drawerSection}>
                      {group.title && <Text style={styles.drawerSectionLabel}>{group.title}</Text>}
                      {group.items.map((item) => (
                        <DrawerItem key={item.id} item={item} selected={item.id === effectiveSelectedId} />
                      ))}
                    </View>
                  ))
                : allItems.map((item) => (
                    <DrawerItem key={item.id} item={item} selected={item.id === effectiveSelectedId} />
                  ))}

              {effectiveNewConversation && (
                <Pressable accessibilityRole="button" style={styles.drawerNewChatButton} onPress={effectiveNewConversation}>
                  <Text style={styles.drawerNewChatText}>{effectiveNewConversationLabel}</Text>
                </Pressable>
              )}

              {effectiveHistory.length > 0 && (
                <>
                  <View style={styles.drawerDivider} />
                  <Text style={styles.drawerSectionLabel}>{historySectionLabel}</Text>
                  <View style={styles.drawerSection}>
                    {effectiveHistory.map((h) => (
                      <Pressable accessibilityRole="button" key={h.id} style={styles.drawerHistoryRow} onPress={h.onPress}>
                        <Text style={styles.drawerHistoryTitle}>{h.title}</Text>
                        <Text style={styles.drawerHistoryPreview}>{h.preview}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            {effectiveLogout && (
              <Pressable accessibilityRole="button" style={styles.drawerLogoutRow} onPress={effectiveLogout}>
                <Text style={styles.drawerLogoutLabel}>{effectiveLogoutLabel}</Text>
              </Pressable>
            )}
            {footer}
          </View>
        </Animated.View>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss menu" style={styles.drawerBackdropTap} onPress={dismiss} />
      </View>
    </Modal>
  );
}

function resolveHistory({
  history,
  onOpenHistory,
  dismiss,
}: {
  history: readonly DrawerMenuHistoryItem[];
  onOpenHistory?: (history: DrawerMenuLegacyHistoryItem) => void;
  dismiss: () => void;
}): readonly DrawerMenuHistoryItem[] {
  if (history.length > 0) {
    return history.map((item) => ({
      ...item,
      onPress: item.onPress ?? (() => {
        onOpenHistory?.(item);
        dismiss();
      }),
    }));
  }

  if (!onOpenHistory) return history;

  return LEGACY_CHAT_HISTORIES.map((item) => ({
    ...item,
    onPress: () => {
      onOpenHistory(item);
      dismiss();
    },
  }));
}

function DrawerItem({ item, selected }: { item: DrawerMenuItem; selected?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ disabled: !!item.disabled, selected }}
      disabled={item.disabled}
      onPress={item.disabled ? undefined : item.onPress}
      style={[styles.drawerOptionRow, selected ? styles.drawerOptionRowActive : undefined]}
    >
      {item.icon}
      <Text style={[styles.drawerOptionLabel, selected ? styles.drawerOptionLabelActive : undefined]}>
        {item.label}
      </Text>
    </Pressable>
  );
}
