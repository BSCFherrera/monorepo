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
  BscIcon,
  BscReceiptRow,
  receiptTokens as M,
  BscPrimaryButton,
  BscRadius,
  BscSpacing,
  withAlpha,
  BscTextStyles,
  fontFamily,
} from '@bsc/design-system';
import { TIPOS, usaBeneficiario } from '../data/transferContracts';
import type { ResultadoDeTransferencia } from '../data/transferContracts';
import {
  destinoEnmascarado,
  monedaDelDestino,
  monedaDelOrigen,
  montoAAcreditar,
  nombreDelDestino,
  totalDebitado,
  type DatosDelAsistente,
} from '../domain/transferFlow';

import { BarraInferior } from './TransferWizardChrome';

/**
 * Paso 3: el comprobante.
 *
 * Portado de `transfer_receipt_view.dart`. **Distingue la transferencia
 * aplicada de la que quedó pendiente de aprobación** —el estado `1` del core—,
 * con otro icono, otro color y otro título: decirle «exitosa» a una que aún no
 * se aplicó haría que el cliente diera por movido un dinero que no lo está.
 *
 * ⚠️ **El compartir es distinto del original y menos capaz.** Aquel abre
 * WhatsApp, SMS y correo por separado con `url_launcher` y `share_plus`; aquí
 * se usa `Share` del núcleo de React Native, que abre la hoja del sistema y
 * deja elegir la aplicación. Son dos dependencias menos y el cliente llega al
 * mismo sitio en un toque más. Queda anotado por si el banco quiere los cuatro
 * botones.
 */

export interface TransferReceiptProps {
  datos: DatosDelAsistente;
  resultado: ResultadoDeTransferencia;
  fecha: Date;
  nombreDelOrigen: string;
  cuentaDelOrigen: string;
  /** Saldo estimado después del débito. */
  nuevoSaldo: number;
  onInicio: () => void;
}

export function TransferReceipt({
  datos,
  resultado,
  fecha,
  nombreDelOrigen,
  cuentaDelOrigen,
  nuevoSaldo,
  onInicio,
}: TransferReceiptProps): React.JSX.Element {
  const pendiente = resultado.estadoId === '1';
  const monedaOrigen = monedaDelOrigen(datos);
  const monedaDestino = monedaDelDestino(datos);

  const compartir = (): void => {
    void Share.share({ message: textoDelComprobante(datos, resultado, fecha) });
  };

  return (
    <View style={estilosDelComprobante.pantalla}>
      <ScrollView
        contentContainerStyle={estilosDelComprobante.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilosDelComprobante.encabezado}>
          <View
            style={[
              estilosDelComprobante.circulo,
              {
                backgroundColor: withAlpha(
                  pendiente ? BscColors.warning : BscColors.success,
                  0.12,
                ),
              },
            ]}
          >
            <BscIcon
              name={pendiente ? 'clock' : 'check-circle'}
              size={56}
              color={pendiente ? BscColors.warning : BscColors.success}
            />
          </View>

          <Text style={estilosDelComprobante.titulo}>
            {pendiente ? 'Transferencia en Proceso' : 'Transferencia Exitosa'}
          </Text>

          <Text style={estilosDelComprobante.montoGrande}>
            {formatCurrency(montoAAcreditar(datos), monedaDestino)}
          </Text>
        </View>

        <View style={estilosDelComprobante.tarjeta}>
          <Renglon
            etiqueta="# Referencia"
            valor={
              resultado.transaccionId === '' ? '-' : resultado.transaccionId
            }
          />
          <Renglon etiqueta="Fecha" valor={formatTransactionDate(fecha)} />
          <Renglon etiqueta="Tipo" valor={TIPOS[datos.tipo].titulo} />

          <View style={estilosDelComprobante.separador} />
          <Subtitulo texto="Cuenta Debitada" />
          <BscReceiptRow
            icon="wallet"
            iconColor={BscColors.success}
            title={nombreDelOrigen}
            subtitle={cuentaDelOrigen}
            trailing={formatCurrency(nuevoSaldo, monedaOrigen)}
            trailingLabel="Nuevo Balance"
          />

          <View style={estilosDelComprobante.separador} />
          <Subtitulo texto="Destino" />
          <BscReceiptRow
            icon={usaBeneficiario(datos.tipo) ? 'person' : 'bank'}
            iconColor={BscColors.secondary}
            title={
              nombreDelDestino(datos) === ''
                ? 'Cuenta destino'
                : nombreDelDestino(datos)
            }
            subtitle={destinoEnmascarado(datos)}
            trailing={formatCurrency(montoAAcreditar(datos), monedaDestino)}
            trailingLabel="Acreditado"
          />

          <View style={estilosDelComprobante.separador} />
          <Subtitulo texto="Detalles" />
          <Renglon
            etiqueta="Monto Acreditado"
            valor={formatCurrency(montoAAcreditar(datos), monedaDestino)}
          />
          {datos.cotizacion !== null ? (
            <Renglon etiqueta="Tasa de Cambio" valor={datos.cotizacion.tasa} />
          ) : null}
          <Renglon
            etiqueta="Comisión"
            valor={formatCurrency(datos.comisiones.comision, monedaOrigen)}
          />
          <Renglon
            etiqueta="Impuesto 0.15%"
            valor={formatCurrency(datos.comisiones.impuesto, monedaOrigen)}
          />
          <View style={estilosDelComprobante.separacionAntesDelTotal} />
          <Renglon
            etiqueta="Total Debitado"
            valor={formatCurrency(totalDebitado(datos), monedaOrigen)}
            destacado
          />

          {datos.comentario !== '' ? (
            <>
              <View style={estilosDelComprobante.separador} />
              <Subtitulo texto="Comentario" />
              <Text style={estilosDelComprobante.comentario}>
                {datos.comentario}
              </Text>
            </>
          ) : null}
        </View>
      </ScrollView>

      <BarraInferior>
        <Pressable
          accessibilityRole="button"
          onPress={compartir}
          style={estilosDelComprobante.compartir}
          testID="compartir-comprobante"
        >
          <BscIcon name="share" size={20} color={BscColors.primary} />
          <Text style={estilosDelComprobante.textoCompartir}>
            Compartir comprobante
          </Text>
        </Pressable>

        <View style={estilosDelComprobante.separacionBoton} />

        <BscPrimaryButton
          label="Inicio"
          leading={
            <BscIcon name="home" size={19} color={BscColors.textOnPrimary} />
          }
          onPress={onInicio}
          testID="comprobante-inicio"
        />
      </BarraInferior>
    </View>
  );
}

