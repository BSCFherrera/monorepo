"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = void 0;
const react_native_1 = require("react-native");
const tokens_1 = require("../../tokens");
exports.styles = react_native_1.StyleSheet.create({
    infoCard: {
        marginVertical: tokens_1.tokens.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: tokens_1.tokens.colors.cardBg,
        borderRadius: tokens_1.tokens.radii.lg,
        paddingVertical: tokens_1.tokens.spacing.md,
        paddingHorizontal: tokens_1.tokens.spacing.md,
    },
    infoCardIconCircle: {
        width: 40,
        height: 40,
        borderRadius: tokens_1.tokens.radii.pill,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: tokens_1.tokens.spacing.md,
    },
    infoCardTextContainer: {
        flex: 1,
    },
    infoCardTitle: {
        fontSize: tokens_1.tokens.fontSizes.md,
        fontWeight: tokens_1.tokens.fontWeights.bold,
        color: tokens_1.tokens.colors.text,
    },
    infoCardSubtitle: {
        fontSize: tokens_1.tokens.fontSizes.sm,
        color: tokens_1.tokens.colors.textSecondary,
        marginTop: 2,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: tokens_1.tokens.radii.lg,
        paddingVertical: tokens_1.tokens.spacing.md,
        paddingHorizontal: tokens_1.tokens.spacing.lg,
    },
    actionCardStandard: {
        marginVertical: tokens_1.tokens.spacing.sm,
    },
    actionCardRegistration: {},
    actionCardIconCircle: {
        width: 40,
        height: 40,
        borderRadius: tokens_1.tokens.radii.pill,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: tokens_1.tokens.spacing.md,
    },
    actionCardTextContainer: {
        flex: 1,
    },
    actionCardTitle: {
        fontSize: tokens_1.tokens.fontSizes.md,
        fontWeight: tokens_1.tokens.fontWeights.bold,
        color: tokens_1.tokens.colors.text,
    },
    actionCardSubtitle: {
        fontSize: tokens_1.tokens.fontSizes.sm,
        color: tokens_1.tokens.colors.textSecondary,
        marginTop: 2,
    },
    stepsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: tokens_1.tokens.spacing.xs,
    },
    stepBar: {
        flex: 1,
        height: 4,
        borderRadius: tokens_1.tokens.radii.pill,
    },
    loadingOverlay: {
        ...react_native_1.StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        elevation: 999,
        gap: tokens_1.tokens.spacing.sm,
    },
    loadingLabel: {
        fontSize: tokens_1.tokens.fontSizes.sm,
        color: '#FFFFFF',
        fontWeight: tokens_1.tokens.fontWeights.medium,
    },
});
