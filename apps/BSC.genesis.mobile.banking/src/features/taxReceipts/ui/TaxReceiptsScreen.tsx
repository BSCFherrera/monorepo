import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatAmount, formatDate, formatDateShort } from '@bsc/shared';

import {
  BscCard,
  BscColors,
  BscDateRangeSheet,
  BscEmptyState,
  BscIcon,
  BscIconTile,
  BscListRow,
  BscPageHeader,
  BscPrimaryButton,
  BscRadius,
  BscRowDivider,
  BscSectionHeader,
  BscSelect,
  BscSpacing,
  BscSpinner,
  buttonTokens,
  BscTextStyles,
} from '@bsc/design-system';
import { type DateRange } from '@bsc/contracts';
import { ENCABEZADO_DE_SECCION } from '../../../app/medidasDeLasOchoPantallas';
import type { Producto } from '../../dashboard/data/productContracts';
import {
  simboloDelComprobante,
  totalDeComprobantes,
  type Comprobante,
} from '../data/taxReceiptContracts';
import type { TaxReceiptRepository } from '../data/taxReceiptRepository';

import { TaxReceiptDetailSheet } from './TaxReceiptDetailSheet';

/**
 * Comprobantes fiscales (NCF) emitidos sobre las cuentas del cliente.
 *
 * Portada de `tax_receipts_screen.dart`, que a su vez replica Consultas ›
 * Comprobantes Fiscales del portal.
 *
 * **El período por defecto es un año, y no es un descuido.** Los NCF se emiten
 * solo cuando el banco cobra una comisión, así que un trimestre vuelve vacío
 * con frecuencia en cuentas que sí tienen comprobantes, y el cliente se queda
 * adivinando qué rango probar. El comentario del original lo dice con esas
 * palabras y conviene conservar la decisión.
 */

export interface TaxReceiptsScreenProps {
  repositorio: TaxReceiptRepository;
  /**
   * Cuentas del cliente.
   *
   * La pantalla las pide ella misma y elige la primera, igual que el original
   * lee el bloc del dashboard: así abre con resultados en vez de pedirle al
   * cliente que rellene algo que ya se sabe.
   */
  cargarCuentas: () => Promise<Producto[]>;
  customerCode: string;
  onBack: () => void;
  onActivity?: (() => void) | undefined;
  /** Hoy, inyectable para que las capturas sean comparables entre sesiones. */
  ahora?: (() => Date) | undefined;
}

