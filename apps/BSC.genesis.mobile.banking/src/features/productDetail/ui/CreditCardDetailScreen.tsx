import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { CURRENCY, formatInteger } from '@bsc/shared';

import {
  BscColors,
  BscGradients,
  BscPlaceholder,
  BscSegmented,
  BscSpacing,
  BscSpinner,
  BscTextButton,
  withAlpha,
} from '@bsc/ui-native';
import { matchingPreset, lastDaysRange } from '@bsc/utils';
import { type DateRange } from '@bsc/contracts';
import {
  montosEnMoneda,
  type DetalleDeTarjeta,
} from '../data/creditCardDetailContracts';
import type { ProductDetailRepository } from '../data/productDetailRepository';
import { cicloDelCorte } from '../data/statementPeriods';
import type { Movimiento } from '../data/transactionContracts';

import { CreditCardOverview } from './CreditCardOverview';
import {
  HojaDeDatosDeLaTarjeta,
  HojaDeLimites,
  HojaDeOpcionesDeEstados,
  HojaDePago,
  HojaDePuntos,
} from './CreditCardSheets';
import { CreditCardStatementSheet } from './CreditCardStatementSheet';
import { CreditCardSummaryCard } from './CreditCardSummaryCard';
import {
  ESPACIO_BAJO_LA_BARRA,
  ProductActionBar,
  ProductBrandAction,
  type ProductActionItem,
} from './ProductDetailChrome';
import { ProductDetailHeader } from './ProductDetailHeader';
import { StatementPdfSheet } from './StatementPdfSheet';
import {
  TransactionListSection,
  type PeriodoDeMovimientos,
} from './TransactionListSection';

/**
 * Detalle de una tarjeta de crédito.
 *
 * Portada de `credit_card_detail_view.dart`, la pantalla más grande del
 * original con sus 995 líneas. **No comparte pantalla con los demás productos**
 * y por eso vive aparte: una cuenta o un préstamo tienen un saldo y una lista
 * de movimientos, mientras que una tarjeta lleva dos ciclos a la vez —uno en
 * pesos y otro en dólares—, pestañas propias, cuatro hojas de acción y su
 * propio estado de cuenta.
 *
 * El selector de moneda de la cabecera no es un detalle cosmético: **cambia la
 * pantalla entera**, porque los dos ciclos son documentos distintos, con su
 * propio balance, su propio pago mínimo y su propia fecha de vencimiento. No se
 * consolidan: sumarlos con una tasa daría una cifra que no aparece en ningún
 * estado de cuenta y que el cliente no podría pagar.
 */

/** Qué hay en la barra inferior, en el orden del original. */
const BARRA: readonly ProductActionItem[] = [
  { label: 'Resumen', icon: 'dashboard' },
  { label: 'Actividad', icon: 'receipt' },
  { label: 'Pagar', icon: 'payments', isAction: true },
  { label: 'Estados', icon: 'document', isAction: true },
  { label: 'Límites', icon: 'sliders', isAction: true },
];

const RESUMEN = 0;
const ACTIVIDAD = 1;

type EstadoDeCarga =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; tarjeta: DetalleDeTarjeta };

/** Cuál de las hojas está abierta. Solo puede haber una. */
type HojaAbierta =
  | 'ninguna'
  | 'puntos'
  | 'numero'
  | 'pago'
  | 'limites'
  | 'estados'
  | 'ciclo'
  | 'pdf';

export interface CreditCardDetailScreenProps {
  repositorio: ProductDetailRepository;
  numeroDeTarjeta: string;
  numeroEnmascarado?: string | undefined;
  onBack: () => void;
  onActivity: () => void;
  /** Lleva al flujo de pagos, que todavía no está migrado. */
  onPagar?: (opciones: {
    numeroDeTarjeta: string;
    codigoMoneda: number;
  }) => void;
  hoy?: Date;
}

