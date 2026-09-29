"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = void 0;
const react_native_1 = require("react-native");
const tokens_1 = require("../../tokens");
exports.styles = react_native_1.StyleSheet.create({
    selectWrapper: {},
    selectLabel: {
        fontSize: tokens_1.tokens.fontSizes.sm,
        fontWeight: tokens_1.tokens.fontWeights.medium,
        color: tokens_1.tokens.colors.text,
        marginBottom: tokens_1.tokens.spacing.xs,
    },
    selectTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        height: tokens_1.tokens.dimensions.inputHeight,
        borderWidth: 1,
        borderRadius: tokens_1.tokens.radii.md,
        borderColor: tokens_1.tokens.colors.border,
        paddingHorizontal: tokens_1.tokens.spacing.md,
        backgroundColor: tokens_1.tokens.colors.surface,
    },
    selectTriggerError: {
        borderColor: tokens_1.tokens.colors.error,
    },
    selectTriggerDisabled: {
        backgroundColor: tokens_1.tokens.colors.backgroundDark,
    },
    selectText: {
        flex: 1,
        fontSize: tokens_1.tokens.fontSizes.md,
        color: tokens_1.tokens.colors.text,
        marginRight: tokens_1.tokens.spacing.sm,
    },
    selectPlaceholder: {
        color: tokens_1.tokens.colors.textSecondary,
    },
    selectChevron: {
        fontSize: 20,
        color: tokens_1.tokens.colors.text,
    },
    selectModalOverlay: {
        flex: 1,
    },
    selectDropdown: {
        position: 'absolute',
        backgroundColor: tokens_1.tokens.colors.surface,
        borderWidth: 1,
        borderColor: tokens_1.tokens.colors.border,
        borderRadius: tokens_1.tokens.radii.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    selectOption: {
        paddingVertical: tokens_1.tokens.spacing.md,
        paddingHorizontal: tokens_1.tokens.spacing.md,
    },
    selectOptionSelected: {
        backgroundColor: tokens_1.tokens.colors.selectedOption,
    },
    selectOptionText: {
        fontSize: tokens_1.tokens.fontSizes.md,
        color: tokens_1.tokens.colors.text,
    },
    selectOptionTextSelected: {},
    pillContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: tokens_1.tokens.colors.border,
        borderRadius: tokens_1.tokens.radii.pill,
        backgroundColor: tokens_1.tokens.colors.surface,
        padding: 4,
        gap: tokens_1.tokens.spacing.sm,
    },
    pill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: tokens_1.tokens.dimensions.inputHeight - 8,
        borderRadius: tokens_1.tokens.radii.pill,
        gap: tokens_1.tokens.spacing.sm,
    },
    pillSelected: {
        backgroundColor: tokens_1.tokens.colors.primary,
    },
    pillUnselected: {
        backgroundColor: 'transparent',
    },
    pillLabel: {
        fontSize: tokens_1.tokens.fontSizes.md,
        fontWeight: tokens_1.tokens.fontWeights.semibold,
    },
    pillLabelSelected: {
        color: '#FFFFFF',
    },
    pillLabelUnselected: {
        color: tokens_1.tokens.colors.text,
    },
});
