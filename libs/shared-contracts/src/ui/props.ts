/**
 * Contratos de los componentes del sistema de diseño BSC.
 *
 * La parte de las props de cada componente que no depende de ningún framework:
 * textos, números, estados y callbacks. Cada kit de UI (hoy `@bsc/design-system`)
 * extiende estas interfaces y añade solo lo propio de su plataforma —hijos,
 * estilos, tipos de teclado—.
 *
 * Los textos que ve el cliente llegan siempre por props, en el idioma de la
 * app; los nombres de las props están en inglés.
 */
import type { IconName } from './icons';
import type { BannerTone } from './banner';
import type { SelectOption } from './select';
import type { DateRange } from './dateRange';

/** Props neutrales de `BscBanner` (BscBanner.tsx). */
export interface BannerProps {
  title: string;
  subtitle?: string | undefined;
  icon?: IconName;
  /** El original abre en `success`, y así se queda. */
  tone?: BannerTone;
  onPress?: (() => void) | undefined;
  testID?: string;
}

/** Props neutrales de `BscButton` (BscButton.tsx). */
export interface ButtonProps {
  label: string;
  onPress?: (() => void) | undefined;
  /**
   * Color de la superficie del botón primario.
   *
   * Existe porque el original lo tiene —`BscPrimaryButton` de `bsc_ui.dart`
   * declara `color` con el azul de marca por defecto— y porque las hojas de
   * confirmación destructivas lo usan en rojo: «Cerrar sesión» y «Cerrar
   * todas» no pueden verse igual que «Aceptar». Sin esto, la única forma de
   * pintarlas de rojo sería un estilo suelto por pantalla, y volverían a
   * divergir unas de otras.
   */
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  /**
   * Alto de la superficie, cuando no es el de siempre.
   *
   * El original lo declara como parámetro —`this.height = 54`— y hay dos
   * sitios que lo bajan: el botón de un estado vacío, a 46, y el «Consultar»
   * de Comprobantes fiscales, a 48. Sin esta propiedad la única forma de
   * cambiarlo sería colar un estilo suelto, que es justo como las medidas se
   * pierden de vista.
   */
  height?: number;
  /**
   * Tamaño del botón según la biblioteca de Figma (`Buttons/Button`, propiedad
   * `Size`): alto, relleno, radio de píldora y texto de cada tamaño.
   *
   * Opcional a propósito: sin `size` el botón conserva la medida de siempre
   * (54 de alto), de modo que las pantallas se pasan a la de Figma una a una y
   * no todas de golpe.
   */
  size?: ButtonSize;
  testID?: string;
}

/** Tamaños de botón de la biblioteca de Figma. */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/** Props neutrales de `BscCard` (BscCard.tsx). */
export interface CardProps {
  onPress?: (() => void) | undefined;
  testID?: string;
}

/**
 * Estado de la conexión que anuncia `BscConnectionBanner`: `reconnecting`
 * mientras se reintenta por sí sola, `offline` cuando ya dejó de intentarlo y
 * hace falta que el cliente lo pida.
 */
export type ConnectionBannerState = 'reconnecting' | 'offline';

/** Props neutrales de `BscConnectionBanner` (BscConnectionBanner.tsx). */
export interface ConnectionBannerProps {
  state: ConnectionBannerState;
  title: string;
  subtitle?: string | undefined;
  /**
   * Solo en `offline`: con `onRetry` y `retryLabel` el aviso muestra la acción
   * para volver a intentar la conexión.
   */
  onRetry?: (() => void) | undefined;
  retryLabel?: string | undefined;
  testID?: string;
}

/** Props neutrales de `BscDateRangeSheet` (BscDateRangeSheet.tsx). */
export interface DateRangeSheetProps {
  visible: boolean;
  /** Rango con el que abre la hoja. */
  initialRange: DateRange;
  onApply: (rango: DateRange) => void;
  onClose: () => void;
  /** Día más antiguo consultable. Por defecto, un año atrás. */
  minDate?: Date;
  /** Día más reciente consultable. Por defecto, hoy. */
  maxDate?: Date;
  title?: string;
  /** Reloj inyectable, para que las pruebas no dependan del día de hoy. */
  today?: Date;
  testID?: string;
}

/** Props neutrales de `BscDetailSection` (BscDetailSection.tsx). */
export interface DetailSectionProps {
  title?: string;
  icon?: IconName;
  testID?: string;
}

