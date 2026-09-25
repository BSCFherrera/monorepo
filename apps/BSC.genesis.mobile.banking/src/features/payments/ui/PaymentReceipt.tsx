import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatCurrency, formatTransactionDate } from '@bsc/shared';

import {
  BscColors,
  BscReceiptRow,
  receiptTokens as M,
  BscIcon,
  BscPrimaryButton,
  BscRadius,
  BscSpacing,
  withAlpha,
  BscTextStyles,
  fontFamily,
} from '@bsc/ui-native';
import { BarraInferior } from '../../transfers/ui/TransferWizardChrome';
import {
  tituloDeConfirmacion,
  type ResultadoDePago,
} from '../data/paymentContracts';
import {
  codigoDeMonedaDeLaCuenta,
  codigoDeMonedaDelPago,
  comisionDelPago,
  esPrestamo,
  impuestoDelPago,
  cuentaDeOrigenEnmascarada,
  montoDelPago,
  nuevoSaldoDelProducto,
  nombreDeLaCuenta,
  nombreDelProducto,
  numeroVisible,
  totalDebitado,
  type DatosDelPago,
} from '../domain/paymentFlow';

/**
 * Paso 3 del pago: el comprobante.
 *
 * Portado de `payment_receipt_view.dart`, con la misma decisión que el de
 * transferencias: se comparte con la hoja del sistema en vez de los cuatro
 * botones de aplicación, y el texto lleva **solo los últimos cuatro dígitos**
 * de la cuenta y del producto.
 */

export interface PaymentReceiptProps {
  datos: DatosDelPago;
  resultado: ResultadoDePago;
  fecha: Date;
  /** Saldo estimado de la cuenta después del débito. */
  nuevoSaldo: number;
  onInicio: () => void;
}

export function PaymentReceipt({
  datos,
  resultado,
  fecha,
  nuevoSaldo,
  onInicio,
}: PaymentReceiptProps): React.JSX.Element {
  const monedaPago = codigoDeMonedaDelPago(datos);
  const monedaCuenta = codigoDeMonedaDeLaCuenta(datos);
  const prestamo = esPrestamo(datos);

  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.encabezado}>
          <View style={styles.circulo}>
            <BscIcon name="check-circle" size={56} color={BscColors.success} />
          </View>

          <Text style={styles.titulo}>Pago Exitoso</Text>
          <Text style={styles.montoGrande}>
            {formatCurrency(montoDelPago(datos), monedaPago)}
          </Text>
        </View>

        <View style={styles.tarjeta}>
          <Renglon
            etiqueta="# Referencia"
            valor={
              resultado.transaccionId === '' ? '-' : resultado.transaccionId
            }
          />
          <Renglon etiqueta="Fecha" valor={formatTransactionDate(fecha)} />
          <Renglon etiqueta="Tipo" valor={tituloDeConfirmacion(datos.tipo)} />

          <View style={styles.separador} />
          <Subtitulo texto={prestamo ? 'Préstamo Pagado' : 'Tarjeta Pagada'} />
          <BscReceiptRow
            icon={prestamo ? 'bank' : 'card'}
            iconColor={BscColors.primary}
            title={nombreDelProducto(datos)}
            subtitle={numeroVisible(datos)}
            trailing={formatCurrency(nuevoSaldoDelProducto(datos), monedaPago)}
            trailingLabel="Nuevo Balance"
          />

          <View style={styles.separador} />
          <Subtitulo texto="Cuenta Debitada" />
          <BscReceiptRow
            icon="wallet"
            iconColor={BscColors.success}
            title={nombreDeLaCuenta(datos)}
            subtitle={cuentaDeOrigenEnmascarada(datos)}
            trailing={formatCurrency(nuevoSaldo, monedaCuenta)}
            trailingLabel="Nuevo Balance"
          />

          <View style={styles.separador} />
          <Subtitulo texto="Detalles" />
          <Renglon
            etiqueta="Monto Aplicado"
            valor={formatCurrency(montoDelPago(datos), monedaPago)}
          />
          {!prestamo ? (
            <>
              <Renglon
                etiqueta="Comisión"
                valor={formatCurrency(comisionDelPago(datos), monedaCuenta)}
              />
              <Renglon
                etiqueta="Impuesto 0.15%"
                valor={formatCurrency(impuestoDelPago(datos), monedaCuenta)}
              />
            </>
          ) : null}

          <View style={styles.separacionAntesDelTotal} />
          <Renglon
            etiqueta="Total Debitado"
            valor={formatCurrency(totalDebitado(datos), monedaCuenta)}
            destacado
          />

          {datos.comentario !== '' ? (
            <>
              <View style={styles.separador} />
              <Subtitulo texto="Comentario" />
              <Text style={styles.comentario}>{datos.comentario}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>

      <BarraInferior>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void Share.share({
              message: textoDelComprobanteDePago(datos, resultado, fecha),
            });
          }}
          style={styles.compartir}
          testID="compartir-comprobante-pago"
        >
          <BscIcon name="share" size={20} color={BscColors.primary} />
          <Text style={styles.textoCompartir}>Compartir comprobante</Text>
        </Pressable>

        <View style={styles.separacionBoton} />

        <BscPrimaryButton
          label="Inicio"
          leading={
            <BscIcon name="home" size={19} color={BscColors.textOnPrimary} />
          }
          onPress={onInicio}
          testID="comprobante-pago-inicio"
        />
      </BarraInferior>
    </View>
  );
}

