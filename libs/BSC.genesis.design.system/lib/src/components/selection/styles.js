"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = void 0;
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
exports.styles = react_native_1.StyleSheet.create({
    selectWrapper: {},
    selectLabel: {
        ...ui_native_1.BscTextStyles['Caption/12 Medium'],
        color: ui_native_1.BscColors.textPrimary,
        marginBottom: ui_native_1.BscSpacing.xxs,
    },
    selectTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderRadius: ui_native_1.BscRadius.md,
        borderColor: ui_native_1.BscColors.border,
        paddingHorizontal: ui_native_1.BscSpacing.md,
        backgroundColor: ui_native_1.BscColors.surface,
    },
    selectTriggerError: {
        borderColor: ui_native_1.BscColors.error,
    },
    selectTriggerDisabled: {
        backgroundColor: ui_native_1.BscColors.background,
    },
    selectText: {
        flex: 1,
        ...ui_native_1.BscTextStyles['Body S/14 Regular'],
        color: ui_native_1.BscColors.textPrimary,
        marginRight: ui_native_1.BscSpacing.xs,
    },
    selectPlaceholder: {
        color: ui_native_1.BscColors.textSecondary,
    },
    selectChevron: {
        fontSize: 20,
        color: ui_native_1.BscColors.textPrimary,
    },
    selectModalOverlay: {
        flex: 1,
    },
    selectDropdown: {
        position: 'absolute',
        backgroundColor: ui_native_1.BscColors.surface,
        borderWidth: 1,
        borderColor: ui_native_1.BscColors.border,
        borderRadius: ui_native_1.BscRadius.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    selectOption: {
        paddingVertical: ui_native_1.BscSpacing.md,
        paddingHorizontal: ui_native_1.BscSpacing.md,
    },
    selectOptionSelected: {
        backgroundColor: ui_native_1.BscColors.background,
    },
    selectOptionText: {
        ...ui_native_1.BscTextStyles['Body S/14 Regular'],
        color: ui_native_1.BscColors.textPrimary,
    },
    selectOptionTextSelected: {},
    pillContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: ui_native_1.BscColors.border,
        borderRadius: ui_native_1.BscRadius.pill,
        backgroundColor: ui_native_1.BscColors.surface,
        padding: 4,
        gap: ui_native_1.BscSpacing.xs,
    },
    pill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        borderRadius: ui_native_1.BscRadius.pill,
        gap: ui_native_1.BscSpacing.xs,
    },
    pillSelected: {
        backgroundColor: ui_native_1.BscColors.primary,
    },
    pillUnselected: {
        backgroundColor: 'transparent',
    },
    pillLabel: {
        ...ui_native_1.BscTextStyles['Body S/14 SemiBold'],
    },
    pillLabelSelected: {
        color: ui_native_1.BscColors.textOnDark,
    },
    pillLabelUnselected: {
        color: ui_native_1.BscColors.textPrimary,
    },
});
