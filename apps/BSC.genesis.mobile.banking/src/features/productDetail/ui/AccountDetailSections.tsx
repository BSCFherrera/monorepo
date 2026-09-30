import { formatCurrency } from '@bsc/shared';

import { BscColors, BscDetailRow, BscDetailSection } from '@bsc/design-system';
import {
  estaActiva,
  tieneSobregiroOTransito,
  type DetalleDeCuenta,
} from '../data/accountDetailContracts';

/**
 * Los bloques propios del detalle de una cuenta.
 *
 * Portados de `account_detail_view.dart`: «Resumen de Balance», «Información de
 * Cuenta» y «Sobregiro y tránsito». Van aparte de la pantalla porque la
 * pantalla ya carga con la cabecera, los movimientos y el estado de carga, y
 * porque las tres secciones tienen reglas propias sobre qué fila se muestra.
 *
 * **Casi todas esas reglas son la misma:** una cifra en cero no se imprime. Un
 * «Saldo embargado: RD$ 0.00» le dice al cliente que existe un embargo, y un
 * «Límite de sobregiro: RD$ 0.00» se lee como una negativa del banco. El
 * original es cuidadoso con esto y aquí se conserva fila por fila.
 */

export function ResumenDeBalance({
  cuenta,
}: {
  cuenta: DetalleDeCuenta;
}): React.JSX.Element {
  const monto = (valor: number): string =>
    formatCurrency(valor, cuenta.codigoMoneda);

  return (
    <BscDetailSection
      title="Resumen de Balance"
      icon="wallet"
      testID="resumen-de-balance"
    >
      <BscDetailRow
        label="Saldo disponible"
        value={monto(cuenta.saldoDisponible)}
        valueColor={BscColors.primary}
        emphasized
        testID="saldo-disponible"
      />
      <BscDetailRow label="Saldo total" value={monto(cuenta.saldoTotal)} />

      {/*
        Las tres siguientes solo aparecen cuando hay algo que decir. Son las
        malas noticias de una cuenta —dinero retenido, embargado o sin
        acreditar— y enseñarlas en cero alarma sin motivo.
      */}
      {cuenta.saldoRetenido > 0 ? (
        <BscDetailRow
          label="Saldo retenido"
          value={monto(cuenta.saldoRetenido)}
          valueColor={BscColors.warning}
          testID="saldo-retenido"
        />
      ) : null}
      {cuenta.saldoEmbargado > 0 ? (
        <BscDetailRow
          label="Saldo embargado"
          value={monto(cuenta.saldoEmbargado)}
          valueColor={BscColors.error}
          testID="saldo-embargado"
        />
      ) : null}
      {cuenta.saldoEnTransito > 0 ? (
        <BscDetailRow
          label="Saldo en tránsito"
          value={monto(cuenta.saldoEnTransito)}
          testID="saldo-en-transito"
        />
      ) : null}
    </BscDetailSection>
  );
}

export function InformacionDeCuenta({
  cuenta,
}: {
  cuenta: DetalleDeCuenta;
}): React.JSX.Element {
  const activa = estaActiva(cuenta);

  return (
    <BscDetailSection
      title="Información de Cuenta"
      icon="info"
      testID="informacion-de-cuenta"
    >
      <BscDetailRow label="Titular" value={cuenta.titular} />

      {cuenta.numeroDeCuentaNacional === undefined ? null : (
        <BscDetailRow
          label="No. Cuenta"
          value={cuenta.numeroDeCuentaNacional}
        />
      )}

      <BscDetailRow
        label="Estado"
        value={activa ? 'Activa' : 'Inactiva'}
        valueColor={activa ? BscColors.success : BscColors.error}
        testID="estado-de-la-cuenta"
      />

      {cuenta.sucursal === undefined ? null : (
        <BscDetailRow label="Sucursal" value={cuenta.sucursal} />
      )}
      {cuenta.fechaDeApertura === undefined ? null : (
        <BscDetailRow label="Fecha apertura" value={cuenta.fechaDeApertura} />
      )}
      {cuenta.fechaDelUltimoMovimiento === undefined ? null : (
        <BscDetailRow
          label="Fecha de último movimiento"
          value={cuenta.fechaDelUltimoMovimiento}
        />
      )}

      {/*
        La cuenta regional solo si es distinta de la nacional: cuando el core
        manda las dos iguales, repetir el mismo número en dos filas seguidas
        hace dudar de cuál es la buena.
      */}
      {cuenta.numeroDeCuentaRegional !== undefined &&
      cuenta.numeroDeCuentaRegional !== cuenta.numeroDeCuentaNacional ? (
        <BscDetailRow
          label="Cuenta regional"
          value={cuenta.numeroDeCuentaRegional}
        />
      ) : null}

      {cuenta.tasaDeInteres !== undefined && cuenta.tasaDeInteres > 0 ? (
        <BscDetailRow
          label="Tasa de interés"
          value={`${cuenta.tasaDeInteres}%`}
        />
      ) : null}
    </BscDetailSection>
  );
}

/**
 * Sobregiro y línea de tránsito.
 *
 * **Devuelve nada cuando la cuenta no tiene ninguno de los dos**, en vez de
 * imprimir seis filas en cero. Quien la usa no necesita saber la regla: basta
 * con ponerla en la lista.
 */
export function SobregiroYTransito({
  cuenta,
}: {
  cuenta: DetalleDeCuenta;
}): React.JSX.Element | null {
  if (!tieneSobregiroOTransito(cuenta)) return null;

  const monto = (valor: number): string =>
    formatCurrency(valor, cuenta.codigoMoneda);

  return (
    <BscDetailSection
      title="Sobregiro y tránsito"
      icon="bank"
      testID="sobregiro-y-transito"
    >
      <BscDetailRow
        label="Límite de sobregiro pactado"
        value={monto(cuenta.limiteDeSobregiro)}
      />
      <BscDetailRow
        label="Sobregiro pactado disponible"
        value={monto(cuenta.sobregiroDisponible)}
      />

      {cuenta.interesesPorSobregiroNoPactado > 0 ? (
        <BscDetailRow
          label="Intereses por sobregiro no pactado"
          value={monto(cuenta.interesesPorSobregiroNoPactado)}
          valueColor={BscColors.warning}
          testID="intereses-sobregiro-no-pactado"
        />
      ) : null}

      <BscDetailRow
        label="Límite línea de tránsito"
        value={monto(cuenta.limiteDeLineaDeTransito)}
      />
      <BscDetailRow
        label="Disponible línea de tránsito"
        value={monto(cuenta.lineaDeTransitoDisponible)}
      />
      <BscDetailRow
        label="Total disponible sobregiro y tránsito"
        value={monto(cuenta.totalDisponibleSobregiroYTransito)}
        emphasized
      />
    </BscDetailSection>
  );
}
