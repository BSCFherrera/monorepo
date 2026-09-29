"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = void 0;
const react_native_1 = require("react-native");
const tokens_1 = require("../../tokens");
exports.styles = react_native_1.StyleSheet.create({
    // Header
    headerContainer: {
        height: tokens_1.tokens.dimensions.headerHeight,
        backgroundColor: tokens_1.tokens.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: tokens_1.tokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: tokens_1.tokens.colors.primaryDark,
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
        fontSize: tokens_1.tokens.fontSizes.xl,
        fontWeight: tokens_1.tokens.fontWeights.bold,
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: tokens_1.tokens.fontSizes.sm,
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
        fontWeight: tokens_1.tokens.fontWeights.bold,
    },
    // AppHeader
    appHeaderWrapper: {
        backgroundColor: tokens_1.tokens.colors.surface,
    },
    appHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: tokens_1.tokens.spacing.sm,
        paddingHorizontal: tokens_1.tokens.spacing.md,
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
        backgroundColor: tokens_1.tokens.colors.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: tokens_1.tokens.spacing.sm,
    },
    appHeaderLine: {
        width: '90%',
        height: 1,
        backgroundColor: tokens_1.tokens.colors.border,
        alignSelf: 'center',
    },
    // BrandHeader
    brandHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: tokens_1.tokens.spacing.md,
        paddingVertical: tokens_1.tokens.spacing.sm,
        backgroundColor: tokens_1.tokens.colors.surface,
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
        color: tokens_1.tokens.colors.primary,
        fontSize: 22,
        fontWeight: tokens_1.tokens.fontWeights.bold,
    },
    brandTitle: {
        color: '#152540',
        fontSize: tokens_1.tokens.fontSizes.lg,
        fontWeight: tokens_1.tokens.fontWeights.bold,
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
        backgroundColor: tokens_1.tokens.colors.primary,
    },
    brandProfileInitials: {
        color: '#FFFFFF',
        fontSize: tokens_1.tokens.fontSizes.sm,
        fontWeight: tokens_1.tokens.fontWeights.bold,
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
        borderColor: tokens_1.tokens.colors.surface,
    },
    // DrawerMenu
    drawerOverlay: {
        flex: 1,
        flexDirection: 'row',
        position: 'relative',
    },
    drawerBackdrop: {
        ...react_native_1.StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    drawerBackdropTap: {
        flex: 1,
    },
    drawerPanel: {
        backgroundColor: tokens_1.tokens.colors.surface,
    },
    drawerInner: {
        flex: 1,
        paddingHorizontal: tokens_1.tokens.spacing.md,
        paddingVertical: tokens_1.tokens.spacing.lg,
    },
    drawerHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens_1.tokens.spacing.md,
    },
    drawerTitle: {
        color: '#12233E',
        fontWeight: tokens_1.tokens.fontWeights.bold,
        fontSize: tokens_1.tokens.fontSizes.xl,
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
        fontSize: tokens_1.tokens.fontSizes.sm,
        fontWeight: tokens_1.tokens.fontWeights.bold,
    },
    drawerSectionLabel: {
        color: '#7A879C',
        fontSize: tokens_1.tokens.fontSizes.xs,
        fontWeight: tokens_1.tokens.fontWeights.bold,
        letterSpacing: 0.6,
        marginBottom: tokens_1.tokens.spacing.sm,
    },
    drawerSection: {
        marginBottom: tokens_1.tokens.spacing.sm,
    },
    drawerOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: tokens_1.tokens.spacing.sm,
        paddingHorizontal: tokens_1.tokens.spacing.sm,
        borderRadius: tokens_1.tokens.radii.md,
        marginBottom: tokens_1.tokens.spacing.xs,
        gap: tokens_1.tokens.spacing.sm,
    },
    drawerOptionRowActive: {
        backgroundColor: '#EEF5FF',
    },
    drawerOptionLabel: {
        color: '#27374E',
        fontSize: tokens_1.tokens.fontSizes.md,
        fontWeight: tokens_1.tokens.fontWeights.medium,
    },
    drawerOptionLabelActive: {
        color: tokens_1.tokens.colors.primary,
        fontWeight: tokens_1.tokens.fontWeights.bold,
    },
    drawerNewChatButton: {
        backgroundColor: tokens_1.tokens.colors.primary,
        borderRadius: tokens_1.tokens.radii.md,
        paddingVertical: tokens_1.tokens.spacing.sm,
        alignItems: 'center',
        marginVertical: tokens_1.tokens.spacing.sm,
    },
    drawerNewChatText: {
        color: '#FFFFFF',
        fontWeight: tokens_1.tokens.fontWeights.semibold,
        fontSize: tokens_1.tokens.fontSizes.sm,
    },
    drawerDivider: {
        marginTop: tokens_1.tokens.spacing.xs,
        marginBottom: tokens_1.tokens.spacing.md,
        height: 1,
        backgroundColor: '#D8E2F1',
    },
    drawerHistoryRow: {
        paddingVertical: tokens_1.tokens.spacing.sm,
        paddingHorizontal: tokens_1.tokens.spacing.sm,
        borderRadius: tokens_1.tokens.radii.md,
        backgroundColor: '#F7F9FD',
        marginBottom: tokens_1.tokens.spacing.xs,
    },
    drawerHistoryTitle: {
        color: '#1B273F',
        fontWeight: tokens_1.tokens.fontWeights.medium,
        fontSize: tokens_1.tokens.fontSizes.sm,
    },
    drawerHistoryPreview: {
        color: '#71809B',
        fontSize: tokens_1.tokens.fontSizes.xs,
        marginTop: 2,
    },
    drawerLogoutRow: {
        marginTop: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: tokens_1.tokens.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: '#E5EAF3',
    },
    drawerLogoutLabel: {
        color: '#D12E43',
        fontSize: tokens_1.tokens.fontSizes.md,
        fontWeight: tokens_1.tokens.fontWeights.semibold,
    },
});
