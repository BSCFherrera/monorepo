"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = void 0;
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
exports.styles = react_native_1.StyleSheet.create({
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: ui_native_1.BscSpacing.xxs,
        gap: ui_native_1.BscSpacing.xxs,
    },
    errorText: {
        ...ui_native_1.BscTextStyles['Caption/12 Regular'],
        color: ui_native_1.BscColors.error,
        flex: 1,
    },
    inputContainer: {
        marginBottom: ui_native_1.BscSpacing.md,
    },
    inputLabel: {
        ...ui_native_1.BscTextStyles['Caption/12 Medium'],
        color: ui_native_1.BscColors.textPrimary,
        marginBottom: ui_native_1.BscSpacing.xxs,
    },
    inputField: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderColor: ui_native_1.BscColors.border,
        borderRadius: ui_native_1.BscRadius.md,
        backgroundColor: ui_native_1.BscColors.surface,
        paddingHorizontal: ui_native_1.BscSpacing.md,
        gap: ui_native_1.BscSpacing.xs,
    },
    inputFieldFocused: {
        borderColor: ui_native_1.BscColors.primary,
        borderWidth: 2,
    },
    inputFieldError: {
        borderColor: ui_native_1.BscColors.error,
    },
    inputFieldDisabled: {
        backgroundColor: ui_native_1.BscColors.background,
    },
    inputInput: {
        flex: 1,
        ...ui_native_1.BscTextStyles['Body S/14 Regular'],
        color: ui_native_1.BscColors.textPrimary,
    },
    copyLabel: {
        ...ui_native_1.BscTextStyles['Caption/12 Medium'],
        color: ui_native_1.BscColors.primary,
    },
    helperText: {
        fontSize: 10,
        color: ui_native_1.BscColors.textSecondary,
        marginTop: ui_native_1.BscSpacing.xxs,
    },
    textFieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderColor: ui_native_1.BscColors.border,
        borderRadius: ui_native_1.BscRadius.md,
        backgroundColor: ui_native_1.BscColors.surface,
        paddingHorizontal: ui_native_1.BscSpacing.md,
        gap: ui_native_1.BscSpacing.xs,
    },
    textFieldInput: {
        flex: 1,
        ...ui_native_1.BscTextStyles['Body S/14 Regular'],
        color: ui_native_1.BscColors.textPrimary,
        paddingVertical: 0,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkboxBox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: ui_native_1.BscColors.border,
        borderRadius: ui_native_1.BscRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxBoxChecked: {
        borderColor: ui_native_1.BscColors.primary,
        backgroundColor: ui_native_1.BscColors.primary,
    },
    checkboxLabel: {
        marginLeft: ui_native_1.BscSpacing.xs,
        ...ui_native_1.BscTextStyles['Body S/14 Regular'],
        color: ui_native_1.BscColors.textPrimary,
    },
    checkboxLabelContainer: {
        marginLeft: ui_native_1.BscSpacing.xs,
        flex: 1,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ui_native_1.BscSpacing.xs,
    },
    toggleLabel: {
        ...ui_native_1.BscTextStyles['Body S/14 Regular'],
        color: ui_native_1.BscColors.textPrimary,
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
        backgroundColor: ui_native_1.BscColors.primary,
    },
    toggleTrackOff: {
        backgroundColor: ui_native_1.BscColors.border,
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
        marginTop: ui_native_1.BscSpacing.xs,
    },
    meterRow: {
        flexDirection: 'row',
        gap: ui_native_1.BscSpacing.xxs,
    },
    meterSegment: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    meterLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: ui_native_1.BscSpacing.xxs,
        textTransform: 'uppercase',
    },
});
