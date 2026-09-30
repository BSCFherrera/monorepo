"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = void 0;
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
exports.styles = react_native_1.StyleSheet.create({
    illustration: { alignItems: 'center', marginTop: ui_native_1.BscSpacing.md, marginBottom: ui_native_1.BscSpacing.xl },
    title: { ...ui_native_1.BscTextStyles['Body L/18 Bold'], color: ui_native_1.BscColors.textPrimary, textAlign: 'center', marginBottom: ui_native_1.BscSpacing.xl },
    insetTitle: { paddingHorizontal: ui_native_1.BscSpacing.xxl },
    body: { ...ui_native_1.BscTextStyles['Body S/14 Regular'], color: ui_native_1.BscColors.textSecondary, textAlign: 'center' },
    bodySpacing: { marginBottom: ui_native_1.BscSpacing.xl },
    panel: { backgroundColor: '#F6FBFF', borderWidth: 1, borderColor: '#dbeafe', borderRadius: ui_native_1.BscRadius.md, padding: ui_native_1.BscSpacing.md, marginBottom: ui_native_1.BscSpacing.xl },
    warning: { backgroundColor: '#FDECEC', borderColor: '#f8caca', marginBottom: ui_native_1.BscSpacing.md },
    sessionCircle: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: ui_native_1.BscColors.warningSoft, justifyContent: 'center' },
    cancel: { marginTop: ui_native_1.BscSpacing.sm, marginBottom: ui_native_1.BscSpacing.sm, borderWidth: 1, borderColor: ui_native_1.BscColors.primary },
    back: { width: 40, height: 40, borderRadius: 20, backgroundColor: ui_native_1.BscColors.surfaceMuted, justifyContent: 'center', alignItems: 'center', marginTop: ui_native_1.BscSpacing.sm },
    logo: { width: 120, height: 60, alignSelf: 'center', marginBottom: ui_native_1.BscSpacing.md },
    clientTitle: { ...ui_native_1.BscTextStyles['Heading M/24 Bold'], color: ui_native_1.BscColors.textPrimary, textAlign: 'center' },
    details: { backgroundColor: ui_native_1.BscColors.background, borderWidth: 1, borderColor: ui_native_1.BscColors.border, borderRadius: ui_native_1.BscRadius.md, padding: ui_native_1.BscSpacing.md, marginBottom: ui_native_1.BscSpacing.xl, gap: ui_native_1.BscSpacing.xs },
    detailLabel: { ...ui_native_1.BscTextStyles['Caption/10 Bold'], color: ui_native_1.BscColors.textSecondary, marginBottom: ui_native_1.BscSpacing.xs },
    detailValue: { ...ui_native_1.BscTextStyles['Body M/16 Bold'], color: ui_native_1.BscColors.textPrimary },
    secondary: { ...ui_native_1.BscTextStyles['Body M/16 Bold'], textAlign: 'center', color: ui_native_1.BscColors.textSecondary, paddingVertical: ui_native_1.BscSpacing.md },
});
