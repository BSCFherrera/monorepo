import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency, formatDate, softenDescription } from '@bsc/shared';

import {
  BscCard,
  BscCategoricalColors,
  BscColors,
  BscDetailRow,
  BscListRow,
  BscMeterBar,
  BscPlaceholder,
  BscRadius,
  BscRowDivider,
  BscSectionHeader,
  BscSpacing,
  BscTypography,
  BscTextStyles,
} from '@bsc/ui-native';
import type {
  DetalleDeTarjeta,
  MontosDeLaTarjeta,
} from '../data/creditCardDetailContracts';
import type { Movimiento } from '../data/transactionContracts';

import { desgloseDeConsumos } from './desgloseDeConsumos';
import type { PeriodoDeMovimientos } from './TransactionListSection';

/**
 * La pestaña «Resumen» del detalle de tarjeta.
 *
 * Portada de `_buildOverview` en `credit_card_detail_view.dart`. Son tres
 * bloques: el desglose de consumos del período, los cuatro movimientos más
 * recientes y la ficha de detalles del ciclo.
 *
 * Una advertencia del original que conviene no perder: **el desglose suma los
 * movimientos que se trajeron, que son los del período seleccionado, no los del
 * ciclo de facturación**. Los totales del ciclo viven en el estado de cuenta, y
 * mezclarlos daría una cifra que no cuadra con ningún documento del banco. Por
 * eso el título dice «Últimos 30 días» y no «Este ciclo».
 */

/** Cuántos movimientos enseña el bloque de destacados. */
const DESTACADOS = 4;

export interface CreditCardOverviewProps {
  tarjeta: DetalleDeTarjeta;
  montos: MontosDeLaTarjeta;
  codigoMoneda: number;
  movimientos: Movimiento[];
  periodo: PeriodoDeMovimientos;
  /** Salta a la pestaña de actividad. */
  onVerActividad: () => void;
}

function FilaDeMovimiento({
  movimiento,
  codigoMoneda,
}: {
  movimiento: Movimiento;
  codigoMoneda: number;
}): React.JSX.Element {
  // El comercio manda sobre la descripción: «SUPERMERCADO NACIONAL» le dice al
  // cliente dónde gastó, y «COMPRA POS 004512» no.
  const titulo =
    movimiento.comercio !== undefined && movimiento.comercio.trim() !== ''
      ? movimiento.comercio
      : softenDescription(movimiento.descripcion);

  const esCredito = movimiento.tipo === 'C';
  const inicial = titulo.trim() === '' ? '?' : titulo.trim()[0]!.toUpperCase();

  const subtitulo = [
    formatDate(movimiento.fecha),
    ...(movimiento.tipoDeTransaccion === undefined
      ? []
      : [movimiento.tipoDeTransaccion]),
  ].join(' · ');

  return (
    <BscListRow
      leading={
        <View
          style={[
            styles.avatar,
            esCredito ? styles.avatarDeCredito : styles.avatarDeDebito,
          ]}
        >
          <Text
            style={[
              styles.inicial,
              esCredito ? styles.inicialDeCredito : styles.inicialDeDebito,
            ]}
          >
            {inicial}
          </Text>
        </View>
      }
      title={titulo}
      subtitle={subtitulo}
      trailingLabel={`${esCredito ? '+' : '-'}${formatCurrency(
        movimiento.monto,
        codigoMoneda,
      )}`}
      trailingColor={esCredito ? BscColors.success : BscColors.textPrimary}
    />
  );
}

