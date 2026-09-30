/**
 * @bsc/ui-native — componentes React Native del sistema de diseño BSC.
 *
 * Los valores (colores, tipografía, espaciado, medidas de controles) viven en
 * `@bsc/design-tokens`; este paquete los traduce a estilos de React Native y
 * los usa en los componentes. Las props públicas están en inglés; los textos
 * que ve el cliente los pasa cada app.
 */

export {
  BscColors,
  BscCategoricalColors,
  BscGradients,
  brandGradient,
  headerGradient,
  accountCardGradient,
  creditCardGradient,
  greenGradient,
  diamondGradient,
  toNativeGradient,
  type BscColorToken,
  type BscGradient,
} from './theme/colors';

export {
  BscSpacing,
  BscRadius,
  BscBorderRadius,
  BscShadows,
  screenPadding,
  sheetTopRadius,
  coloredShadow,
  primaryShadow,
  withAlpha,
  toNativeShadow,
} from './theme/spacing';

export {
  BscTextStyles,
  BscTypography,
  fontFamily,
  type BscTextStyleToken,
} from './theme/typography';

export {
  BscGradientBackdrop,
  BscGradientSurface,
  type BscGradientBackdropProps,
} from './components/BscGradientBackdrop';

export {
  BscPrimaryButton,
  BscSecondaryButton,
  BscTextButton,
  type BscButtonProps,
} from './components/BscButton';

export {
  BscTextField,
  type BscTextFieldProps,
} from './components/BscTextField';

export { BscLogo, type BscLogoProps } from './components/BscLogo';

export {
  BscIcon,
  type BscIconName,
  type BscIconProps,
} from './components/BscIcon';

export {
  BscCard,
  BscSectionHeader,
  BscPlaceholder,
  type BscCardProps,
} from './components/BscCard';

export {
  BscIconTile,
  BscListRow,
  BscRowDivider,
  BscPill,
  type BscIconTileProps,
  type BscListRowProps,
  type BscPillProps,
} from './components/BscRow';

export {
  BscScreenHeader,
  type BscScreenHeaderProps,
} from './components/BscScreenHeader';

export {
  BscPageHeader,
  type BscPageHeaderProps,
} from './components/BscPageHeader';

export {
  BscEmptyState,
  type BscEmptyStateProps,
} from './components/BscEmptyState';

export { BscRadio, type BscRadioProps } from './components/BscRadio';

export {
  BscCheckbox,
  type BscCheckboxProps,
} from './components/BscCheckbox';

export {
  BscToggleSwitch,
  type BscToggleSwitchProps,
} from './components/BscToggleSwitch';

export {
  BscErrorText,
  type BscErrorTextProps,
} from './components/BscErrorText';

export {
  BscMessageBubble,
  type BscMessageBubbleProps,
} from './components/BscMessageBubble';

export {
  BscTypingIndicator,
  startTypingIndicatorAnimations,
  useReducedMotionEnabled,
  type BscTypingIndicatorProps,
} from './components/BscTypingIndicator';

export {
  BscSteps,
  type BscStepsProps,
} from './components/BscSteps';

export {
  BscSelect,
  type BscSelectProps,
} from './components/BscSelect';

export { BscOtpInput, type BscOtpInputProps } from './components/BscOtpInput';

export {
  BscSheet,
  FOOTNOTE_TEXT_STYLE,
  type BscSheetHandle,
  type BscSheetProps,
} from './components/BscSheet';

export {
  BscDateRangeSheet,
  type BscDateRangeSheetProps,
} from './components/BscDateRangeSheet';

export {
  BscSegmented,
  type BscSegmentedProps,
} from './components/BscSegmented';

export {
  BscProgressRing,
  type BscProgressRingProps,
} from './components/BscProgressRing';

export {
  BscBanner,
  type BscBannerProps,
  type BscBannerTone,
} from './components/BscBanner';

export { BscMeterBar, type BscMeterBarProps } from './components/BscMeterBar';

export { BscToast, type BscToastProps } from './components/BscToast';

export {
  BscOptionCard,
  type BscOptionCardProps,
} from './components/BscOptionCard';

export {
  BscDetailSection,
  BscDetailRow,
  type BscDetailSectionProps,
  type BscDetailRowProps,
} from './components/BscDetailSection';


export {
  BscReceiptRow,
  receiptRowStyles,
  type BscReceiptRowProps,
} from './components/BscReceiptRow';

export { BscSpinner } from './components/BscSpinner';

export {
  BscLoaderProvider,
  BscLoadingOverlay,
  useBscLoader,
  type BscLoaderContextValue,
  type BscLoadingOverlayProps,
} from './components/BscLoadingOverlay';

export {
  buttonTokens,
  separatorTokens,
  textFieldTokens,
  spinnerTokens,
  receiptTokens,
  RECEIPT_ICON_BACKGROUND_OPACITY,
  type SpinnerPlacement,
} from './componentTokens';

export {
  sheetMaxHeight,
  keyboardOverlap,
  SHEET_MAX_HEIGHT_FACTOR,
} from './sheetHeight';