/** El comprobante en texto plano, sin números completos. */
export function textoDelComprobanteDePago(
  datos: DatosDelPago,
  resultado: ResultadoDePago,
  fecha: Date,
): string {
  const monedaPago = codigoDeMonedaDelPago(datos);
  const monedaCuenta = codigoDeMonedaDeLaCuenta(datos);

  const lineas = [
    'Banco Santa Cruz - Comprobante de Pago',
    '',
    'Pago Exitoso',
    `Tipo: ${tituloDeConfirmacion(datos.tipo)}`,
    `Producto: ${numeroVisible(datos)}`,
    `Monto aplicado: ${formatCurrency(montoDelPago(datos), monedaPago)}`,
  ];

  if (!esPrestamo(datos)) {
    lineas.push(
      `Comisión: ${formatCurrency(comisionDelPago(datos), monedaCuenta)}`,
      `Impuesto: ${formatCurrency(impuestoDelPago(datos), monedaCuenta)}`,
    );
  }

  lineas.push(
    `Total debitado: ${formatCurrency(totalDebitado(datos), monedaCuenta)}`,
    `Referencia: ${
      resultado.transaccionId === '' ? '-' : resultado.transaccionId
    }`,
    `Fecha: ${formatTransactionDate(fecha)}`,
  );

  return lineas.join('\n');
}

// ─── Piezas ─────────────────────────────────────────────────────────────────

function Subtitulo({ texto }: { texto: string }): React.JSX.Element {
  return <Text style={styles.subtitulo}>{texto.toUpperCase()}</Text>;
}

function Renglon({
  etiqueta,
  valor,
  destacado = false,
}: {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
}): React.JSX.Element {
  return (
    <View style={styles.renglon}>
      <Text style={styles.etiquetaRenglon}>{etiqueta}</Text>
      <Text style={destacado ? styles.valorDestacado : styles.valorRenglon}>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: {
    padding: 16,
    paddingTop: 24,
  },

  encabezado: {
    alignItems: 'center',
    marginBottom: 20,
  },
  circulo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: withAlpha(BscColors.success, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    marginTop: 16,
    ...BscTextStyles['Subtitle/20 Bold'],
    color: BscColors.textPrimary,
  },
  montoGrande: {
    marginTop: 6,
    ...BscTextStyles['Title S/30 Bold'],
    color: BscColors.primary,
  },

  tarjeta: {
    padding: 18,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surface,
    borderWidth: 1,
    borderColor: BscColors.border,
  },
  separador: {
    height: 1,
    marginVertical: 12,
    backgroundColor: BscColors.divider,
  },
  subtitulo: {
    marginBottom: M.subtitle.gapBelow,
    fontFamily,
    fontSize: M.subtitle.fontSize,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: BscColors.textSecondary,
  },

  renglon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: M.line.paddingY,
  },
  etiquetaRenglon: {
    fontFamily,
    fontSize: M.line.keyFontSize,
    fontWeight: M.line.keyWeight,
    color: BscColors.textSecondary,
  },
  etiquetaDestacada: {
    fontFamily,
    fontSize: M.line.emphasizedKeyFontSize,
    fontWeight: M.line.emphasizedKeyWeight,
    color: BscColors.textPrimary,
  },
  valorRenglon: {
    fontFamily,
    fontSize: M.line.valueFontSize,
    fontWeight: M.line.valueWeight,
    color: BscColors.textPrimary,
  },
  valorDestacado: {
    fontFamily,
    fontSize: M.line.emphasizedValueFontSize,
    fontWeight: M.line.emphasizedValueWeight,
    color: BscColors.primary,
  },

  separacionAntesDelTotal: { height: M.card.gapBeforeTotal },

  comentario: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
  },

  compartir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: BscRadius.sm,
    backgroundColor: withAlpha(BscColors.primary, 0.08),
  },
  textoCompartir: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.primary,
  },
  separacionBoton: { height: BscSpacing.sm },
});
