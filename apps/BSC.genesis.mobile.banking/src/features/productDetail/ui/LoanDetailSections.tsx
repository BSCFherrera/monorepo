import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@bsc/shared';

import {
  BscColors,
  BscDetailRow,
  BscDetailSection,
  BscRadius,
  BscTextStyles,
} from '@bsc/design-system';
import {
  avanceDelPrestamo,
  estaCancelado,
  type DetalleDePrestamo,
} from '../data/loanDetailContracts';

/**
 * Los bloques propios del detalle de un préstamo.
 *
 * Portados de `loan_detail_view.dart`: «Progreso del Préstamo», «Próximo Pago»
 * y «Detalles del Préstamo».
 */

export function ProgresoDelPrestamo({
  prestamo,
}: {
  prestamo: DetalleDePrestamo;
}): React.JSX.Element {
  const avance = avanceDelPrestamo(prestamo);
  const monto = (valor: number): string =>
    formatCurrency(valor, prestamo.codigoMoneda);

  return (
    <BscDetailSection
      title="Progreso del Préstamo"
      icon="arrow-up"
      testID="progreso-del-prestamo"
    >
      {/*
        La barra se dibuja con dos vistas superpuestas en vez de con un
        indicador nativo: el de Android tiene su propia altura y su propia
        animación, y aquí hace falta que mida exactamente 10 y que el relleno
        sea el azul de la marca, como en el original.
      */}
      <View style={styles.canalDeLaBarra}>
        <View
          style={[styles.rellenoDeLaBarra, { width: `${avance * 100}%` }]}
          testID="barra-de-avance"
        />
      </View>

      <View style={styles.extremos}>
        <View>
          <Text style={styles.etiquetaPequena}>Pagado</Text>
          <Text style={[styles.cifra, styles.cifraPagada]}>
            {monto(prestamo.totalPagado)}
          </Text>
        </View>
        <View style={styles.alFinal}>
          <Text style={styles.etiquetaPequena}>Desembolsado</Text>
          <Text style={styles.cifra}>{monto(prestamo.montoDesembolsado)}</Text>
        </View>
      </View>

      <Text style={styles.porcentaje}>
        {(avance * 100).toFixed(1)}% completado
      </Text>
    </BscDetailSection>
  );
}

export function ProximoPago({
  prestamo,
}: {
  prestamo: DetalleDePrestamo;
}): React.JSX.Element {
  const monto = (valor: number): string =>
    formatCurrency(valor, prestamo.codigoMoneda);

  return (
    <BscDetailSection
      title="Próximo Pago"
      icon="calendar"
      testID="proximo-pago"
    >
      {prestamo.fechaDeProximaCuota === undefined ? null : (
        <BscDetailRow
          label="Fecha próx. cuota"
          value={prestamo.fechaDeProximaCuota}
          valueColor={BscColors.warning}
          emphasized
        />
      )}
      <BscDetailRow
        label="Cuota No."
        value={`${prestamo.proximoNumeroDeCuota} de ${prestamo.plazoEnMeses}`}
      />

      {/*
        Los dos últimos pagos solo si el core los mandó. En un préstamo recién
        desembolsado no existen, y un cero ahí sugiere que se pagó cero en vez
        de que todavía no se ha pagado nada.
      */}
      {prestamo.ultimoPagoDeCapital === undefined ? null : (
        <BscDetailRow
          label="Último pago capital"
          value={monto(prestamo.ultimoPagoDeCapital)}
        />
      )}
      {prestamo.ultimoPagoDeIntereses === undefined ? null : (
        <BscDetailRow
          label="Último pago interés"
          value={monto(prestamo.ultimoPagoDeIntereses)}
        />
      )}
    </BscDetailSection>
  );
}

export function DetallesDelPrestamo({
  prestamo,
}: {
  prestamo: DetalleDePrestamo;
}): React.JSX.Element {
  const monto = (valor: number): string =>
    formatCurrency(valor, prestamo.codigoMoneda);

  return (
    <BscDetailSection
      title="Detalles del Préstamo"
      icon="info"
      testID="detalles-del-prestamo"
    >
      <BscDetailRow label="No. Préstamo" value={prestamo.numeroDePrestamo} />
      <BscDetailRow label="Titular" value={prestamo.titular} />
      <BscDetailRow label="Tipo" value={prestamo.tipoDePrestamo} />
      <BscDetailRow
        label="Monto desembolsado"
        value={monto(prestamo.montoDesembolsado)}
      />
      <BscDetailRow
        label="Tasa de interés"
        value={`${prestamo.tasaDeInteres}%`}
      />

      {prestamo.tasaAnualEfectiva === undefined ? null : (
        <BscDetailRow
          label="Tasa anual efectiva"
          value={`${prestamo.tasaAnualEfectiva}%`}
        />
      )}
      {prestamo.fechaDelUltimoPagoDeCuota === undefined ? null : (
        <BscDetailRow
          label="Último pago de cuota"
          value={prestamo.fechaDelUltimoPagoDeCuota}
        />
      )}
      {estaCancelado(prestamo) && prestamo.fechaDeCancelacion !== undefined ? (
        <BscDetailRow
          label="Fecha de cancelación"
          value={prestamo.fechaDeCancelacion}
          valueColor={BscColors.success}
          testID="fecha-de-cancelacion"
        />
      ) : null}

      <BscDetailRow label="Plazo" value={`${prestamo.plazoEnMeses} meses`} />
      <BscDetailRow
        label="Saldo de cancelación"
        value={monto(prestamo.saldoDeCancelacion)}
        emphasized
      />
      <BscDetailRow
        label="Intereses pendientes"
        value={monto(prestamo.interesesPendientes)}
      />

      {prestamo.fechaDeDesembolso === undefined ? null : (
        <BscDetailRow
          label="Fecha desembolso"
          value={prestamo.fechaDeDesembolso}
        />
      )}
      {prestamo.fechaDeVencimiento === undefined ? null : (
        <BscDetailRow
          label="Fecha vencimiento"
          value={prestamo.fechaDeVencimiento}
        />
      )}
    </BscDetailSection>
  );
}

const styles = StyleSheet.create({
  canalDeLaBarra: {
    height: 10,
    borderRadius: BscRadius.pill,
    backgroundColor: BscColors.border,
    overflow: 'hidden',
  },
  rellenoDeLaBarra: {
    height: 10,
    borderRadius: BscRadius.pill,
    backgroundColor: BscColors.primary,
  },
  extremos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  alFinal: {
    alignItems: 'flex-end',
  },
  etiquetaPequena: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  cifra: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
  cifraPagada: {
    color: BscColors.success,
  },
  porcentaje: {
    marginTop: 8,
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
});
