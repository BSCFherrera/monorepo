import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Clipboard,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CURRENCY,
  formatCurrency,
  maskAccountNumber,
  maskCardNumber,
  parseCoreDate,
} from '@bsc/shared';

import {
  BscColors,
  BscGradients,
  BscPlaceholder,
  BscSpacing,
  BscTextButton,
  BscToast,
} from '@bsc/ui-native';
import { matchingPreset, lastDaysRange } from '@bsc/utils';
import { type DateRange } from '@bsc/contracts';
import {
  ProductCategory,
  nombreDeCategoria,
} from '../../dashboard/data/productContracts';
import {
  nombreDeLaCuenta,
  type DetalleDeCuenta,
} from '../data/accountDetailContracts';
import type { DetalleDeCertificado } from '../data/certificateDetailContracts';
import {
  saldoDeLaCabecera,
  type DetalleDePrestamo,
} from '../data/loanDetailContracts';
import type { ProductDetailRepository } from '../data/productDetailRepository';
import type { Movimiento } from '../data/transactionContracts';

import {
  InformacionDeCuenta,
  ResumenDeBalance,
  SobregiroYTransito,
} from './AccountDetailSections';
import {
  InformacionDelCertificado,
  Rendimiento,
  ResumenDeInversion,
} from './CertificateDetailSections';
import {
  DetallesDelPrestamo,
  ProgresoDelPrestamo,
  ProximoPago,
} from './LoanDetailSections';
import { accionesDeCabecera, type ClaveDeAccion } from './accionesDeCabecera';
import { ProductBrandAction } from './ProductDetailChrome';
import {
  ETIQUETA_DE_REINTENTO,
  tituloDelErrorDelDetalle,
} from './errorDelDetalle';
import { ProductDetailHeader } from './ProductDetailHeader';
import { StatementPdfSheet } from './StatementPdfSheet';
import {
  TransactionListSection,
  type PeriodoDeMovimientos,
} from './TransactionListSection';

/**
 * Detalle de un producto y su lista de movimientos.
 *
 * Portada de `product_detail_screen.dart` y sus vistas, que en Flutter son la
 * feature más grande de la app: cuatro pantallas —cuenta, tarjeta, préstamo y
 * certificado— con más de 2.600 líneas entre ellas.
 *
 * Esta pantalla reúne lo que las cuatro comparten —la cabecera con el saldo y
 * la lista de movimientos por período— y monta encima los bloques propios de
 * cada producto, que viven en sus propios archivos: cuenta, préstamo y
 * certificado. **Falta la tarjeta de crédito**, cuya vista es la más grande del
 * original (995 líneas, con estados de cuenta y descarga de PDF).
 *
 * El detalle es complementario a los movimientos, no un requisito: si la
 * consulta de detalle falla, la pantalla sigue enseñando cabecera y
 * movimientos. El cliente vino a ver sus movimientos, y quedarse sin ellos
 * porque no cargó el límite de sobregiro sería peor que no enseñar ese límite.
 */

export interface ProductDetailScreenProps {
  repositorio: ProductDetailRepository;
  numeroDeProducto: string;
  tipoDeProducto: string;
  codigoMoneda: number;
  saldoInicial?: number | undefined;
  numeroEnmascarado?: string | undefined;
  onBack: () => void;
  onActivity: () => void;
  /** Lleva al flujo de transferencias, que todavía no está migrado. */
  onTransferir?: () => void;
  /** Lleva al flujo de pagos, que todavía no está migrado. */
  onPagar?: () => void;
  /** Lleva a «Mi Oficial de Cuenta». */
  onOficialDeCuenta?: () => void;
}

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; movimientos: Movimiento[] };

/**
 * El detalle propio del producto, que es distinto para cada tipo.
 *
 * Se guarda como una unión y no como un objeto con todos los campos posibles
 * porque las cuatro respuestas del core no se parecen: un préstamo tiene cuotas
 * y un certificado tiene vencimiento, y juntarlos daría un modelo con cuarenta
 * campos opcionales donde nadie sabría cuáles están puestos.
 */
