import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { formatAmount, formatDOP } from '@bsc/shared';

import {
  BscColors,
  BscIcon,
  BscPageHeader,
  BscPrimaryButton,
  BscRadius,
  BscSelect,
  BscShadows,
  BscSpacing,
  BscSpinner,
  withAlpha,
  BscTextStyles,
} from '@bsc/ui-native';
import { ERROR_DE_TASA_DE_CAMBIO } from '../../../app/medidasDeLasOchoPantallas';
import {
  convertirAPesos,
  nombreDeMoneda,
  simboloDeMoneda,
  type TasaDeCambio,
} from '../data/exchangeRateContracts';
import type { ExchangeRateRepository } from '../data/exchangeRateRepository';

/**
 * Tasa de cambio.
 *
 * Portada de `exchange_rates_screen.dart`, con sus medidas literales: la
 * cabecera azul de la tabla con 16 de lado y 14 arriba y abajo, las filas con
 * 16 y 16, las columnas repartidas 3-2-2, y el resultado del conversor a 24.
 *
 * La compra va en verde y la venta en el color secundario **porque el original
 * lo hace así**, y esa es la convención que el cliente ya conoce del portal.
 */

export interface ExchangeRatesScreenProps {
  repositorio: ExchangeRateRepository;
  onBack: () => void;
  onActivity?: (() => void) | undefined;
}