/** Props neutrales de `BscDetailRow` (BscDetailSection.tsx). */
export interface DetailRowProps {
  label: string;
  value: string;
  /** Color del valor, para destacar un saldo retenido o embargado. */
  valueColor?: string;
  /** Más peso en el valor: la cifra principal de la tarjeta. */
  emphasized?: boolean;
  testID?: string;
}

/** Props neutrales de `BscEmptyState` (BscEmptyState.tsx). */
export interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string | undefined;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
  testID?: string;
}

/** Props neutrales de `BscGradientBackdrop` (BscGradientBackdrop.tsx). */
export interface GradientBackdropProps {
  /** Las facetas se dibujan por defecto, igual que en Flutter. */
  showFacets?: boolean;
}

/** Props neutrales de `BscIcon` (BscIcon.tsx). */
export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/** Props neutrales de `BscLogo` (BscLogo.tsx). */
export interface LogoProps {
  height?: number;
  /** Sobre superficie oscura se tiñe de blanco; sobre clara va a color. */
  onDark?: boolean;
}

/** Forma visual de `BscModal` (BscModal.tsx). */
export type ModalPresentation = 'dialog' | 'expanded';

/** Props neutrales de `BscModal` (BscModal.tsx). */
export interface ModalProps {
  visible?: boolean;
  defaultVisible?: boolean;
  title?: string | undefined;
  onBack?: (() => void) | undefined;
  onClose?: (() => void) | undefined;
  onOpenChange?: ((visible: boolean) => void) | undefined;
  canDismiss?: boolean;
  showCloseButton?: boolean;
  presentation?: ModalPresentation;
  testID?: string;
}

/** Props neutrales de `BscNavigationHeader` (BscNavigationHeader.tsx). */
export interface NavigationHeaderProps {
  title: string;
  /** Sin esta función no se dibuja la flecha de volver. */
  onBack?: (() => void) | undefined;
  /** Muestra el acceso a soporte con icono de audífonos. */
  showSupportButton?: boolean;
  onSupportPress?: (() => void) | undefined;
  /** Sin esta función no se dibuja la acción de cerrar. */
  onClose?: (() => void) | undefined;
  testID?: string;
}

/** Props neutrales de `BscInfoModal` (BscInfoModal.tsx). */
export interface InfoModalProps extends ModalProps {
  title: string;
  description: string;
  primaryButtonLabel: string;
  onPrimaryPress?: (() => void) | undefined;
  secondaryButtonLabel?: string | undefined;
  onSecondaryPress?: (() => void) | undefined;
  primaryButtonLoading?: boolean;
  primaryButtonDisabled?: boolean;
  secondaryButtonDisabled?: boolean;
}

/** Props neutrales de `BscMeterBar` (BscMeterBar.tsx). */
export interface MeterBarProps {
  label: string;
  /** Entre 0 y 1. Se recorta. */
  value: number;
  /** El texto de la derecha; el original escribe el porcentaje redondeado. */
  valueLabel: string;
  color?: string;
  testID?: string;
}

/** Props neutrales de `BscOptionCard` (BscOptionCard.tsx). */
export interface OptionCardProps {
  title: string;
  subtitle?: string | undefined;
  selected: boolean;
  onPress?: (() => void) | undefined;
  testID?: string;
}

/** Props neutrales de `BscOtpInput` (BscOtpInput.tsx). */
export interface OtpInputProps {
  length?: number;
  value: string;
  onChangeText: (codigo: string) => void;
  /** Se llama una sola vez por código completo. */
  onCompleted?: ((codigo: string) => void) | undefined;
  hasError?: boolean;
  errorMessage?: string | undefined;
  enabled?: boolean;
  autoFocus?: boolean;
  /**
   * Cambiar este número borra lo escrito y devuelve el foco al inicio.
   *
   * Existe porque tras un código rechazado las casillas se quedaban con los
   * dígitos viejos y el siguiente intento reenviaba lo mismo, consumiendo otro
   * intento sin que el cliente cambiara nada. Quien muestra el error pasa aquí
   * su contador de intentos.
   */
  clearOn?: number;
  testID?: string;
}

/** Props neutrales de `BscPageHeader` (BscPageHeader.tsx). */
export interface PageHeaderProps {
  title: string;
  subtitle?: string | undefined;
  /** Sin esta función no se dibuja la flecha: una raíz no vuelve a ningún sitio. */
  onBack?: (() => void) | undefined;
  testID?: string;
}

/** Props neutrales de `BscProgressRing` (BscProgressRing.tsx). */
export interface ProgressRingProps {
  /** Entre 0 y 1. Se recorta, porque una tarjeta puede pasarse de su límite. */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  testID?: string;
}