type DetalleDelProducto =
  | { tipo: 'cuenta'; cuenta: DetalleDeCuenta }
  | { tipo: 'prestamo'; prestamo: DetalleDePrestamo }
  | { tipo: 'certificado'; certificado: DetalleDeCertificado }
  | null;

/**
 * Pide el detalle que corresponde al tipo de producto.
 *
 * La tarjeta de crédito todavía no está: su vista es la más grande del original
 * —995 líneas, con estados de cuenta y descarga de PDF— y llega en el bloque
 * siguiente. Mientras tanto devuelve nada, y la pantalla enseña la cabecera y
 * los movimientos, que es lo que ya hacía.
 */
async function cargarDetalle(
  repositorio: ProductDetailRepository,
  opciones: {
    numeroDeProducto: string;
    tipoDeProducto: string;
    codigoMoneda: number;
  },
): Promise<DetalleDelProducto> {
  const { numeroDeProducto, tipoDeProducto, codigoMoneda } = opciones;

  if (
    tipoDeProducto === ProductCategory.Savings ||
    tipoDeProducto === ProductCategory.Checking
  ) {
    return {
      tipo: 'cuenta',
      cuenta: await repositorio.obtenerDetalleDeCuenta({
        numeroDeCuenta: numeroDeProducto,
        codigoMoneda,
        tipoDeCuenta: tipoDeProducto,
      }),
    };
  }

  if (tipoDeProducto === ProductCategory.Loan) {
    return {
      tipo: 'prestamo',
      prestamo: await repositorio.obtenerDetalleDePrestamo({
        numeroDePrestamo: numeroDeProducto,
        codigoMoneda,
      }),
    };
  }

  if (tipoDeProducto === ProductCategory.Certificate) {
    return {
      tipo: 'certificado',
      certificado: await repositorio.obtenerDetalleDeCertificado({
        numeroDeCertificado: numeroDeProducto,
        codigoMoneda,
      }),
    };
  }

  return null;
}

/**
 * Título, cifra grande y etiqueta de la cabecera, según el producto.
 *
 * Cada tipo tiene su criterio en el original, y uno de ellos no es evidente: en
 * los préstamos activos el core devuelve el balance en cero y hay que enseñar
 * el saldo de cancelación, porque abrir con «RD$ 0.00» encima se leería como
 * que el cliente no debe nada.
 */
function cabeceraDelProducto({
  detalle,
  tipoDeProducto,
  saldoInicial,
  esTarjeta,
}: {
  detalle: DetalleDelProducto;
  tipoDeProducto: string;
  saldoInicial: number | undefined;
  esTarjeta: boolean;
}): { titulo: string; monto: number | undefined; etiqueta: string } {
  if (detalle?.tipo === 'cuenta') {
    return {
      titulo: nombreDeLaCuenta(detalle.cuenta),
      monto: detalle.cuenta.saldoDisponible,
      etiqueta: 'Saldo disponible',
    };
  }

  if (detalle?.tipo === 'prestamo') {
    const { monto, etiqueta } = saldoDeLaCabecera(detalle.prestamo);
    // El título es el tipo de préstamo tal como lo redacta el core.
    return { titulo: detalle.prestamo.tipoDePrestamo, monto, etiqueta };
  }

  if (detalle?.tipo === 'certificado') {
    return {
      titulo: 'Certificado de Depósito',
      monto: detalle.certificado.saldoActual,
      etiqueta: 'Balance actual',
    };
  }

  // Mientras el detalle no llega —o para la tarjeta, que todavía no lo tiene—
  // se muestra el saldo con el que venía el dashboard: así el cliente ve su
  // dinero de inmediato en vez de un hueco que se rellena un segundo después.
  return {
    titulo: nombreDeCategoria(tipoDeProducto),
    monto: saldoInicial,
    etiqueta: esTarjeta ? 'Disponible' : 'Saldo disponible',
  };
}

