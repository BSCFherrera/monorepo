import { StyleSheet } from 'react-native';
import { tokens } from '../../tokens';

export const styles = StyleSheet.create({
  // DrawerMenu
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
    backgroundColor: tokens.colors.surface,
  },
  drawerInner: {
    flex: 1,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.lg,
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.md,
  },
  drawerTitle: {
    color: '#12233E',
    fontWeight: tokens.fontWeights.bold,
    fontSize: tokens.fontSizes.xl,
  },
  drawerCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF2FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerCloseIcon: {
    color: '#60708A',
    fontSize: tokens.fontSizes.sm,
    fontWeight: tokens.fontWeights.bold,
  },
  drawerSectionLabel: {
    color: '#7A879C',
    fontSize: tokens.fontSizes.xs,
    fontWeight: tokens.fontWeights.bold,
    letterSpacing: 0.6,
    marginBottom: tokens.spacing.sm,
  },
  drawerSection: {
    marginBottom: tokens.spacing.sm,
  },
  drawerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radii.md,
    marginBottom: tokens.spacing.xs,
    gap: tokens.spacing.sm,
  },
  drawerOptionRowActive: {
    backgroundColor: '#EEF5FF',
  },
  drawerOptionLabel: {
    color: '#27374E',
    fontSize: tokens.fontSizes.md,
    fontWeight: tokens.fontWeights.medium,
  },
  drawerOptionLabelActive: {
    color: tokens.colors.primary,
    fontWeight: tokens.fontWeights.bold,
  },
  drawerNewChatButton: {
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radii.md,
    paddingVertical: tokens.spacing.sm,
    alignItems: 'center',
    marginVertical: tokens.spacing.sm,
  },
  drawerNewChatText: {
    color: '#FFFFFF',
    fontWeight: tokens.fontWeights.semibold,
    fontSize: tokens.fontSizes.sm,
  },
  drawerDivider: {
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.md,
    height: 1,
    backgroundColor: '#D8E2F1',
  },
  drawerHistoryRow: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radii.md,
    backgroundColor: '#F7F9FD',
    marginBottom: tokens.spacing.xs,
  },
  drawerHistoryTitle: {
    color: '#1B273F',
    fontWeight: tokens.fontWeights.medium,
    fontSize: tokens.fontSizes.sm,
  },
  drawerHistoryPreview: {
    color: '#71809B',
    fontSize: tokens.fontSizes.xs,
    marginTop: 2,
  },
  drawerLogoutRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5EAF3',
  },
  drawerLogoutLabel: {
    color: '#D12E43',
    fontSize: tokens.fontSizes.md,
    fontWeight: tokens.fontWeights.semibold,
  },
});