export function TaxReceiptsScreen({
  repositorio,
  cargarCuentas,
  customerCode,
  onBack,
  onActivity,
  ahora = () => new Date(),
}: TaxReceiptsScreenProps): React.JSX.Element {
  const hoy = useMemo(() => ahora(), [ahora]);

  const [cuentas, setCuentas] = useState<Producto[]>([]);
  const [cuenta, setCuenta] = useState<Producto | null>(null);
  const [rango, setRango] = useState<DateRange>(() => ({
    from: new Date(hoy.getFullYear() - 1, hoy.getMonth(), 1),
    to: hoy,
  }));

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [consultado, setConsultado] = useState(false);
  const [eligiendoPeriodo, setEligiendoPeriodo] = useState(false);
  const [abierto, setAbierto] = useState<Comprobante | null>(null);

  const consultar = useCallback(
    async (
      cuentaElegida: Producto | null,
      periodo: DateRange,
    ): Promise<void> => {
      if (cuentaElegida === null || customerCode === '') return;

      setCargando(true);
      setError(null);
      setConsultado(true);

      try {
        setComprobantes(
          await repositorio.buscar({
            codigoDeCliente: customerCode,
            numeroDeCuenta: cuentaElegida.identificacion,
            codigoDeMoneda: String(cuentaElegida.codigoMoneda),
            desde: periodo.from,
            hasta: periodo.to,
          }),
        );
      } catch {
        setError('No pudimos consultar los comprobantes.');
      }

      setCargando(false);
    },
    [repositorio, customerCode],
  );

  /*
    Se elige la primera cuenta y se consulta sola: la pantalla abre con
    resultados en vez de pedirle al cliente que rellene algo que ya sabemos.
    Es lo que hace `_prime()` del original.
  */
  useEffect(() => {
    let vigente = true;

    void cargarCuentas()
      .then(lista => {
        if (!vigente) return;
        setCuentas(lista);

        const primera = lista[0] ?? null;
        setCuenta(primera);
        if (primera !== null) void consultar(primera, rango);
      })
      .catch(() => {
        // Sin cuentas la pantalla enseña «Cargando tus cuentas…» y el botón
        // queda deshabilitado, que es lo que hace el original.
      });

    return () => {
      vigente = false;
    };
    // Solo al montar: después, cada cambio de filtro dispara su propia
    // consulta. Depender de `rango` aquí consultaría dos veces al elegir uno.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={estilosDeComprobantesFiscales.pantalla}>
      <ScrollView
        contentContainerStyle={estilosDeComprobantesFiscales.contenido}
        onScrollBeginDrag={onActivity}
      >
        <BscPageHeader
          title="Comprobantes fiscales"
          subtitle="NCF emitidos sobre tus cuentas"
          onBack={onBack}
          testID="cabecera-comprobantes"
        />

        <View style={estilosDeComprobantesFiscales.filtros}>
          <BscCard>
            {cuentas.length === 0 ? (
              <Text style={estilosDeComprobantesFiscales.cargandoCuentas}>
                Cargando tus cuentas…
              </Text>
            ) : (
              <BscSelect<Producto>
                title="Cuenta"
                placeholder="Cuenta"
                selectedKey={cuenta?.identificacion ?? null}
                options={cuentas.map(una => ({
                  key: una.identificacion,
                  label: etiquetaDeCuenta(una),
                  value: una,
                }))}
                onSelect={opcion => {
                  onActivity?.();
                  setCuenta(opcion.value);
                  void consultar(opcion.value, rango);
                }}
                testID="cuenta-comprobantes"
              />
            )}

            <View style={estilosDeComprobantesFiscales.separacionPequena} />

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onActivity?.();
                setEligiendoPeriodo(true);
              }}
              style={estilosDeComprobantesFiscales.selectorDePeriodo}
              testID="periodo-comprobantes"
            >
              <BscIcon name="calendar" size={18} color={BscColors.primary} />
              <View style={estilosDeComprobantesFiscales.separacionH4} />
              <Text style={estilosDeComprobantesFiscales.textoPeriodo}>
                {`${formatDateShort(rango.from)} - ${formatDateShort(
                  rango.to,
                )}`}
              </Text>
              <BscIcon
                name="chevron-down"
                size={20}
                color={BscColors.textTertiary}
              />
            </Pressable>

            <View style={estilosDeComprobantesFiscales.separacionPequena} />

            <BscPrimaryButton
              label="Consultar"
              // 48, no el alto de siempre: el original lo baja aquí.
              height={buttonTokens.heightQuery}
              loading={cargando}
              disabled={cuenta === null}
              onPress={() => {
                onActivity?.();
                void consultar(cuenta, rango);
              }}
              testID="consultar-comprobantes"
            />
          </BscCard>
        </View>

        {cargando ? (
          <View style={estilosDeComprobantesFiscales.cargando}>
            <BscSpinner tamano="screenList" />
          </View>
        ) : error !== null ? (
          <BscEmptyState
            icon="cloud-off"
            title="No pudimos consultar"
            message={error}
            actionLabel="Reintentar"
            onAction={() => void consultar(cuenta, rango)}
            testID="error-comprobantes"
          />
        ) : consultado && comprobantes.length === 0 ? (
          <BscEmptyState
            icon="receipt"
            title="Sin comprobantes"
            message={
              `No hay NCF emitidos entre el ${formatDateShort(
                rango.from,
              )} y ` + `el ${formatDateShort(rango.to)}.`
            }
            actionLabel="Cambiar período"
            onAction={() => setEligiendoPeriodo(true)}
            testID="sin-comprobantes"
          />
        ) : comprobantes.length > 0 ? (
          <Resultados
            comprobantes={comprobantes}
            onAbrir={uno => {
              onActivity?.();
              setAbierto(uno);
            }}
          />
        ) : null}

        <View style={estilosDeComprobantesFiscales.separacionEnorme} />
      </ScrollView>

      <BscDateRangeSheet
        visible={eligiendoPeriodo}
        initialRange={rango}
        today={hoy}
        title="Período de comprobantes"
        onClose={() => setEligiendoPeriodo(false)}
        onApply={elegido => {
          setEligiendoPeriodo(false);
          setRango(elegido);
          void consultar(cuenta, elegido);
        }}
      />

      <TaxReceiptDetailSheet
        visible={abierto !== null}
        comprobante={abierto}
        customerCode={customerCode}
        repositorio={repositorio}
        onCerrar={() => setAbierto(null)}
      />
    </View>
  );
}

