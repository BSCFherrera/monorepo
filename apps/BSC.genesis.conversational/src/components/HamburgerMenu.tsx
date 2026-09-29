import React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

const PANEL_WIDTH = Math.min(Dimensions.get('window').width * 0.82, 360);

type MenuRoute = 'Chat' | 'Transactions' | 'Products' | 'Profile';

interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
}

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: MenuRoute) => void;
  onOpenHistory: (history: ChatHistoryItem) => void;
  currentRoute?: MenuRoute;
  onLogout?: () => void;
}

const MENU_OPTIONS: Array<{route: MenuRoute; label: string; icon: string}> = [
  {route: 'Chat', label: 'Asistente principal', icon: '✦'},
  {route: 'Transactions', label: 'Transacciones', icon: '▦'},
  {route: 'Products', label: 'Productos', icon: '◈'},
  {route: 'Profile', label: 'Editar perfil', icon: '◉'},
];

const CHAT_HISTORIES: ChatHistoryItem[] = [
  {
    id: 'h1',
    title: 'Transferencia a contacto',
    preview: 'Consulta de limite y validacion',
  },
  {
    id: 'h2',
    title: 'Solicitud de tarjeta',
    preview: 'Documentos para tarjeta de credito',
  },
  {
    id: 'h3',
    title: 'Prestamo personal',
    preview: 'Plazo y simulacion de cuotas',
  },
  {
    id: 'h4',
    title: 'Actualizacion de datos',
    preview: 'Cambio de telefono y correo',
  },
];

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  visible,
  onClose,
  onNavigate,
  onOpenHistory,
  currentRoute = 'Chat',
  onLogout,
}) => {
  const [isMounted, setIsMounted] = React.useState(visible);
  const slideX = React.useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      if (!isMounted) {
        // Mount first, then run opening animation in the next effect cycle.
        slideX.setValue(-PANEL_WIDTH);
        backdropOpacity.setValue(0);
        setIsMounted(true);
        return;
      }

      Animated.parallel([
        Animated.timing(slideX, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (isMounted) {
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: -PANEL_WIDTH,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({finished}) => {
        if (finished) {
          setIsMounted(false);
        }
      });
    }
  }, [visible, isMounted, slideX, backdropOpacity]);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal visible={isMounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdropShade, {opacity: backdropOpacity}]} />
        <Animated.View style={[styles.panel, {transform: [{translateX: slideX}]}]}>
        <SafeAreaView style={styles.panelInner} edges={['top', 'bottom']}>
          <View style={styles.headerRow}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>X</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>NAVEGACION</Text>

          <View style={styles.section}>
            {MENU_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.route}
                style={[
                  styles.optionRow,
                  option.route === currentRoute ? styles.optionRowActive : null,
                ]}
                onPress={() => {
                  onNavigate(option.route);
                  onClose();
                }}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.optionLabel,
                    option.route === currentRoute ? styles.optionLabelActive : null,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => {
              onNavigate('Chat');
              onClose();
            }}>
            <Text style={styles.newChatButtonText}>+ Nueva conversacion</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>CONVERSACIONES</Text>

          <View style={styles.section}>
            {CHAT_HISTORIES.length > 0 ? (
              CHAT_HISTORIES.map(history => (
                <TouchableOpacity
                  key={history.id}
                  style={styles.historyRow}
                  onPress={() => {
                    onOpenHistory(history);
                    onClose();
                  }}>
                  <Text style={styles.historyRowTitle}>{history.title}</Text>
                  <Text style={styles.historyRowPreview}>{history.preview}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyHistoryText}>Aun no tienes conversaciones.</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.logoutRow}
            onPress={() => {
              if (onLogout) {
                onLogout();
              } else {
                onNavigate('Profile');
              }
              onClose();
            }}>
            <Text style={styles.logoutIcon}>o</Text>
            <Text style={styles.logoutLabel}>Cerrar sesion</Text>
          </TouchableOpacity>
        </SafeAreaView>
        </Animated.View>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  backdropShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backdrop: {
    flex: 1,
  },
  panel: {
    width: PANEL_WIDTH,
    backgroundColor: COLORS.backgroundLight,
  },
  panelInner: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  menuTitle: {
    color: '#12233E',
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.xl,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF2FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: '#60708A',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  sectionLabel: {
    color: '#7A879C',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.6,
    marginBottom: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  optionRowActive: {
    backgroundColor: '#EEF5FF',
  },
  optionIcon: {
    width: 24,
    color: '#2A5EA6',
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.sm,
  },
  optionLabel: {
    color: '#27374E',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  optionLabelActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  newChatButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  newChatButtonText: {
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: FONT_SIZES.sm,
  },
  divider: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
    height: 1,
    backgroundColor: '#D8E2F1',
  },
  historyRow: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F7F9FD',
    marginBottom: SPACING.xs,
  },
  historyRowTitle: {
    color: '#1B273F',
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: FONT_SIZES.sm,
  },
  historyRowPreview: {
    color: '#71809B',
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  emptyHistoryText: {
    color: '#7E8CA2',
    fontSize: FONT_SIZES.sm,
  },
  logoutRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5EAF3',
  },
  logoutIcon: {
    width: 22,
    color: '#D12E43',
    fontSize: FONT_SIZES.md,
  },
  logoutLabel: {
    color: '#D12E43',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