// ─── Texto que se comparte ──────────────────────────────────────────────────

/**
 * El comprobante en texto plano.
 *
 * **No lleva el número de cuenta completo**, ni el del origen ni el del
 * destino: solo los cuatro últimos. Es el mismo criterio que se aplicó al
 * nombre del archivo del estado de cuenta en la oleada 3, y por la misma razón
 * — este texto viaja a la aplicación que el cliente elija.
 */
export function textoDelComprobante(
  datos: DatosDelAsistente,
  resultado: ResultadoDeTransferencia,
  fecha: Date,
): string {
  const monedaOrigen = monedaDelOrigen(datos);
  const monedaDestino = monedaDelDestino(datos);

  const lineas = [
    'Banco Santa Cruz - Comprobante de Transferencia',
    '',
    resultado.estadoId === '1'
      ? 'Transferencia en Proceso'
      : 'Transferencia Exitosa',
    `Tipo: ${TIPOS[datos.tipo].titulo}`,
    `Destino: ${nombreDelDestino(datos)}`,
    `Cuenta destino: ${destinoEnmascarado(datos)}`,
    `Monto: ${formatCurrency(montoAAcreditar(datos), monedaDestino)}`,
  ];

  if (datos.cotizacion !== null) {
    lineas.push(`Tasa de Cambio: ${datos.cotizacion.tasa}`);
  }

  lineas.push(
    `Comisión: ${formatCurrency(datos.comisiones.comision, monedaOrigen)}`,
    `Impuesto: ${formatCurrency(datos.comisiones.impuesto, monedaOrigen)}`,
    `Total debitado: ${formatCurrency(totalDebitado(datos), monedaOrigen)}`,
    `Referencia: ${
      resultado.transaccionId === '' ? '-' : resultado.transaccionId
    }`,
    `Fecha: ${formatTransactionDate(fecha)}`,
  );

  return lineas.join('\n');
}

// ─── Piezas ─────────────────────────────────────────────────────────────────

function Subtitulo({ texto }: { texto: string }): React.JSX.Element {
  return (
    <Text style={estilosDelComprobante.subtitulo}>{texto.toUpperCase()}</Text>
  );
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
    <View style={estilosDelComprobante.renglon}>
      <Text
        style={
          destacado
            ? estilosDelComprobante.etiquetaDestacada
            : estilosDelComprobante.etiquetaRenglon
        }
      >
        {etiqueta}
      </Text>
      <Text
        style={
          destacado
            ? estilosDelComprobante.valorDestacado
            : estilosDelComprobante.valorRenglon
        }
      >
        {valor}
      </Text>
    </View>
  );
}

export const estilosDelComprobante = StyleSheet.create({
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
    width: M.header.circle,
    height: M.header.circle,
    borderRadius: M.header.circle / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    marginTop: M.header.titleGap,
    fontFamily,
    fontSize: M.header.titleFontSize,
    fontWeight: '700',
    color: BscColors.textPrimary,
  },
  montoGrande: {
    marginTop: M.header.amountGap,
    fontFamily,
    fontSize: M.header.amountFontSize,
    fontWeight: '800',
    color: BscColors.primary,
  },

  tarjeta: {
    padding: M.card.padding,
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