export function CreditCardOverview({
  tarjeta,
  montos,
  codigoMoneda,
  movimientos,
  periodo,
  onVerActividad,
}: CreditCardOverviewProps): React.JSX.Element {
  const desglose = desgloseDeConsumos(movimientos);
  const monto = (valor: number): string => formatCurrency(valor, codigoMoneda);
  const destacados = movimientos.slice(0, DESTACADOS);

  const hayCorte =
    tarjeta.fechaDeCorte !== undefined && tarjeta.fechaDeCorte !== '';

  return (
    <View>
      {/* ─── Consumos del período ─────────────────────────────────────── */}
      <View style={styles.bloqueDelDesglose}>
        <BscCard testID="desglose-de-consumos">
          <View style={styles.filaDelTitulo}>
            <Text style={styles.tituloDelDesglose}>
              {periodo === 'personalizado'
                ? 'Consumos del período'
                : `Últimos ${periodo} días`}
            </Text>
            {hayCorte ? (
              <Text style={styles.fechaDeCorte}>
                Corte {tarjeta.fechaDeCorte}
              </Text>
            ) : null}
          </View>

          <Text style={styles.totalDelDesglose} testID="total-de-consumos">
            {monto(desglose.total)}
          </Text>

          <Text style={styles.leyendaDelDesglose}>
            {desglose.entradas.length === 0
              ? 'Sin consumos registrados en el período'
              : `Consumos del período en ${desglose.entradas.length} categorías`}
          </Text>

          {desglose.entradas.length === 0 ? null : (
            <View style={styles.barras}>
              {desglose.entradas.map((entrada, indice) => {
                const parte = entrada.monto / desglose.total;
                return (
                  <BscMeterBar
                    key={entrada.etiqueta}
                    label={entrada.etiqueta}
                    value={parte}
                    valueLabel={`${Math.round(parte * 100)}%`}
                    color={
                      BscCategoricalColors[
                        indice % BscCategoricalColors.length
                      ]!
                    }
                  />
                );
              })}
            </View>
          )}
        </BscCard>
      </View>

      {/* ─── Movimientos destacados ───────────────────────────────────── */}
      <View style={styles.bloque}>
        <BscSectionHeader
          title="Movimientos destacados"
          actionLabel="Ver actividad"
          onAction={onVerActividad}
        />
        <BscCard style={styles.tarjetaSinRelleno}>
          {destacados.length === 0 ? (
            <BscPlaceholder
              title="Sin movimientos"
              message="No hay consumos en el período seleccionado."
              testID="tarjeta-sin-movimientos"
            />
          ) : (
            destacados.map((movimiento, indice) => (
              <View
                key={`${movimiento.fecha}-${movimiento.descripcion}-${indice}`}
              >
                {indice > 0 ? <BscRowDivider /> : null}
                <FilaDeMovimiento
                  movimiento={movimiento}
                  codigoMoneda={codigoMoneda}
                />
              </View>
            ))
          )}
        </BscCard>
      </View>

      {/* ─── Detalles del ciclo ───────────────────────────────────────── */}
      <View style={styles.bloque}>
        <BscSectionHeader title="Detalles" />
        <BscCard testID="detalles-de-la-tarjeta">
          <BscDetailRow
            label="Límite de crédito"
            value={monto(montos.limiteDeCredito)}
          />
          <BscDetailRow
            label="Disponible para retiros"
            value={monto(montos.disponibleParaRetiros)}
          />
          <BscDetailRow
            label="Pago de contado"
            value={monto(montos.pagoTotal)}
            emphasized
          />
          {hayCorte ? (
            <BscDetailRow
              label="Fecha de corte"
              value={tarjeta.fechaDeCorte!}
            />
          ) : null}
          {tarjeta.fechaDePago === undefined ||
          tarjeta.fechaDePago === '' ? null : (
            <BscDetailRow
              label="Fecha límite de pago"
              value={tarjeta.fechaDePago}
              valueColor={BscColors.warning}
            />
          )}
          <BscDetailRow
            label="Saldo al corte"
            value={monto(montos.saldoAlCorte)}
          />
          {/*
            El pago vencido solo aparece cuando lo hay. Una fila que diga
            «Pago vencido RD$ 0.00» en rojo asusta sin motivo, y el original la
            oculta por eso.
          */}
          {montos.pagoVencido > 0 ? (
            <BscDetailRow
              label="Pago vencido"
              value={monto(montos.pagoVencido)}
              valueColor={BscColors.error}
              emphasized
              testID="pago-vencido"
            />
          ) : null}
          <BscDetailRow
            label="Consumos después del corte"
            value={monto(montos.debitosDespuesDelCorte)}
          />
          <BscDetailRow
            label="Pagos después del corte"
            value={monto(montos.creditosDespuesDelCorte)}
          />
          {montos.enTransito > 0 ? (
            <BscDetailRow
              label="Transacciones en tránsito"
              value={monto(montos.enTransito)}
            />
          ) : null}
          {tarjeta.fechaDeVencimientoDelPlastico === undefined ? null : (
            <BscDetailRow
              label="Vencimiento de la tarjeta"
              value={tarjeta.fechaDeVencimientoDelPlastico}
            />
          )}
          {/*
            La tasa distingue cero de ausente: escribir «0%» afirmaría una tasa
            que el banco nunca mandó.
          */}
          <BscDetailRow
            label="Tasa de financiamiento"
            value={
              tarjeta.tasaDeFinanciamiento === undefined
                ? 'No disponible'
                : `${tarjeta.tasaDeFinanciamiento}%`
            }
          />
          {tarjeta.tasaAnualEfectiva === undefined ? null : (
            <BscDetailRow
              label="Tasa anual efectiva"
              value={`${tarjeta.tasaAnualEfectiva}%`}
            />
          )}
        </BscCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bloqueDelDesglose: {
    paddingHorizontal: BscSpacing.gutter,
    paddingTop: BscSpacing.lg,
  },
  bloque: {
    paddingHorizontal: BscSpacing.gutter,
    paddingTop: BscSpacing.lg,
  },
  filaDelTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
  },
  tituloDelDesglose: {
    ...BscTypography.titleLarge,
    flex: 1,
  },
  fechaDeCorte: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  totalDelDesglose: {
    ...BscTypography.amountLarge,
    marginTop: BscSpacing.sm,
  },
  leyendaDelDesglose: {
    marginTop: 2,
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  barras: {
    marginTop: BscSpacing.sm,
  },
  tarjetaSinRelleno: {
    padding: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BscRadius.sm,
  },
  avatarDeCredito: {
    backgroundColor: BscColors.successSoft,
  },
  avatarDeDebito: {
    backgroundColor: BscColors.surfaceVariant,
  },
  inicial: {
    ...BscTextStyles['Body MD/16 Bold'],
  },
  inicialDeCredito: {
    color: BscColors.success,
  },
  inicialDeDebito: {
    color: BscColors.textSecondary,
  },
});
