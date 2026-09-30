import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatAmount, formatDate } from '@bsc/shared';

import {
  BscBanner,
  BscColors,
  BscDetailRow,
  BscRadius,
  BscSheet,
  BscSpacing,
  BscSpinner,
  BscTextStyles,
} from '@bsc/design-system';
import {
  esCredito,
  simboloDelComprobante,
  type Comprobante,
  type DetalleDeComprobante,
  type MovimientoDelComprobante,
} from '../data/taxReceiptContracts';
import type { TaxReceiptRepository } from '../data/taxReceiptRepository';

/**
 * El detalle de un comprobante fiscal.
 *
 * Portada de `_TaxReceiptDetailSheet`. Pide **los dos** endpoints de detalle a
 * la vez para que el cliente vea qué cubre el comprobante y qué movimiento lo
 * generó; cada uno puede fallar por su cuenta y la hoja dibuja lo que llegue,
 * porque la cabecera ya trae de la lista lo que de verdad importa —el NCF, la
 * fecha y el monto.
 */

export interface TaxReceiptDetailSheetProps {
  visible: boolean;
  comprobante: Comprobante | null;
  customerCode: string;
  repositorio: TaxReceiptRepository;
  onCerrar: () => void;
}

export function TaxReceiptDetailSheet({
  visible,
  comprobante,
  customerCode,
  repositorio,
  onCerrar,
}: TaxReceiptDetailSheetProps): React.JSX.Element {
  const [cargando, setCargando] = useState(true);
  const [detalle, setDetalle] = useState<DetalleDeComprobante | null>(null);
  const [movimiento, setMovimiento] = useState<MovimientoDelComprobante | null>(
    null,
  );

  useEffect(() => {
    if (!visible || comprobante === null) return;

    let vigente = true;
    setCargando(true);
    setDetalle(null);
    setMovimiento(null);

    void Promise.all([
      repositorio.detalle(customerCode, comprobante.ncf),
      repositorio.movimiento(comprobante.ncf),
    ]).then(([elDetalle, elMovimiento]) => {
      // La hoja puede haberse cerrado o haber cambiado de comprobante mientras
      // las dos llamadas estaban en vuelo.
      if (!vigente) return;
      setDetalle(elDetalle);
      setMovimiento(elMovimiento);
      setCargando(false);
    });

    return () => {
      vigente = false;
    };
  }, [visible, comprobante, customerCode, repositorio]);

  const simbolo =
    comprobante === null ? 'RD$' : simboloDelComprobante(comprobante.moneda);

  return (
    <BscSheet
      visible={visible}
      title="Comprobante fiscal"
      onClose={onCerrar}
      testID="hoja-comprobante"
    >
      {comprobante === null ? null : (
        <>
          <View style={styles.cabecera}>
            <Text style={styles.ncf}>{comprobante.ncf}</Text>
            <View style={styles.separacion2} />
            <Text style={styles.fecha}>{formatDate(comprobante.fecha)}</Text>
            <View style={styles.separacionPequena} />
            <Text style={styles.monto}>
              {`${simbolo} ${formatAmount(comprobante.monto)}`}
            </Text>
          </View>

          <View style={styles.separacionMedia} />

          {cargando ? (
            <View style={styles.cargando}>
              <BscSpinner tamano="inRow" />
            </View>
          ) : (
            <>
              <View style={styles.bloqueDeDatos}>
                {detalle !== null ? (
                  <>
                    <BscDetailRow
                      label="Concepto"
                      value={detalle.descripcion}
                    />
                    <BscDetailRow label="Cuenta" value={detalle.cuenta} />
                    <BscDetailRow
                      label="Tipo de cuenta"
                      value={detalle.tipoDeCuenta}
                    />
                  </>
                ) : (
                  <BscDetailRow label="Cuenta" value={comprobante.cuenta} />
                )}

                {movimiento !== null ? (
                  <>
                    <BscDetailRow
                      label="Tipo de transacción"
                      value={movimiento.tipo}
                    />
                    {movimiento.referencia !== null ? (
                      <BscDetailRow
                        label="Referencia"
                        value={movimiento.referencia}
                      />
                    ) : null}
                    <BscDetailRow
                      label="Operación"
                      value={esCredito(movimiento) ? 'Crédito' : 'Débito'}
                      valueColor={
                        esCredito(movimiento)
                          ? BscColors.success
                          : BscColors.textPrimary
                      }
                    />
                  </>
                ) : null}
              </View>

              {detalle === null && movimiento === null ? (
                <>
                  <View style={styles.separacionPequena} />
                  <BscBanner
                    tone="neutral"
                    icon="info"
                    title="Sin detalle adicional"
                    subtitle="El core no devolvió más información para este NCF."
                    testID="sin-detalle-ncf"
                  />
                </>
              ) : null}
            </>
          )}
        </>
      )}
    </BscSheet>
  );
}

const styles = StyleSheet.create({
  cabecera: {
    padding: BscSpacing.md,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surfaceVariant,
  },
  // 17 con espaciado 0.4, literal del original.
  ncf: {
    ...BscTextStyles['Body L/18 Bold'],
    color: BscColors.textPrimary,
  },
  fecha: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  // 24 con espaciado negativo, como todos los montos grandes de la app.
  monto: {
    ...BscTextStyles['Title XS/24 Bold'],
    color: BscColors.textPrimary,
  },
  bloqueDeDatos: {
    paddingHorizontal: BscSpacing.md,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surfaceVariant,
  },
  cargando: {
    paddingVertical: BscSpacing.xl,
    alignItems: 'center',
  },
  separacion2: { height: 2 },
  separacionPequena: { height: BscSpacing.sm },
  separacionMedia: { height: BscSpacing.md },
});