export function ExchangeRatesScreen({
  repositorio,
  onBack,
  onActivity,
}: ExchangeRatesScreenProps): React.JSX.Element {
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [tasas, setTasas] = useState<TasaDeCambio[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      setTasas(await repositorio.tasas());
    } catch {
      setError('No se pudieron obtener las tasas de cambio');
    }

    setCargando(false);
    setRefrescando(false);
  }, [repositorio]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return (
    <View style={estilosDeTasaDeCambio.pantalla}>
      <BscPageHeader
        title="Tasa de cambio"
        subtitle="Compra y venta del día"
        onBack={onBack}
        testID="cabecera-tasas"
      />

      {cargando ? (
        <View style={estilosDeTasaDeCambio.centro}>
          <BscSpinner />
        </View>
      ) : error !== null ? (
        <VistaDeError
          mensaje={error}
          onReintentar={() => {
            setCargando(true);
            void cargar();
          }}
          testID="error-tasas"
        />
      ) : tasas.length === 0 ? (
        <VistaDeError
          mensaje="No hay tasas de cambio disponibles"
          testID="sin-tasas"
        />
      ) : (
        <ScrollView
          contentContainerStyle={estilosDeTasaDeCambio.contenido}
          onScrollBeginDrag={onActivity}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              tintColor={BscColors.primary}
              colors={[BscColors.primary]}
              onRefresh={() => {
                setRefrescando(true);
                void cargar();
              }}
            />
          }
        >
          <TablaDeTasas tasas={tasas} />

          <View style={estilosDeTasaDeCambio.separacion24} />

          <Conversor tasas={tasas} onActivity={onActivity} />

          <View style={estilosDeTasaDeCambio.separacion16} />

          <Text style={estilosDeTasaDeCambio.nota}>
            Las tasas son referenciales y pueden variar al momento de realizar
            una transacción.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

/**
 * La vista de error de esta pantalla, que **no** es el estado vacío genérico.
 *
 * `_ErrorView` de `exchange_rates_screen.dart` es propia: icono de error de 48
 * en rojo, sin el círculo gris ni el título del `BscEmptyState`, el mensaje
 * centrado y —solo si hay a dónde volver— un botón de 200 de ancho y 46 de
 * alto. El original la usa también para «No hay tasas de cambio disponibles»,
 * sin botón, así que las dos situaciones se ven igual.
 */
function VistaDeError({
  mensaje,
  onReintentar,
  testID,
}: {
  mensaje: string;
  onReintentar?: (() => void) | undefined;
  testID?: string;
}): React.JSX.Element {
  return (
    <View style={estilosDeTasaDeCambio.centro}>
      <View style={estilosDeTasaDeCambio.zonaDeError} testID={testID}>
        <BscIcon
          name="error"
          size={ERROR_DE_TASA_DE_CAMBIO.icono}
          color={BscColors.error}
        />
        <Text style={estilosDeTasaDeCambio.mensajeDeError}>{mensaje}</Text>

        {onReintentar !== undefined ? (
          <View style={estilosDeTasaDeCambio.botonDeError}>
            <BscPrimaryButton
              label="Reintentar"
              height={ERROR_DE_TASA_DE_CAMBIO.altoDelBoton}
              onPress={onReintentar}
              testID="reintentar-tasas"
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function TablaDeTasas({ tasas }: { tasas: TasaDeCambio[] }): React.JSX.Element {
  return (
    <View style={estilosDeTasaDeCambio.tabla} testID="tabla-de-tasas">
      <View style={estilosDeTasaDeCambio.cabeceraTabla}>
        <Text
          style={[
            estilosDeTasaDeCambio.tituloColumna,
            estilosDeTasaDeCambio.columnaMoneda,
          ]}
        >
          MONEDA
        </Text>
        <Text
          style={[
            estilosDeTasaDeCambio.tituloColumna,
            estilosDeTasaDeCambio.columnaValor,
          ]}
        >
          COMPRA
        </Text>
        <Text
          style={[
            estilosDeTasaDeCambio.tituloColumna,
            estilosDeTasaDeCambio.columnaValor,
          ]}
        >
          VENTA
        </Text>
      </View>

      {tasas.map((tasa, indice) => (
        <View key={tasa.moneda}>
          {indice > 0 ? (
            <View style={estilosDeTasaDeCambio.lineaTabla} />
          ) : null}

          <View
            style={estilosDeTasaDeCambio.filaTasa}
            testID={`tasa-${tasa.moneda}`}
          >
            <View style={estilosDeTasaDeCambio.columnaMoneda}>
              <Text style={estilosDeTasaDeCambio.simbolo}>
                {simboloDeMoneda(tasa.moneda)}
              </Text>
              <View style={estilosDeTasaDeCambio.separacion2} />
              <Text style={estilosDeTasaDeCambio.nombreMoneda}>
                {nombreDeMoneda(tasa.moneda)}
              </Text>
            </View>

            <Text
              style={[
                estilosDeTasaDeCambio.valor,
                estilosDeTasaDeCambio.columnaValor,
                estilosDeTasaDeCambio.compra,
              ]}
            >
              {formatDOP(tasa.compra)}
            </Text>
            <Text
              style={[
                estilosDeTasaDeCambio.valor,
                estilosDeTasaDeCambio.columnaValor,
                estilosDeTasaDeCambio.venta,
              ]}
            >
              {formatDOP(tasa.venta)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Conversor rápido a pesos.
 *
 * El original arranca con «1» escrito y la tasa de **venta** seleccionada: es
 * la que le cobran al cliente cuando compra divisa, y por tanto la que más le
 * interesa mirar.
 */
function Conversor({
  tasas,
  onActivity,
}: {
  tasas: TasaDeCambio[];
  onActivity?: (() => void) | undefined;
}): React.JSX.Element {
  const [monedaElegida, setMonedaElegida] = useState<number>(
    tasas[0]?.moneda ?? 0,
  );
  const [texto, setTexto] = useState('1');
  const [usandoVenta, setUsandoVenta] = useState(true);

  const tasa = useMemo(
    () => tasas.find(t => t.moneda === monedaElegida) ?? tasas[0],
    [tasas, monedaElegida],
  );

  // Un texto que no es un número vale cero, como en el original: es lo que ve
  // el cliente mientras borra para escribir otra cantidad.
  const monto = Number.parseFloat(texto.trim());
  const montoValido = Number.isFinite(monto) ? monto : 0;

  const resultado =
    tasa === undefined ? 0 : convertirAPesos(montoValido, tasa, usandoVenta);

  return (
    <View style={estilosDeTasaDeCambio.conversor} testID="conversor">
      <Text style={estilosDeTasaDeCambio.tituloConversor}>
        Convertir a Pesos
      </Text>

      <View style={estilosDeTasaDeCambio.separacion16} />

      <View style={estilosDeTasaDeCambio.filaEntrada}>
        <View style={estilosDeTasaDeCambio.selectorDeMoneda}>
          <BscSelect<number>
            title="Moneda"
            placeholder="Moneda"
            selectedKey={String(monedaElegida)}
            options={tasas.map(t => ({
              key: String(t.moneda),
              label: simboloDeMoneda(t.moneda),
              value: t.moneda,
            }))}
            onSelect={opcion => {
              onActivity?.();
              setMonedaElegida(opcion.value);
            }}
            testID="moneda-conversor"
          />
        </View>

        <View style={estilosDeTasaDeCambio.separacionH12} />

        <TextInput
          style={estilosDeTasaDeCambio.campoMonto}
          value={texto}
          onChangeText={valor => {
            onActivity?.();
            // El original limita a dos decimales con un formateador de entrada.
            const limpio = valor.replace(/[^0-9.]/gu, '');
            const partes = limpio.split('.');
            setTexto(
              partes.length > 1
                ? `${partes[0]}.${partes.slice(1).join('').slice(0, 2)}`
                : limpio,
            );
          }}
          keyboardType="decimal-pad"
          placeholder="Monto"
          placeholderTextColor={BscColors.textTertiary}
          testID="monto-conversor"
        />
      </View>

      <View style={estilosDeTasaDeCambio.separacion16} />

      <View style={estilosDeTasaDeCambio.filaInterruptores}>
        <Interruptor
          etiqueta="Compra"
          activo={!usandoVenta}
          onPress={() => setUsandoVenta(false)}
        />
        <View style={estilosDeTasaDeCambio.separacionH8} />
        <Interruptor
          etiqueta="Venta"
          activo={usandoVenta}
          onPress={() => setUsandoVenta(true)}
        />
      </View>

      <View style={estilosDeTasaDeCambio.separacion16} />

      <View style={estilosDeTasaDeCambio.resultado}>
        <Text style={estilosDeTasaDeCambio.explicacionResultado}>
          {`${simboloDeMoneda(monedaElegida)} ${formatAmount(
            montoValido,
          )} a tasa de ${usandoVenta ? 'Venta' : 'Compra'}`}
        </Text>
        <View style={estilosDeTasaDeCambio.separacion4} />
        <Text
          style={estilosDeTasaDeCambio.montoResultado}
          testID="resultado-conversion"
        >
          {formatDOP(resultado)}
        </Text>
      </View>
    </View>
  );
}

function Interruptor({
  etiqueta,
  activo,
  onPress,
}: {
  etiqueta: string;
  activo: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={[
        estilosDeTasaDeCambio.interruptor,
        activo ? estilosDeTasaDeCambio.interruptorActivo : null,
      ]}
      testID={`tasa-${etiqueta.toLowerCase()}`}
    >
      <Text
        style={[
          estilosDeTasaDeCambio.textoInterruptor,
          activo ? estilosDeTasaDeCambio.textoInterruptorActivo : null,
        ]}
      >
        {etiqueta}
      </Text>
    </Pressable>
  );
}

export const estilosDeTasaDeCambio = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: BscSpacing.gutter,
  },
  // El original usa 16 literal, no `BscSpacing.gutter`.
  contenido: {
    padding: 16,
  },

  // ─── Tabla ───────────────────────────────────────────────────────────────
  tabla: {
    backgroundColor: BscColors.surface,
    borderRadius: BscRadius.md,
    overflow: 'hidden',
    ...BscShadows.card,
  },
  cabeceraTabla: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: BscColors.primary,
  },
  tituloColumna: {
    color: BscColors.textOnPrimary,
    ...BscTextStyles['Caption/12 Bold'],
  },
  // Las proporciones 3-2-2 del original.
  columnaMoneda: {
    flex: 3,
  },
  columnaValor: {
    flex: 2,
    textAlign: 'right',
  },
  filaTasa: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  lineaTabla: {
    height: 1,
    backgroundColor: BscColors.divider,
  },
  simbolo: {
    ...BscTextStyles['Body MD/16 Bold'],
    color: BscColors.textPrimary,
  },
  nombreMoneda: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  valor: {
    ...BscTextStyles['Body S/14 SemiBold'],
  },
  compra: {
    color: BscColors.success,
  },
  venta: {
    color: BscColors.secondary,
  },

  // ─── Conversor ───────────────────────────────────────────────────────────
  conversor: {
    padding: 16,
    backgroundColor: BscColors.surface,
    borderRadius: BscRadius.md,
    ...BscShadows.card,
  },
  tituloConversor: {
    ...BscTextStyles['Body MD/16 Bold'],
    color: BscColors.textPrimary,
  },
  filaEntrada: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorDeMoneda: {
    minWidth: 96,
  },
  campoMonto: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
    backgroundColor: BscColors.surfaceVariant,
    borderRadius: BscRadius.sm,
  },
  filaInterruptores: {
    flexDirection: 'row',
  },
  interruptor: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BscRadius.sm,
    backgroundColor: BscColors.surfaceVariant,
  },
  interruptorActivo: {
    backgroundColor: BscColors.primary,
  },
  textoInterruptor: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textSecondary,
  },
  textoInterruptorActivo: {
    color: BscColors.textOnPrimary,
  },
  resultado: {
    width: '100%',
    padding: 16,
    borderRadius: BscRadius.sm,
    // El 8 % de opacidad del original.
    backgroundColor: withAlpha(BscColors.primary, 0.08),
  },
  explicacionResultado: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  montoResultado: {
    ...BscTextStyles['Title XS/24 Bold'],
    color: BscColors.primary,
  },
  nota: {
    ...BscTextStyles['Caption/12 Regular'],
    fontStyle: 'italic',
    textAlign: 'center',
    color: BscColors.textSecondary,
  },

  // ─── Vista de error, propia de esta pantalla ─────────────────────────────
  zonaDeError: {
    alignItems: 'center',
    padding: ERROR_DE_TASA_DE_CAMBIO.relleno,
  },
  mensajeDeError: {
    marginTop: ERROR_DE_TASA_DE_CAMBIO.separacion,
    textAlign: 'center',
    color: BscColors.textSecondary,
  },
  botonDeError: {
    marginTop: ERROR_DE_TASA_DE_CAMBIO.separacion,
    width: ERROR_DE_TASA_DE_CAMBIO.anchoDelBoton,
  },

  separacion2: { height: 2 },
  separacion4: { height: 4 },
  separacion16: { height: 16 },
  separacion24: { height: 24 },
  separacionH8: { width: 8 },
  separacionH12: { width: 12 },
});
