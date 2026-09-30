import { StyleSheet } from 'react-native';
import { BscColors, BscRadius, BscSpacing, BscTextStyles } from '@bsc/ui-native';

export const styles = StyleSheet.create({
  illustration: { alignItems: 'center', marginTop: BscSpacing.md, marginBottom: BscSpacing.xl },
  title: { ...BscTextStyles['Body L/18 Bold'], color: BscColors.textPrimary, textAlign: 'center', marginBottom: BscSpacing.xl },
  insetTitle: { paddingHorizontal: BscSpacing.xxl },
  body: { ...BscTextStyles['Body S/14 Regular'], color: BscColors.textSecondary, textAlign: 'center' },
  bodySpacing: { marginBottom: BscSpacing.xl },
  panel: { backgroundColor: '#F6FBFF', borderWidth: 1, borderColor: '#dbeafe', borderRadius: BscRadius.md, padding: BscSpacing.md, marginBottom: BscSpacing.xl },
  warning: { backgroundColor: '#FDECEC', borderColor: '#f8caca', marginBottom: BscSpacing.md },
  sessionCircle: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: BscColors.warningSoft, justifyContent: 'center' },
  cancel: { marginTop: BscSpacing.sm, marginBottom: BscSpacing.sm, borderWidth: 1, borderColor: BscColors.primary },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: BscColors.surfaceMuted, justifyContent: 'center', alignItems: 'center', marginTop: BscSpacing.sm },
  logo: { width: 120, height: 60, alignSelf: 'center', marginBottom: BscSpacing.md },
  clientTitle: { ...BscTextStyles['Heading M/24 Bold'], color: BscColors.textPrimary, textAlign: 'center' },
  details: { backgroundColor: BscColors.background, borderWidth: 1, borderColor: BscColors.border, borderRadius: BscRadius.md, padding: BscSpacing.md, marginBottom: BscSpacing.xl, gap: BscSpacing.xs },
  detailLabel: { ...BscTextStyles['Caption/10 Bold'], color: BscColors.textSecondary, marginBottom: BscSpacing.xs },
  detailValue: { ...BscTextStyles['Body M/16 Bold'], color: BscColors.textPrimary },
  secondary: { ...BscTextStyles['Body M/16 Bold'], textAlign: 'center', color: BscColors.textSecondary, paddingVertical: BscSpacing.md },
});
