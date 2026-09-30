"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = void 0;
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
exports.styles = react_native_1.StyleSheet.create({
    infoCard: {
        marginVertical: ui_native_1.BscSpacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ui_native_1.BscColors.surfaceMuted,
        borderRadius: ui_native_1.BscRadius.md,
        paddingVertical: ui_native_1.BscSpacing.md,
        paddingHorizontal: ui_native_1.BscSpacing.md,
    },
    infoCardIconCircle: {
        width: 40,
        height: 40,
        borderRadius: ui_native_1.BscRadius.pill,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: ui_native_1.BscSpacing.md,
    },
    infoCardTextContainer: {
        flex: 1,
    },
    infoCardTitle: {
        ...ui_native_1.BscTextStyles['Body S/14 Bold'],
        color: ui_native_1.BscColors.textPrimary,
    },
    infoCardSubtitle: {
        ...ui_native_1.BscTextStyles['Caption/12 Regular'],
        color: ui_native_1.BscColors.textSecondary,
        marginTop: 2,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: ui_native_1.BscRadius.md,
        paddingVertical: ui_native_1.BscSpacing.md,
        paddingHorizontal: ui_native_1.BscSpacing.xl,
    },
    actionCardStandard: {
        marginVertical: ui_native_1.BscSpacing.xs,
    },
    actionCardRegistration: {},
    actionCardIconCircle: {
        width: 40,
        height: 40,
        borderRadius: ui_native_1.BscRadius.pill,
        backgroundColor: ui_native_1.BscColors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: ui_native_1.BscSpacing.md,
    },
    actionCardTextContainer: {
        flex: 1,
    },
    actionCardTitle: {
        ...ui_native_1.BscTextStyles['Body S/14 Bold'],
        color: ui_native_1.BscColors.textPrimary,
    },
    actionCardSubtitle: {
        ...ui_native_1.BscTextStyles['Caption/12 Regular'],
        color: ui_native_1.BscColors.textSecondary,
        marginTop: 2,
    },
    stepsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ui_native_1.BscSpacing.xxs,
    },
    stepBar: {
        flex: 1,
        height: 4,
        borderRadius: ui_native_1.BscRadius.pill,
    },
    loadingOverlay: {
        ...react_native_1.StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: (0, ui_native_1.withAlpha)(ui_native_1.BscColors.primaryDeep, 0.5),
        zIndex: 999,
        elevation: 999,
        gap: ui_native_1.BscSpacing.xs,
    },
    loadingLabel: {
        ...ui_native_1.BscTextStyles['Caption/12 Medium'],
        color: ui_native_1.BscColors.textOnDark,
    },
});
