import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';
import { BscTextStyles, BscTypography } from '../theme/typography';
import { BscIcon } from './BscIcon';

export interface BscDrawerMenuGroup {
  title?: string;
  items: readonly BscDrawerMenuItem[];
}

export interface BscDrawerMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

export interface BscDrawerMenuHistoryItem {
  id: string;
  title: string;
  preview: string;
  onPress?: () => void;
}

export type BscDrawerMenuRoute = 'Chat' | 'Transactions' | 'Products' | 'Profile' | (string & {});

export interface BscDrawerMenuLegacyHistoryItem {
  id: string;
  title: string;
  preview: string;
}

export interface BscDrawerMenuProps {
  visible: boolean;
  onDismiss?: () => void;
  onClose?: () => void;
  groups?: readonly BscDrawerMenuGroup[];
  items?: readonly BscDrawerMenuItem[];
  selectedId?: string;
  history?: readonly BscDrawerMenuHistoryItem[];
  newConversationLabel?: string;
  onNewConversation?: () => void;
  logoutLabel?: string;
  onLogout?: () => void;
  footer?: ReactNode;
  title?: string;
  onNavigate?: (route: BscDrawerMenuRoute) => void;
  onOpenHistory?: (history: BscDrawerMenuLegacyHistoryItem) => void;
  currentRoute?: BscDrawerMenuRoute;
}

const LEGACY_MENU_OPTIONS: Array<{ route: BscDrawerMenuRoute; label: string; icon: string }> = [
  { route: 'Chat', label: 'Asistente principal', icon: '✦' },
  { route: 'Transactions', label: 'Transacciones', icon: '▦' },
  { route: 'Products', label: 'Productos', icon: '◈' },
  { route: 'Profile', label: 'Editar perfil', icon: '◉' },
];

const LEGACY_CHAT_HISTORIES: BscDrawerMenuLegacyHistoryItem[] = [
  { id: 'h1', title: 'Transferencia a contacto', preview: 'Consulta de limite y validacion' },
  { id: 'h2', title: 'Solicitud de tarjeta', preview: 'Documentos para tarjeta de credito' },
  { id: 'h3', title: 'Prestamo personal', preview: 'Plazo y simulacion de cuotas' },
  { id: 'h4', title: 'Actualizacion de datos', preview: 'Cambio de telefono y correo' },
];

