import { StyleSheet } from 'react-native';
import { tokens } from '../../tokens';

export const styles = StyleSheet.create({
  // Header
  headerContainer: {
    height: tokens.dimensions.headerHeight,
    backgroundColor: tokens.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.primaryDark,
  },
  headerSide: {
    minWidth: 40,
  },
  headerRightSide: {
    alignItems: 'flex-end',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: tokens.fontSizes.xl,
    fontWeight: tokens.fontWeights.bold,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: tokens.fontSizes.sm,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  headerBack: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: tokens.fontWeights.bold,
  },

  // AppHeader
  appHeaderWrapper: {
    backgroundColor: tokens.colors.surface,
  },
  appHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
  },
  appHeaderSide: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  appHeaderCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appHeaderBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: tokens.spacing.sm,
  },
  appHeaderLine: {
    width: '90%',
    height: 1,
    backgroundColor: tokens.colors.border,
    alignSelf: 'center',
  },

  // BrandHeader
  brandHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF6',
  },
  brandLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandRightSection: {
    flexDirection: 'row',
    width: 108,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brandIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  brandMenuIcon: {
    color: tokens.colors.primary,
    fontSize: 22,
    fontWeight: tokens.fontWeights.bold,
  },
  brandTitle: {
    color: '#152540',
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.bold,
  },
  brandBellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F6FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandBellIcon: {
    fontSize: 17,
  },
  brandProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.primary,
  },
  brandProfileInitials: {
    color: '#FFFFFF',
    fontSize: tokens.fontSizes.sm,
    fontWeight: tokens.fontWeights.bold,
  },
  brandNotificationDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FF6242',
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    borderWidth: 2,
    borderColor: tokens.colors.surface,
  },

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
