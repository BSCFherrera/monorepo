import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  formatCurrency,
  formatDate,
  formatInteger,
  softenDescription,
} from '@bsc/shared';

import {
  BscBanner,
  BscColors,
  BscIcon,
  BscListRow,
  BscPill,
  BscPlaceholder,
  BscRadius,
  BscRowDivider,
  BscSheet,
  BscSpacing,
  BscSpinner,
  BscTextButton,
  BscTypography,
  BscTextStyles,
} from '@bsc/ui-native';
import {
  estaEnAtraso,
  tieneActividadDelCiclo,
  tienePuntosDelMes,
  type EstadoDeTarjeta,
} from '../data/creditCardStatementContracts';
import type { ProductDetailRepository } from '../data/productDetailRepository';
import { nombreDelMes } from '../data/statementPeriods';

/**
 * El estado de cuenta cerrado de un ciclo.
 *
 * Portada de `CreditCardStatementSheet` en `credit_card_statement_sheet.dart`.
 *
 * Es una hoja con consulta propia: el detalle del producto no puede responder
 * ninguna de estas preguntas —cuántas compras tuvo el ciclo, sobre qué balance
 * se calcula el cargo financiero, qué pasó con los puntos del mes—, así que se
 * pide a `credit-card-management/statement` con el mes y el año del ciclo.
 *
 * El selector de mes **no deja avanzar al mes en curso ni más allá**: un ciclo
 * que no ha cerrado no tiene estado que traer, y la consulta volvería vacía sin
 * que el cliente entendiera por qué.
 */

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; estado: EstadoDeTarjeta };

export interface CreditCardStatementSheetProps {
  visible: boolean;
  repositorio: ProductDetailRepository;
  numeroDeTarjeta: string;
  codigoMoneda: number;
  /** Ciclo con el que abre: el del corte de la tarjeta. */
  mesInicial: number;
  anioInicial: number;
  onClose: () => void;
  hoy?: Date;
}

function Cifra({
  etiqueta,
  valor,
  destacada = false,
}: {
  etiqueta: string;
  valor: string;
  destacada?: boolean;
}): React.JSX.Element {
  return (
    <View style={styles.cifra}>
      <Text style={styles.etiquetaDeCifra}>{etiqueta}</Text>
      <Text
        style={[styles.valorDeCifra, destacada ? styles.valorDestacado : null]}
      >
        {valor}
      </Text>
    </View>
  );
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <View style={styles.seccion}>
      <Text style={BscTypography.titleMedium}>{titulo}</Text>
      <View style={styles.cajaDeSeccion}>{children}</View>
    </View>
  );
}