export function ProductDetailScreen({
  repositorio,
  numeroDeProducto,
  tipoDeProducto,
  codigoMoneda,
  saldoInicial,
  numeroEnmascarado,
  onBack,
  onActivity,
  onTransferir,
  onPagar,
  onOficialDeCuenta,
}: ProductDetailScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const [refrescando, setRefrescando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [hojaDeEstados, setHojaDeEstados] = useState(false);

  // El período y el rango van por separado a propósito. El rango es lo que se
  // consulta; el período es solo cuál de las cuatro píldoras queda encendida, y
  // con un rango elegido a mano ninguna de las tres fijas lo está.
  const [periodo, setPeriodo] = useState<PeriodoDeMovimientos>(30);
  const [rango, setRango] = useState<DateRange>(() => lastDaysRange(30));

  const esTarjeta = tipoDeProducto === ProductCategory.CreditCard;
  // El detalle se carga una sola vez, aparte de los movimientos: cambiar el
  // período no cambia el titular ni el límite de sobregiro, y volver a pedirlo
  // en cada toque de píldora haría parpadear media pantalla sin motivo.
  const [detalle, setDetalle] = useState<DetalleDelProducto>(null);
  /*
    Nulo no basta: es el mismo valor mientras el detalle viaja y cuando la
    petición falló, y el porte trataba los dos casos igual. El original emite
    `ProductDetailError` y sustituye la vista entera, así que hay que saber
    cuál de los dos es.
  */
  const [detalleFallido, setDetalleFallido] = useState(false);

  /**
   * Trae el detalle.
   *
   * Sale del efecto para que el botón «Reintentar» del aviso de error pueda
   * volver a llamarlo, que es lo que hace el original: su `BscEmptyState`
   * despacha `RefreshDetail`.
   */
  const traerDetalle = useCallback(
    async (sigueVigente: () => boolean = () => true): Promise<void> => {
      try {
        const cargado = await cargarDetalle(repositorio, {
          numeroDeProducto,
          tipoDeProducto,
          codigoMoneda,
        });
        if (!sigueVigente()) return;
        setDetalle(cargado);
        setDetalleFallido(false);
      } catch {
        /*
        El original **sustituye la vista entera** por «No pudimos cargar la
        cuenta» con un botón «Reintentar»: lo emite `ProductDetailError` en
        `product_detail_bloc.dart`. Antes aquí se dejaba el detalle en nulo y
        se seguía dibujando, así que al cliente le faltaban el límite de
        sobregiro, la tasa o el titular **sin que nada se lo dijera**.
      */
        if (!sigueVigente()) return;
        setDetalle(null);
        setDetalleFallido(true);
      }
    },
    [repositorio, numeroDeProducto, tipoDeProducto, codigoMoneda],
  );

  useEffect(() => {
    let vigente = true;
    void traerDetalle(() => vigente);

    return () => {
      vigente = false;
    };
  }, [traerDetalle]);

  const numeroVisible = useMemo(() => {
    if (esTarjeta) return maskCardNumber(numeroEnmascarado ?? numeroDeProducto);
    // El certificado se enseña completo, que es lo que hace el original: su
    // número no es un dato que identifique a nadie ni sirva para cobrar, y el
    // cliente lo necesita entero para reclamar en sucursal.
    if (tipoDeProducto === ProductCategory.Certificate) return numeroDeProducto;
    return maskAccountNumber(numeroDeProducto);
  }, [esTarjeta, numeroEnmascarado, numeroDeProducto, tipoDeProducto]);

  const cargar = useCallback(
    async (rangoAConsultar: DateRange): Promise<void> => {
      setEstado({ tipo: 'cargando' });
      try {
        const movimientos = await repositorio.obtenerMovimientos({
          numeroDeProducto,
          tipoDeProducto,
          codigoMoneda,
          rango: rangoAConsultar,
        });
        setEstado({ tipo: 'listo', movimientos });
      } catch {
        setEstado({
          tipo: 'error',
          mensaje: 'No pudimos cargar los movimientos. Intenta de nuevo.',
        });
      }
    },
    [repositorio, numeroDeProducto, tipoDeProducto, codigoMoneda],
  );

  useEffect(() => {
    void cargar(rango);
  }, [cargar, rango]);

  const refrescar = useCallback(async (): Promise<void> => {
    setRefrescando(true);
    onActivity();
    await cargar(rango);
    setRefrescando(false);
  }, [cargar, rango, onActivity]);

  // En dólares el degradado vira al verde azulado. Con el número enmascarado es
  // lo único que distingue de un vistazo una cuenta en dólares de una en pesos.
  const gradiente =
    codigoMoneda === CURRENCY.DOP
      ? BscGradients.accountCard
      : BscGradients.creditCard;

  // Qué va en la cabecera. El detalle manda en cuanto llega: el saldo del
  // dashboard puede venir de una consulta anterior, y en una app de banco el
  // número grande tiene que ser el más fresco que se tenga.
  const cabecera = cabeceraDelProducto({
    detalle,
    tipoDeProducto,
    saldoInicial,
    esTarjeta,
  });

  /**
   * Las acciones sobre el degradado. Faltaban enteras y se detectaron
   * comparando el Pixel contra la app Flutter.
   *
   * Las que llevan a un flujo sin migrar avisan de que llega —que es lo que
   * hace el original con su `SnackBar`— en vez de no responder al toque.
   */
  const acciones = accionesDeCabecera({
    tipoDeProducto,
    cuentaDeAbono:
      detalle?.tipo === 'certificado'
        ? detalle.certificado.cuentaDeAbono
        : undefined,
  });

  const copiar = (valor: string, mensaje: string): void => {
    Clipboard.setString(valor);
    setAviso(mensaje);
  };

  const ejecutarAccion = (clave: ClaveDeAccion): void => {
    onActivity();

    switch (clave) {
      case 'transferir':
        if (onTransferir === undefined)
          setAviso(PROXIMAMENTE('Transferencias'));
        else onTransferir();
        return;
      case 'pagar':
      case 'pagarCuota':
        if (onPagar === undefined) setAviso(PROXIMAMENTE('Pagos'));
        else onPagar();
        return;
      case 'estados':
        // Solo la cuenta tiene estados de cuenta en PDF; el original anuncia
        // que los del préstamo llegarán, y no los pide a ningún endpoint.
        if (
          tipoDeProducto === ProductCategory.Savings ||
          tipoDeProducto === ProductCategory.Checking
        ) {
          setHojaDeEstados(true);
        } else {
          setAviso(PROXIMAMENTE('Estados de préstamo'));
        }
        return;
      case 'compartir':
        copiar(
          numeroDeProducto,
          tipoDeProducto === ProductCategory.Certificate
            ? 'Número de certificado copiado'
            : 'Número de cuenta copiado',
        );
        return;
      case 'cuentaDeAbono':
        if (
          detalle?.tipo === 'certificado' &&
          detalle.certificado.cuentaDeAbono !== undefined
        ) {
          copiar(detalle.certificado.cuentaDeAbono, 'Cuenta de abono copiada');
        }
        return;
      case 'simulador':
        setAviso(PROXIMAMENTE('Simulador de préstamos'));
        return;
      case 'miOficial':
        if (onOficialDeCuenta === undefined)
          setAviso(PROXIMAMENTE('Mi oficial de cuenta'));
        else onOficialDeCuenta();
    }
  };

  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={[
          styles.contenido,
          { paddingBottom: BscSpacing.xxl + insets.bottom },
        ]}
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
        testID="detalle-contenido"
      >
        <ProductDetailHeader
          title={cabecera.titulo}
          subtitle={numeroVisible}
          balance={
            cabecera.monto === undefined
              ? undefined
              : formatCurrency(cabecera.monto, codigoMoneda)
          }
          balanceLabel={cabecera.etiqueta}
          gradient={gradiente}
          onBack={onBack}
        >
          {acciones.length === 0 ? undefined : (
            <View style={styles.acciones}>
              {acciones.map(accion => (
                <ProductBrandAction
                  key={accion.clave}
                  icon={accion.icono}
                  label={accion.etiqueta}
                  onPress={() => ejecutarAccion(accion.clave)}
                  testID={`accion-${accion.clave}`}
                />
              ))}
            </View>
          )}
        </ProductDetailHeader>

        {/*
          El detalle que no cargó **se dice**. El original sustituye la vista
          entera por este aviso —`ProductDetailError` en el bloc—, y el botón
          vuelve a pedirlo. Se dibuja bajo la cabecera, que sí tiene datos: el
          cliente llegó con el saldo del dashboard en la mano y quitárselo no
          añade nada.
        */}
        {detalleFallido ? (
          <View style={styles.seccion}>
            <BscPlaceholder
              tone="error"
              title={tituloDelErrorDelDetalle(tipoDeProducto)}
              message="Vuelve a intentarlo en un momento."
              testID="detalle-no-cargado"
              action={
                <BscTextButton
                  label={ETIQUETA_DE_REINTENTO}
                  onPress={() => {
                    onActivity();
                    void traerDetalle();
                  }}
                />
              }
            />
          </View>
        ) : null}

        {detalle?.tipo === 'cuenta' ? (
          <>
            <ResumenDeBalance cuenta={detalle.cuenta} />
            <InformacionDeCuenta cuenta={detalle.cuenta} />
            {/*
              Devuelve nada cuando la cuenta no tiene sobregiro ni línea de
              tránsito, que es el caso de casi todas las de ahorros.
            */}
            <SobregiroYTransito cuenta={detalle.cuenta} />
          </>
        ) : null}

        {detalle?.tipo === 'prestamo' ? (
          <>
            <ProgresoDelPrestamo prestamo={detalle.prestamo} />
            <ProximoPago prestamo={detalle.prestamo} />
            <DetallesDelPrestamo prestamo={detalle.prestamo} />
          </>
        ) : null}

        {detalle?.tipo === 'certificado' ? (
          <>
            <ResumenDeInversion certificado={detalle.certificado} />
            <Rendimiento certificado={detalle.certificado} />
            <InformacionDelCertificado certificado={detalle.certificado} />
          </>
        ) : null}

        <View style={styles.seccion}>
          {estado.tipo === 'error' ? (
            <BscPlaceholder
              tone="error"
              title="No pudimos cargar los movimientos"
              message={estado.mensaje}
              testID="detalle-error"
              action={
                <BscTextButton
                  label="Reintentar"
                  onPress={() => {
                    void cargar(rango);
                  }}
                />
              }
            />
          ) : (
            <TransactionListSection
              movimientos={estado.tipo === 'listo' ? estado.movimientos : []}
              cargando={estado.tipo === 'cargando'}
              codigoMoneda={codigoMoneda}
              periodo={periodo}
              rango={rango}
              onPeriodo={dias => {
                onActivity();
                setPeriodo(dias);
                setRango(lastDaysRange(dias));
              }}
              onRangoPersonalizado={elegido => {
                onActivity();
                // Si el rango elegido a mano coincide con una de las tres
                // píldoras fijas, se enciende esa en vez de «Personalizado»:
                // es el mismo período y dos píldoras distintas para el mismo
                // resultado confunden.
                const coincide = matchingPreset(elegido);
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
          )}
        </View>
      </ScrollView>

      {/* Los estados de cuenta en PDF, que en el original abre «Estados». */}
      {hojaDeEstados ? (
        <StatementPdfSheet
          visible
          repositorio={repositorio}
          tipo="cuenta"
          numeroDeProducto={numeroDeProducto}
          codigoMoneda={codigoMoneda}
          apertura={
            detalle?.tipo === 'cuenta'
              ? parseCoreDate(detalle.cuenta.fechaDeApertura ?? '') ?? undefined
              : undefined
          }
          onClose={() => setHojaDeEstados(false)}
        />
      ) : null}

      <BscToast
        message={aviso}
        onHide={() => setAviso(null)}
        testID="aviso-del-detalle"
      />
    </View>
  );
}

/** Lo que el original escribe cuando una acción todavía no existe. */
const PROXIMAMENTE = (capacidad: string): string =>
  `${capacidad} estará disponible próximamente`;

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  contenido: {
    flexGrow: 1,
  },
  seccion: {
    paddingTop: BscSpacing.lg,
  },
  acciones: {
    flexDirection: 'row',
  },
});