/** Props neutrales de `BscRadio` (BscRadio.tsx). */
export interface RadioProps {
  selected: boolean;
  /** El tinte del punto y del anillo cuando está elegido. */
  color?: string;
  testID?: string;
}

/** Opción neutral de `BscRadioGroup` (BscRadioGroup.tsx). */
export interface RadioGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/** Props neutrales de `BscRadioGroup` (BscRadioGroup.tsx). */
export interface RadioGroupProps {
  label?: string | undefined;
  options: readonly RadioGroupOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  testID?: string;
}

/** Opción neutral de `BscSelectableListGroup` (BscSelectableListGroup.tsx). */
export interface SelectableListGroupOption<TValue extends string = string> {
  value: TValue;
  icon: IconName;
  title: string;
  subtitle?: string | undefined;
  disabled?: boolean;
}

/** Props neutrales de `BscSelectableListGroup` (BscSelectableListGroup.tsx). */
export interface SelectableListGroupProps<TValue extends string = string> {
  label?: string | undefined;
  options: readonly SelectableListGroupOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  disabled?: boolean;
  testID?: string;
}

/** Props neutrales de `BscReceiptRow` (BscReceiptRow.tsx). */
export interface ReceiptRowProps {
  icon: IconName;
  iconColor?: string;
  title: string;
  subtitle: string;
  trailing: string;
  trailingLabel: string;
  testID?: string;
}

/** Props neutrales de `BscIconTile` (BscRow.tsx). */
export interface IconTileProps {
  icon: IconName;
  /** El tinte lleva el significado; el fondo sale de él al 10 %. */
  color?: string;
  background?: string;
  size?: number;
  iconSize?: number;
}

/** Props neutrales de `BscListRow` (BscRow.tsx). */
export interface ListRowProps {
  title: string;
  subtitle?: string | undefined;
  /** Monto o valor a la derecha. */
  trailingLabel?: string | undefined;
  /** Etiqueta pequeña bajo el monto: «Disponible», «Balance», «Invertido». */
  trailingSubLabel?: string | undefined;
  trailingColor?: string | undefined;
  onPress?: (() => void) | undefined;
  showChevron?: boolean;
  testID?: string;
}

/** Props neutrales de `BscPill` (BscRow.tsx). */
export interface PillProps {
  label: string;
  color?: string;
  background?: string;
  icon?: IconName | undefined;
}

/** Props neutrales de `BscScreenHeader` (BscScreenHeader.tsx). */
export interface ScreenHeaderProps {
  title: string;
  /** Sin esta función no se dibuja la flecha: una raíz de pestaña no vuelve a
   *  ningún sitio, y una flecha que no lleva atrás miente. */
  onBack?: (() => void) | undefined;
  testID?: string;
}

/** Props neutrales de `BscSegmented` (BscSegmented.tsx). */
export interface SegmentedProps {
  labels: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  background?: string;
  selectedColor?: string;
  selectedTextColor?: string;
  textColor?: string;
  testID?: string;
}

/** Props neutrales de `BscSelect` (BscSelect.tsx). */
export interface SelectProps<T> {
  /** Título de la hoja al abrirse. */
  title: string;
  placeholder: string;
  options: readonly SelectOption<T>[];
  /** Clave de la opción elegida; nula mientras no se ha elegido ninguna. */
  selectedKey: string | null;
  onSelect: (opcion: SelectOption<T>) => void;
  enabled?: boolean;
  error?: string | undefined;
  testID?: string;
}

/** Props neutrales de `BscSheet` (BscSheet.tsx). */
export interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  /** Nota pequeña bajo el pie, para advertencias y aclaraciones. */
  footnote?: string;
  /** Proporción máxima de la pantalla que puede ocupar. */
  maxHeightFactor?: number;
  testID?: string;
}

/** Props neutrales de `BscTextField` (BscTextField.tsx). */
export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (valor: string) => void;
  placeholder?: string;
  error?: string | undefined;
  secure?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  maxLength?: number;
  onSubmitEditing?: () => void;
  testID?: string;
}

/** Props neutrales de `BscToast` (BscToast.tsx). */
export interface ToastProps {
  /** El mensaje. Cambiarlo vuelve a mostrar el aviso. */
  message: string | null;
  /** Cuánto permanece, en milisegundos. El de Flutter dura cuatro segundos. */
  durationMs?: number;
  onHide: () => void;
  testID?: string;
}