function Fila({
  etiqueta,
  valor,
  color,
  destacado = false,
}: {
  etiqueta: string;
  valor: string;
  color?: string | undefined;
  destacado?: boolean;
}): React.JSX.Element {
  return (
    <View style={styles.fila}>
      <Text style={styles.etiquetaDeFila}>{etiqueta}</Text>
      <Text
        style={[
          styles.valorDeFila,
          destacado ? styles.valorDeFilaDestacado : null,
          color === undefined ? null : { color },
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

export function CreditCardStatementSheet({
  visible,
  repositorio,
  numeroDeTarjeta,
  codigoMoneda,
  mesInicial,
  anioInicial,
  onClose,
  hoy = new Date(),
}: CreditCardStatementSheetProps): React.JSX.Element {
  const [ciclo, setCiclo] = useState({ mes: mesInicial, anio: anioInicial });
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

  const cargar = useCallback(
    async (mes: number, anio: number): Promise<void> => {
      setEstado({ tipo: 'cargando' });
      try {
        const leido = await repositorio.obtenerEstadoDeTarjeta({
          numeroDeTarjeta,
          codigoMoneda,
          mes,
          anio,
        });
        setEstado({ tipo: 'listo', estado: leido });
      } catch {
        setEstado({
          tipo: 'error',
          mensaje: 'No encontramos un estado cerrado para este ciclo.',
        });
      }
    },
    [repositorio, numeroDeTarjeta, codigoMoneda],
  );

  // Solo se consulta con la hoja abierta: montarla cerrada dispararía una
  // llamada al backend por cada tarjeta que el cliente abre sin tocar nada.
  useEffect(() => {
    if (!visible) return;
    void cargar(ciclo.mes, ciclo.anio);
  }, [visible, ciclo, cargar]);

  const moverCiclo = (paso: number): void => {
    const movido = new Date(ciclo.anio, ciclo.mes - 1 + paso, 1);
    setCiclo({ mes: movido.getMonth() + 1, anio: movido.getFullYear() });
  };

  const cargando = estado.tipo === 'cargando';
  // Un ciclo que no ha cerrado no tiene estado que traer.
  const esElMesEnCursoOPosterior =
    ciclo.anio > hoy.getFullYear() ||
    (ciclo.anio === hoy.getFullYear() && ciclo.mes >= hoy.getMonth() + 1);

  const monto = (valor: number): string => formatCurrency(valor, codigoMoneda);

  return (
    <BscSheet
      visible={visible}
      title="Estado de cuenta"
      onClose={onClose}
      testID="hoja-de-estado-de-cuenta"
    >
      <View style={styles.selectorDeMes}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ciclo anterior"
          disabled={cargando}
          onPress={() => moverCiclo(-1)}
          style={styles.flecha}
          testID="ciclo-anterior"
        >
          <BscIcon
            name="chevron-left"
            size={22}
            color={cargando ? BscColors.textTertiary : BscColors.primary}
          />
        </Pressable>

        <Text style={styles.mesDelCiclo} testID="ciclo-actual">
          {nombreDelMes(ciclo.mes)} {ciclo.anio}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ciclo siguiente"
          disabled={cargando || esElMesEnCursoOPosterior}
          onPress={() => moverCiclo(1)}
          style={styles.flecha}
          testID="ciclo-siguiente"
        >
          <BscIcon
            name="chevron-right"
            size={22}
            color={
              cargando || esElMesEnCursoOPosterior
                ? BscColors.textTertiary
                : BscColors.primary
            }
          />
        </Pressable>
      </View>

      {estado.tipo === 'cargando' ? (
        <View style={styles.cargando}>
          <BscSpinner tamano="screenList" />
        </View>
      ) : null}

      {estado.tipo === 'error' ? (
        <BscPlaceholder
          title="Sin estado para este ciclo"
          message={estado.mensaje}
          testID="estado-sin-ciclo"
          action={
            <BscTextButton
              label="Reintentar"
              onPress={() => {
                void cargar(ciclo.mes, ciclo.anio);
              }}
            />
          }
        />
      ) : null}

      {estado.tipo === 'listo' ? (
        <View>
          {estaEnAtraso(estado.estado) ? (
            <View style={styles.aviso}>
              <BscBanner
                tone="danger"
                icon="warning"
                title={`Pago vencido ${monto(estado.estado.pagoVencido)}`}
                subtitle={
                  estado.estado.cuotasEnAtraso > 0
                    ? `${estado.estado.cuotasEnAtraso} cuota(s) en atraso`
                    : undefined
                }
                testID="estado-en-atraso"
              />
            </View>
          ) : null}

          <View style={styles.cabeceraDelCiclo}>
            <Text style={BscTypography.titleMedium}>
              {estado.estado.nombreDelProducto}
            </Text>
            <Text style={styles.sobretitulo}>Balance al corte</Text>
            <Text style={BscTypography.amountLarge} testID="balance-al-corte">
              {monto(estado.estado.saldoAlCorte)}
            </Text>

            <View style={styles.filaDeCifras}>
              {estado.estado.fechaDeCorte === undefined ? null : (
                <Cifra etiqueta="Corte" valor={estado.estado.fechaDeCorte} />
              )}
              {estado.estado.fechaDePago === undefined ? null : (
                <Cifra
                  etiqueta="Vence"
                  valor={estado.estado.fechaDePago}
                  destacada
                />
              )}
            </View>
          </View>

          <Seccion titulo="Pagos del ciclo">
            <Fila
              etiqueta="Pago mínimo"
              valor={monto(estado.estado.pagoMinimo)}
            />
            <Fila
              etiqueta="Pago de contado"
              valor={monto(estado.estado.pagoDeContado)}
              destacado
            />
            <Fila
              etiqueta="Balance anterior"
              valor={monto(estado.estado.balanceAnterior)}
            />
            <Fila
              etiqueta="Último pago recibido"
              valor={monto(estado.estado.ultimoPagoRecibido)}
              color={
                estado.estado.ultimoPagoRecibido > 0
                  ? BscColors.success
                  : undefined
              }
            />
            {estado.estado.excesoDeLimite > 0 ? (
              <Fila
                etiqueta="Exceso de límite"
                valor={monto(estado.estado.excesoDeLimite)}
                color={BscColors.error}
              />
            ) : null}
          </Seccion>

          {tieneActividadDelCiclo(estado.estado) ? (
            <Seccion titulo="Actividad del ciclo">
              <Fila
                etiqueta="Compras"
                valor={`${estado.estado.cantidadDeCompras} · ${monto(
                  estado.estado.montoDeCompras,
                )}`}
              />
              <Fila
                etiqueta="Avances de efectivo"
                valor={`${estado.estado.cantidadDeAvances} · ${monto(
                  estado.estado.montoDeAvances,
                )}`}
              />
            </Seccion>
          ) : null}

          <Seccion titulo="Cargo financiero">
            <Fila
              etiqueta="Tasa de financiamiento"
              valor={`${estado.estado.tasaDelCargoFinanciero}%`}
            />
            <Fila
              etiqueta="Balance promedio diario"
              valor={monto(estado.estado.balancePromedioDiario)}
            />
            <Fila
              etiqueta="Balance sujeto a financiamiento"
              valor={monto(estado.estado.balanceSujetoAFinanciamiento)}
            />
          </Seccion>

          {tienePuntosDelMes(estado.estado) ? (
            <Seccion titulo="Puntos del mes">
              <Fila
                etiqueta="Acumulados"
                valor={formatInteger(estado.estado.puntosAcumulados)}
                color={BscColors.success}
              />
              <Fila
                etiqueta="Canjeados"
                valor={formatInteger(estado.estado.puntosCanjeados)}
              />
              <Fila
                etiqueta="Expirados"
                valor={formatInteger(estado.estado.puntosVencidos)}
                color={
                  estado.estado.puntosVencidos > 0
                    ? BscColors.warning
                    : undefined
                }
              />
            </Seccion>
          ) : null}

          {estado.estado.movimientos.length === 0 ? null : (
            <View style={styles.seccion}>
              <View style={styles.tituloConCuenta}>
                <Text style={[BscTypography.titleMedium, styles.tituloAncho]}>
                  Movimientos del ciclo
                </Text>
                <BscPill label={String(estado.estado.movimientos.length)} />
              </View>

              <View style={styles.cajaDeMovimientos}>
                {estado.estado.movimientos.map((movimiento, indice) => (
                  <View
                    key={`${movimiento.fecha}-${movimiento.descripcion}-${indice}`}
                  >
                    {indice > 0 ? <BscRowDivider /> : null}
                    <BscListRow
                      title={softenDescription(
                        movimiento.comercio !== undefined &&
                          movimiento.comercio.trim() !== ''
                          ? movimiento.comercio
                          : movimiento.descripcion,
                      )}
                      subtitle={formatDate(movimiento.fecha)}
                      trailingLabel={`${
                        movimiento.tipo === 'C' ? '+' : '-'
                      }${monto(movimiento.monto)}`}
                      trailingColor={
                        movimiento.tipo === 'C'
                          ? BscColors.success
                          : BscColors.textPrimary
                      }
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {estado.estado.numeroDeComprobanteFiscal === undefined ? null : (
            <Text style={styles.comprobante}>
              NCF {estado.estado.numeroDeComprobanteFiscal}
            </Text>
          )}
        </View>
      ) : null}
    </BscSheet>
  );
}

const styles = StyleSheet.create({
  selectorDeMes: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surfaceVariant,
  },
  flecha: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesDelCiclo: {
    ...BscTypography.titleMedium,
    flex: 1,
    textAlign: 'center',
  },
  cargando: {
    paddingVertical: BscSpacing.xxl,
    alignItems: 'center',
  },
  aviso: {
    marginTop: BscSpacing.md,
  },
  cabeceraDelCiclo: {
    marginTop: BscSpacing.md,
    padding: BscSpacing.md,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surfaceVariant,
  },
  sobretitulo: {
    ...BscTypography.overline,
    marginTop: BscSpacing.xs,
  },
  filaDeCifras: {
    flexDirection: 'row',
    marginTop: BscSpacing.sm,
  },
  cifra: {
    flex: 1,
  },
  etiquetaDeCifra: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textTertiary,
  },
  valorDeCifra: {
    marginTop: 2,
    ...BscTextStyles['Body S/14 Bold'],
    color: BscColors.textPrimary,
  },
  valorDestacado: {
    color: BscColors.warning,
  },
  seccion: {
    marginTop: BscSpacing.md,
  },
  cajaDeSeccion: {
    marginTop: BscSpacing.xxs,
    paddingHorizontal: BscSpacing.md,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surfaceVariant,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 7,
    gap: BscSpacing.sm,
  },
  etiquetaDeFila: {
    flex: 1,
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
  },
  valorDeFila: {
    flexShrink: 1,
    textAlign: 'right',
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
  valorDeFilaDestacado: {
    fontWeight: '700',
  },
  tituloConCuenta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
  },
  tituloAncho: {
    flex: 1,
  },
  cajaDeMovimientos: {
    marginTop: BscSpacing.xs,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surfaceVariant,
    overflow: 'hidden',
  },
  comprobante: {
    marginTop: BscSpacing.md,
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textTertiary,
  },
});