/** «Cuenta de Ahorros ****3953», como el original compone el desplegable. */
function etiquetaDeCuenta(cuenta: Producto): string {
  const nombre =
    cuenta.categoria === 'CC' ? 'Cuenta Corriente' : 'Cuenta de Ahorros';
  const numero = cuenta.identificacion;
  const enmascarado = numero.length > 4 ? `****${numero.slice(-4)}` : numero;
  return `${nombre} ${enmascarado}`;
}

function Resultados({
  comprobantes,
  onAbrir,
}: {
  comprobantes: Comprobante[];
  onAbrir: (comprobante: Comprobante) => void;
}): React.JSX.Element {
  const simbolo = simboloDelComprobante(comprobantes[0]?.moneda ?? '214');
  const total = totalDeComprobantes(comprobantes);

  return (
    <View>
      {/*
        El relleno es el que `BscSectionHeader` trae de serie en el original
        —`fromLTRB(gutter, lg, gutter, sm)`—. Sin él el título sale pegado al
        borde de la pantalla, con la tarjeta de debajo a 16.
      */}
      <BscSectionHeader
        title="Comprobantes"
        trailingText={`${comprobantes.length} · ${simbolo} ${formatAmount(
          total,
        )}`}
        style={estilosDeComprobantesFiscales.encabezado}
      />

      <View style={estilosDeComprobantesFiscales.lista}>
        <BscCard style={estilosDeComprobantesFiscales.tarjetaSinRelleno}>
          {comprobantes.map((uno, indice) => (
            <View key={`${uno.ncf}-${indice}`}>
              {indice > 0 ? <BscRowDivider /> : null}
              <BscListRow
                leading={<BscIconTile icon="receipt" />}
                title={uno.ncf}
                subtitle={formatDate(uno.fecha)}
                trailingLabel={`${simboloDelComprobante(
                  uno.moneda,
                )} ${formatAmount(uno.monto)}`}
                showChevron
                onPress={() => onAbrir(uno)}
                testID={`comprobante-${uno.ncf}`}
              />
            </View>
          ))}
        </BscCard>
      </View>
    </View>
  );
}

export const estilosDeComprobantesFiscales = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  contenido: {
    flexGrow: 1,
  },
  filtros: {
    paddingHorizontal: BscSpacing.gutter,
    paddingTop: BscSpacing.md,
  },
  cargandoCuentas: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
  },
  // 16 de lado y 14 arriba y abajo, literal del original.
  selectorDePeriodo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: BscSpacing.md,
    paddingVertical: 14,
    borderRadius: BscRadius.sm,
    borderWidth: 1,
    borderColor: BscColors.border,
    backgroundColor: BscColors.surfaceVariant,
  },
  textoPeriodo: {
    flex: 1,
    ...BscTextStyles['Body S/14 Medium'],
    color: BscColors.textPrimary,
  },
  cargando: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  encabezado: {
    paddingHorizontal: ENCABEZADO_DE_SECCION.lateral,
    marginTop: ENCABEZADO_DE_SECCION.arriba,
  },
  lista: {
    paddingHorizontal: BscSpacing.gutter,
  },
  tarjetaSinRelleno: {
    padding: 0,
  },
  separacionPequena: { height: BscSpacing.sm },
  separacionH4: { width: BscSpacing.xs },
  separacionEnorme: { height: BscSpacing.xxl },
});