export function CreditCardDetailScreen({
  repositorio,
  numeroDeTarjeta,
  numeroEnmascarado,
  onBack,
  onActivity,
  onPagar,
  hoy = new Date(),
}: CreditCardDetailScreenProps): React.JSX.Element {
  const [estado, setEstado] = useState<EstadoDeCarga>({ tipo: 'cargando' });
  const [enPesos, setEnPesos] = useState(true);
  const [pestana, setPestana] = useState(RESUMEN);
  const [hoja, setHoja] = useState<HojaAbierta>('ninguna');
  const [refrescando, setRefrescando] = useState(false);

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargandoMovimientos, setCargandoMovimientos] = useState(true);
  const [periodo, setPeriodo] = useState<PeriodoDeMovimientos>(30);
  const [rango, setRango] = useState<DateRange>(() => lastDaysRange(30, hoy));

  const codigoMoneda = enPesos ? CURRENCY.DOP : CURRENCY.USD;

  const cargarDetalle = useCallback(async (): Promise<void> => {
    try {
      const tarjeta = await repositorio.obtenerDetalleDeTarjeta({
        numeroDeTarjeta,
        numeroEnmascarado,
      });
      setEstado({ tipo: 'listo', tarjeta });
    } catch {
      setEstado({
        tipo: 'error',
        mensaje: 'No pudimos cargar la tarjeta. Intenta de nuevo.',
      });
    }
  }, [repositorio, numeroDeTarjeta, numeroEnmascarado]);

  useEffect(() => {
    void cargarDetalle();
  }, [cargarDetalle]);

  /**
   * Los movimientos se vuelven a pedir **también al cambiar de moneda**.
   *
   * La app Flutter no lo hace: fija el código de moneda en `214` al abrir la
   * tarjeta y no lo toca al mover el selector, así que con «US$» encima la
   * pantalla enseña los balances en dólares junto a los movimientos en pesos, y
   * el total de «Consumos del período» sale de esos movimientos pero escrito
   * con el símbolo del dólar. Aquí los dos ciclos se consultan por separado,
   * que es lo que son.
   */
  const cargarMovimientos = useCallback(
    async (rangoAConsultar: DateRange, moneda: number): Promise<void> => {
      setCargandoMovimientos(true);
      try {
        const leidos = await repositorio.obtenerMovimientos({
          numeroDeProducto: numeroDeTarjeta,
          tipoDeProducto: 'TC',
          codigoMoneda: moneda,
          rango: rangoAConsultar,
        });
        setMovimientos(leidos);
      } catch {
        // La lista tiene su propio estado vacío; el detalle sigue en pie. El
        // cliente no se queda sin ver su balance porque falle una consulta de
        // movimientos.
        setMovimientos([]);
      } finally {
        setCargandoMovimientos(false);
      }
    },
    [repositorio, numeroDeTarjeta],
  );

  useEffect(() => {
    void cargarMovimientos(rango, codigoMoneda);
  }, [cargarMovimientos, rango, codigoMoneda]);

  const refrescar = useCallback(async (): Promise<void> => {
    setRefrescando(true);
    onActivity();
    await Promise.all([
      cargarDetalle(),
      cargarMovimientos(rango, codigoMoneda),
    ]);
    setRefrescando(false);
  }, [cargarDetalle, cargarMovimientos, rango, codigoMoneda, onActivity]);

  const tarjeta = estado.tipo === 'listo' ? estado.tarjeta : null;
  const montos =
    tarjeta === null ? null : montosEnMoneda(tarjeta, codigoMoneda);

  // El ciclo con el que abre la hoja de estado de cuenta: el del corte que
  // reporta la propia tarjeta, mejor que suponer «el mes pasado».
  const ciclo = useMemo(
    () => cicloDelCorte(tarjeta?.fechaDeCorte, hoy),
    [tarjeta?.fechaDeCorte, hoy],
  );

  const tocarBarra = (indice: number): void => {
    onActivity();

    if (indice === RESUMEN || indice === ACTIVIDAD) {
      setPestana(indice);
      return;
    }

    // Las acciones necesitan el detalle cargado: no hay monto que pagar ni
    // límite que enseñar mientras la consulta no ha vuelto.
    if (tarjeta === null) return;

    if (indice === 2) setHoja('pago');
    if (indice === 3) setHoja('estados');
    if (indice === 4) setHoja('limites');
  };

  const cerrarHoja = (): void => setHoja('ninguna');

  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        onScrollBeginDrag={onActivity}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => {
              void refrescar();
            }}
            tintColor={BscColors.primary}
          />
        }
        testID="tarjeta-contenido"
      >
        <ProductDetailHeader
          title="Tarjeta de crédito"
          gradient={BscGradients.creditCard}
          onBack={onBack}
          trailing={
            <BscSegmented
              labels={['RD$', 'US$']}
              selectedIndex={enPesos ? 0 : 1}
              onChange={indice => {
                onActivity();
                setEnPesos(indice === 0);
              }}
              background={withAlpha('#FFFFFF', 0.18)}
              textColor={BscColors.textOnDark}
              testID="selector-de-moneda"
            />
          }
        >
          {tarjeta !== null && montos !== null ? (
            <>
              <CreditCardSummaryCard
                tarjeta={tarjeta}
                montos={montos}
                codigoMoneda={codigoMoneda}
                onPagar={() => setHoja('pago')}
              />

              <View style={styles.accionesDeMarca}>
                <ProductBrandAction
                  icon="gift"
                  label="Beneficios"
                  caption={
                    tarjeta.puntos.balance > 0
                      ? `${formatInteger(tarjeta.puntos.balance)} pts`
                      : undefined
                  }
                  onPress={() => setHoja('puntos')}
                />
                <ProductBrandAction
                  icon="card"
                  label="Ver número"
                  onPress={() => setHoja('numero')}
                />
                <ProductBrandAction
                  icon="document"
                  label="Estados"
                  onPress={() => setHoja('estados')}
                />
                <ProductBrandAction
                  icon="sliders"
                  label="Límites"
                  onPress={() => setHoja('limites')}
                />
              </View>
            </>
          ) : null}
        </ProductDetailHeader>

        {estado.tipo === 'cargando' ? (
          <View style={styles.cargando}>
            <BscSpinner />
          </View>
        ) : null}

        {estado.tipo === 'error' ? (
          <BscPlaceholder
            tone="error"
            title="No pudimos cargar la tarjeta"
            message={estado.mensaje}
            testID="tarjeta-error"
            action={
              <BscTextButton
                label="Reintentar"
                onPress={() => {
                  setEstado({ tipo: 'cargando' });
                  void cargarDetalle();
                }}
              />
            }
          />
        ) : null}

        {tarjeta !== null && montos !== null ? (
          pestana === RESUMEN ? (
            <CreditCardOverview
              tarjeta={tarjeta}
              montos={montos}
              codigoMoneda={codigoMoneda}
              movimientos={movimientos}
              periodo={periodo}
              onVerActividad={() => setPestana(ACTIVIDAD)}
            />
          ) : (
            <TransactionListSection
              movimientos={movimientos}
              cargando={cargandoMovimientos}
              codigoMoneda={codigoMoneda}
              periodo={periodo}
              rango={rango}
              hoy={hoy}
              onPeriodo={dias => {
                onActivity();
                setPeriodo(dias);
                setRango(lastDaysRange(dias, hoy));
              }}
              onRangoPersonalizado={elegido => {
                onActivity();
                // Si el rango elegido a mano coincide con una píldora fija, se
                // enciende esa: dos píldoras para el mismo período confunden.
                const coincide = matchingPreset(elegido, hoy);
                setPeriodo(
                  coincide === 'last30Days'
                    ? 30
                    : coincide === 'last60Days'
                    ? 60
                    : coincide === 'last90Days'
                    ? 90
                    : 'personalizado',
                );
                setRango(elegido);
              }}
            />
          )
        ) : null}
      </ScrollView>

      <ProductActionBar
        items={BARRA}
        currentIndex={pestana}
        onPress={tocarBarra}
        testID="barra-de-la-tarjeta"
      />

      {/* ─── Hojas ────────────────────────────────────────────────────── */}
      {tarjeta !== null && montos !== null ? (
        <>
          {/*
            Cada hoja se monta solo mientras está abierta. Con las siete
            montadas a la vez, la de estado de cuenta consultaría al backend en
            cuanto se abre la tarjeta, sin que nadie haya pedido nada.
          */}
          {hoja === 'puntos' ? (
            <HojaDePuntos visible tarjeta={tarjeta} onClose={cerrarHoja} />
          ) : null}

          {hoja === 'numero' ? (
            <HojaDeDatosDeLaTarjeta
              visible
              tarjeta={tarjeta}
              onClose={cerrarHoja}
            />
          ) : null}

          {hoja === 'pago' ? (
            <HojaDePago
              visible
              tarjeta={tarjeta}
              montos={montos}
              codigoMoneda={codigoMoneda}
              onClose={cerrarHoja}
              onContinuar={() => {
                cerrarHoja();
                onPagar?.({ numeroDeTarjeta, codigoMoneda });
              }}
            />
          ) : null}

          {hoja === 'limites' ? (
            <HojaDeLimites
              visible
              tarjeta={tarjeta}
              montos={montos}
              codigoMoneda={codigoMoneda}
              onClose={cerrarHoja}
            />
          ) : null}

          {hoja === 'estados' ? (
            <HojaDeOpcionesDeEstados
              visible
              onClose={cerrarHoja}
              onVerCiclo={() => setHoja('ciclo')}
              onDescargar={() => setHoja('pdf')}
            />
          ) : null}

          {hoja === 'ciclo' ? (
            <CreditCardStatementSheet
              visible
              repositorio={repositorio}
              numeroDeTarjeta={numeroDeTarjeta}
              codigoMoneda={codigoMoneda}
              mesInicial={ciclo.mes}
              anioInicial={ciclo.anio}
              onClose={cerrarHoja}
              hoy={hoy}
            />
          ) : null}

          {hoja === 'pdf' ? (
            <StatementPdfSheet
              visible
              repositorio={repositorio}
              tipo="tarjeta"
              numeroDeProducto={numeroDeTarjeta}
              codigoMoneda={codigoMoneda}
              onClose={cerrarHoja}
              hoy={hoy}
            />
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  contenido: {
    flexGrow: 1,
    paddingBottom: ESPACIO_BAJO_LA_BARRA,
  },
  accionesDeMarca: {
    flexDirection: 'row',
    marginTop: BscSpacing.lg,
  },
  cargando: {
    paddingVertical: BscSpacing.xxl,
    alignItems: 'center',
  },
});
