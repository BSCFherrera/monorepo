"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = void 0;
const react_native_1 = require("react-native");
const tokens_1 = require("../../../tokens");
exports.styles = react_native_1.StyleSheet.create({
    illustration: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
    title: { fontSize: 18, fontWeight: '700', color: tokens_1.tokens.colors.text, textAlign: 'center', marginBottom: 24 },
    insetTitle: { paddingHorizontal: 48 },
    body: { fontSize: 14, color: tokens_1.tokens.colors.textSecondary, lineHeight: 20, textAlign: 'center' },
    bodySpacing: { marginBottom: 24 },
    panel: { backgroundColor: '#F6FBFF', borderWidth: 1, borderColor: '#dbeafe', borderRadius: 16, padding: 16, marginBottom: 24 },
    warning: { backgroundColor: '#FDECEC', borderColor: '#f8caca', marginBottom: 16 },
    sessionCircle: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF3E0', justifyContent: 'center' },
    cancel: { marginTop: 8, marginBottom: 8, borderWidth: 1, borderColor: tokens_1.tokens.colors.primary },
    back: { width: 40, height: 40, borderRadius: 20, backgroundColor: tokens_1.tokens.colors.backgroundDark, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
    logo: { width: 120, height: 60, alignSelf: 'center', marginBottom: 16 },
    clientTitle: { fontSize: 24, fontWeight: '700', color: tokens_1.tokens.colors.text, textAlign: 'center' },
    details: { backgroundColor: tokens_1.tokens.colors.background, borderWidth: 1, borderColor: tokens_1.tokens.colors.border, borderRadius: 16, padding: 16, marginBottom: 24, gap: 8 },
    detailLabel: { fontSize: 10, fontWeight: '700', color: tokens_1.tokens.colors.textSecondary, marginBottom: 4 },
    detailValue: { fontSize: 16, fontWeight: '700', color: tokens_1.tokens.colors.text },
    secondary: { fontSize: 16, fontWeight: '700', textAlign: 'center', color: tokens_1.tokens.colors.textSecondary, paddingVertical: 16 },
});