export function BscDrawerMenu({
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
}: BscDrawerMenuProps): React.JSX.Element | null {
  const dismiss = onDismiss ?? onClose ?? (() => {});
  const isLegacyRouteMode = items === undefined && groups === undefined && onNavigate !== undefined;
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
        return undefined;
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
      return () => {
        active = false;
        animation.stop();
      };
    }

    return undefined;
  }, [visible, isMounted, slideX, backdropOpacity, panelWidth]);

  if (!isMounted) return null;

  const legacyItems = isLegacyRouteMode
    ? LEGACY_MENU_OPTIONS.map<BscDrawerMenuItem>((option) => ({
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
  const effectiveGroups = groups ?? (isLegacyRouteMode && legacyItems !== undefined ? [{ title: 'NAVEGACION', items: legacyItems }] : undefined);
  const allItems = effectiveItems ?? effectiveGroups?.flatMap(group => group.items) ?? [];
  const effectiveSelectedId = selectedId ?? currentRoute;
  const effectiveNewConversationLabel = isLegacyRouteMode ? '+ Nueva conversacion' : newConversationLabel;
  const effectiveNewConversation = isLegacyRouteMode
    ? () => {
        if (onNewConversation !== undefined) onNewConversation();
        else onNavigate?.('Chat');
        dismiss();
      }
    : onNewConversation;
  const effectiveHistory = resolveHistory({ history, onOpenHistory, dismiss });
  const effectiveLogout = isLegacyRouteMode
    ? () => {
        if (onLogout !== undefined) onLogout();
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
                <BscIcon name="close" size={12} color={BscColors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.drawerScroll}>
              {effectiveGroups !== undefined
                ? effectiveGroups.map((group, groupIndex) => (
                    <View key={groupIndex} style={styles.drawerSection}>
                      {group.title !== undefined ? <Text style={styles.drawerSectionLabel}>{group.title}</Text> : null}
                      {group.items.map((item) => (
                        <DrawerItem key={item.id} item={item} selected={item.id === effectiveSelectedId} />
                      ))}
                    </View>
                  ))
                : allItems.map((item) => (
                    <DrawerItem key={item.id} item={item} selected={item.id === effectiveSelectedId} />
                  ))}

              {effectiveNewConversation !== undefined ? (
                <Pressable accessibilityRole="button" style={styles.drawerNewChatButton} onPress={effectiveNewConversation}>
                  <Text style={styles.drawerNewChatText}>{effectiveNewConversationLabel}</Text>
                </Pressable>
              ) : null}

              {effectiveHistory.length > 0 ? (
                <>
                  <View style={styles.drawerDivider} />
                  <Text style={styles.drawerSectionLabel}>{historySectionLabel}</Text>
                  <View style={styles.drawerSection}>
                    {effectiveHistory.map((historyItem) => (
                      <Pressable accessibilityRole="button" key={historyItem.id} style={styles.drawerHistoryRow} onPress={historyItem.onPress}>
                        <Text style={styles.drawerHistoryTitle}>{historyItem.title}</Text>
                        <Text style={styles.drawerHistoryPreview}>{historyItem.preview}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}
            </ScrollView>

            {effectiveLogout !== undefined ? (
              <Pressable accessibilityRole="button" style={styles.drawerLogoutRow} onPress={effectiveLogout}>
                <Text style={styles.drawerLogoutLabel}>{effectiveLogoutLabel}</Text>
              </Pressable>
            ) : null}
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
  history: readonly BscDrawerMenuHistoryItem[];
  onOpenHistory?: (history: BscDrawerMenuLegacyHistoryItem) => void;
  dismiss: () => void;
}): readonly BscDrawerMenuHistoryItem[] {
  if (history.length > 0) {
    return history.map((item) => ({
      ...item,
      onPress: item.onPress ?? (() => {
        onOpenHistory?.(item);
        dismiss();
      }),
    }));
  }

  if (onOpenHistory === undefined) return history;

  return LEGACY_CHAT_HISTORIES.map((item) => ({
    ...item,
    onPress: () => {
      onOpenHistory(item);
      dismiss();
    },
  }));
}

function DrawerItem({ item, selected }: { item: BscDrawerMenuItem; selected?: boolean }): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ disabled: item.disabled === true, selected }}
      disabled={item.disabled}
      onPress={item.disabled === true ? undefined : item.onPress}
      style={[styles.drawerOptionRow, selected === true ? styles.drawerOptionRowActive : undefined]}
    >
      {item.icon}
      <Text style={[styles.drawerOptionLabel, selected === true ? styles.drawerOptionLabelActive : undefined]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  drawerBackdropTap: {
    flex: 1,
  },
  drawerPanel: {
    backgroundColor: BscColors.surface,
  },
  drawerInner: {
    flex: 1,
    paddingHorizontal: BscSpacing.md,
    paddingVertical: BscSpacing.lg,
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: BscSpacing.md,
  },
  drawerTitle: {
    ...BscTypography.titleLarge,
    color: BscColors.textPrimary,
  },
  drawerCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BscColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerScroll: {
    flex: 1,
  },
  drawerSectionLabel: {
    ...BscTextStyles['Caption/12 Bold'],
    color: BscColors.textTertiary,
    letterSpacing: 0.6,
    marginBottom: BscSpacing.sm,
  },
  drawerSection: {
    marginBottom: BscSpacing.sm,
  },
  drawerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: BscSpacing.sm,
    paddingHorizontal: BscSpacing.sm,
    borderRadius: BscRadius.md,
    marginBottom: BscSpacing.xs,
    gap: BscSpacing.sm,
  },
  drawerOptionRowActive: {
    backgroundColor: BscColors.primarySoft,
  },
  drawerOptionLabel: {
    ...BscTextStyles['Body S/14 Medium'],
    color: BscColors.textPrimary,
  },
  drawerOptionLabelActive: {
    ...BscTextStyles['Body S/14 Bold'],
    color: BscColors.primary,
  },
  drawerNewChatButton: {
    backgroundColor: BscColors.primary,
    borderRadius: BscRadius.md,
    paddingVertical: BscSpacing.sm,
    alignItems: 'center',
    marginVertical: BscSpacing.sm,
  },
  drawerNewChatText: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textOnDark,
  },
  drawerDivider: {
    marginTop: BscSpacing.xs,
    marginBottom: BscSpacing.md,
    height: 1,
    backgroundColor: BscColors.divider,
  },
  drawerHistoryRow: {
    paddingVertical: BscSpacing.sm,
    paddingHorizontal: BscSpacing.sm,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surfaceMuted,
    marginBottom: BscSpacing.xs,
  },
  drawerHistoryTitle: {
    ...BscTextStyles['Body S/14 Medium'],
    color: BscColors.textPrimary,
  },
  drawerHistoryPreview: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
    marginTop: 2,
  },
  drawerLogoutRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: BscSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: BscColors.divider,
  },
  drawerLogoutLabel: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.error,
  },
});
