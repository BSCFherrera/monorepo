"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = void 0;
const react_native_1 = require("react-native");
const tokens_1 = require("../../tokens");
exports.styles = react_native_1.StyleSheet.create({
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: tokens_1.tokens.spacing.xs,
        gap: tokens_1.tokens.spacing.xs,
    },
    errorText: {
        fontSize: tokens_1.tokens.fontSizes.sm,
        color: tokens_1.tokens.colors.error,
        flex: 1,
    },
    inputContainer: {
        marginBottom: tokens_1.tokens.spacing.md,
    },
    inputLabel: {
        fontSize: tokens_1.tokens.fontSizes.sm,
        fontWeight: tokens_1.tokens.fontWeights.medium,
        color: tokens_1.tokens.colors.text,
        marginBottom: tokens_1.tokens.spacing.xs,
    },
    inputField: {
        flexDirection: 'row',
        alignItems: 'center',
        height: tokens_1.tokens.dimensions.inputHeight,
        borderWidth: 1,
        borderColor: tokens_1.tokens.colors.border,
        borderRadius: tokens_1.tokens.radii.md,
        backgroundColor: tokens_1.tokens.colors.surface,
        paddingHorizontal: tokens_1.tokens.spacing.md,
        gap: tokens_1.tokens.spacing.sm,
    },
    inputFieldFocused: {
        borderColor: tokens_1.tokens.colors.primary,
        borderWidth: 2,
    },
    inputFieldError: {
        borderColor: tokens_1.tokens.colors.error,
    },
    inputFieldDisabled: {
        backgroundColor: tokens_1.tokens.colors.backgroundDark,
    },
    inputInput: {
        flex: 1,
        fontSize: tokens_1.tokens.fontSizes.md,
        color: tokens_1.tokens.colors.text,
        fontWeight: tokens_1.tokens.fontWeights.regular,
    },
    copyLabel: {
        fontSize: tokens_1.tokens.fontSizes.sm,
        color: tokens_1.tokens.colors.primary,
        fontWeight: tokens_1.tokens.fontWeights.medium,
    },
    helperText: {
        fontSize: tokens_1.tokens.fontSizes.xs,
        color: tokens_1.tokens.colors.textSecondary,
        marginTop: tokens_1.tokens.spacing.xs,
    },
    textFieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: tokens_1.tokens.dimensions.inputHeight,
        borderWidth: 1,
        borderColor: tokens_1.tokens.colors.border,
        borderRadius: tokens_1.tokens.radii.md,
        backgroundColor: tokens_1.tokens.colors.surface,
        paddingHorizontal: tokens_1.tokens.spacing.md,
        gap: tokens_1.tokens.spacing.sm,
    },
    textFieldInput: {
        flex: 1,
        fontSize: tokens_1.tokens.fontSizes.md,
        color: tokens_1.tokens.colors.text,
        paddingVertical: 0,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkboxBox: {
        width: tokens_1.tokens.dimensions.iconSize.md,
        height: tokens_1.tokens.dimensions.iconSize.md,
        borderWidth: 2,
        borderColor: tokens_1.tokens.colors.border,
        borderRadius: tokens_1.tokens.radii.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxBoxChecked: {
        borderColor: tokens_1.tokens.colors.primary,
        backgroundColor: tokens_1.tokens.colors.primary,
    },
    checkboxLabel: {
        marginLeft: tokens_1.tokens.spacing.sm,
        fontSize: tokens_1.tokens.fontSizes.md,
        color: tokens_1.tokens.colors.text,
    },
    checkboxLabelContainer: {
        marginLeft: tokens_1.tokens.spacing.sm,
        flex: 1,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: tokens_1.tokens.spacing.sm,
    },
    toggleLabel: {
        fontSize: tokens_1.tokens.fontSizes.md,
        color: tokens_1.tokens.colors.text,
        flex: 1,
    },
    toggleTrack: {
        width: 44,
        height: 24,
        borderRadius: 12,
        padding: 2,
        justifyContent: 'center',
    },
    toggleTrackOn: {
        backgroundColor: tokens_1.tokens.colors.primary,
    },
    toggleTrackOff: {
        backgroundColor: tokens_1.tokens.colors.border,
    },
    toggleKnob: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleKnobOn: {
        alignSelf: 'flex-end',
    },
    toggleKnobOff: {
        alignSelf: 'flex-start',
    },
    meterContainer: {
        marginTop: tokens_1.tokens.spacing.sm,
    },
    meterRow: {
        flexDirection: 'row',
        gap: tokens_1.tokens.spacing.xs,
    },
    meterSegment: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    meterLabel: {
        fontSize: tokens_1.tokens.fontSizes.xs,
        fontWeight: tokens_1.tokens.fontWeights.bold,
        marginTop: tokens_1.tokens.spacing.xs,
        textTransform: 'uppercase',
    },
});
