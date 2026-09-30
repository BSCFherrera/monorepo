import type { ReactNode } from 'react';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
  topInset?: number;
}

export interface AppHeaderProps {
  brand?: ReactNode;
  logo?: ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showBottomLine?: boolean;
  actions?: ReactNode;
  avatar?: ReactNode;
}

export interface BrandHeaderProps {
  brand?: ReactNode;
  title?: string;
  showMenu?: boolean;
  onMenuPress?: () => void;
  showProfile?: boolean;
  onProfilePress?: () => void;
  showNotification?: boolean;
  onNotificationPress?: () => void;
  userInitials?: string;
  hasNotification?: boolean;
  topInset?: number;
}

export interface DrawerMenuGroup {
  title?: string;
  items: readonly DrawerMenuItem[];
}

export interface DrawerMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

export interface DrawerMenuHistoryItem {
  id: string;
  title: string;
  preview: string;
  onPress?: () => void;
}

export type DrawerMenuRoute = 'Chat' | 'Transactions' | 'Products' | 'Profile' | (string & {});

export interface DrawerMenuLegacyHistoryItem {
  id: string;
  title: string;
  preview: string;
}

export interface DrawerMenuProps {
  visible: boolean;
  onDismiss?: () => void;
  onClose?: () => void;
  groups?: readonly DrawerMenuGroup[];
  items?: readonly DrawerMenuItem[];
  selectedId?: string;
  history?: readonly DrawerMenuHistoryItem[];
  newConversationLabel?: string;
  onNewConversation?: () => void;
  logoutLabel?: string;
  onLogout?: () => void;
  footer?: ReactNode;
  title?: string;
  onNavigate?: (route: DrawerMenuRoute) => void;
  onOpenHistory?: (history: DrawerMenuLegacyHistoryItem) => void;
  currentRoute?: DrawerMenuRoute;
}
