import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  BscColors,
  BscEmptyState,
  BscPageHeader,
  BscSpacing,
  BscSpinner,
  BscTextStyles,
} from '@bsc/design-system';
import { clasificarRiesgo } from '../../../core/security/operationRisk';
import {
  autorizarOperacion,
  type PasosDeAutorizacion,
} from '../../deviceBinding/domain/authorizeOperation';
import type { DeviceBindingService } from '../../deviceBinding/domain/deviceBindingService';
import type { Producto } from '../../dashboard/data/productContracts';
import type { DetalleDeTarjeta } from '../../productDetail/data/creditCardDetailContracts';
import { PropositoDeSegundoFactor } from '../../twoFactor/data/twoFactorContracts';
import type { TwoFactorRepository } from '../../twoFactor/data/twoFactorRepository';
import { TwoFactorSheet } from '../../twoFactor/ui/TwoFactorSheet';
import {
  CapaDeProceso,
  TransferWizardChrome,
} from '../../transfers/ui/TransferWizardChrome';
import {
  tituloDeConfirmacion,
  TipoDeMonto,
  TipoDePago,
  type ResultadoDePago,
} from '../data/paymentContracts';
import type { PaymentRepository } from '../data/paymentRepository';

import { PaymentsHome } from './PaymentsHome';
import {
  codigoDeMonedaDeLaCuenta,
  codigoDeMonedaDelPago,
  esPrestamo,
  esTarjetaMultimoneda,
  montoADebitar,
  montoDelPago,
  necesitaConversion,
  numeroVisible,
  ordenDePrestamo,
  ordenDeTarjeta,
  pagoVacio,
  primeraOpcionValida,
  saldoDeLaCuenta,
  tipoDeCuentaOrigen,
  totalDebitado,
  type DatosDelPago,
} from '../domain/paymentFlow';

import { PaymentReceipt } from './PaymentReceipt';
import { PaymentStepConfirmation } from './PaymentStepConfirmation';
import { PaymentStepForm } from './PaymentStepForm';

/**
 * Pagos: el selector de tipo y el asistente de tres pasos.
 *
 * Portada de `payments_screen.dart` y `payment_home_body.dart`. **Reutiliza el
 * asistente de la oleada 5** —la cabecera con los tres pasos, la capa de
 * proceso y la barra inferior—, que es exactamente lo que el plan anticipaba:
 * lo que esta oleada aporta es el formulario propio de un pago, no una
 * arquitectura nueva.
 *
 * ⚠️ **El pago a la tarjeta de un tercero se queda fuera, y no por falta de
 * tiempo.** El endpoint `apply-credit-card-beneficiary-payment/execute` existe
 * y su comando declara `DestinationAccountNumber` y `BeneficiaryId`, pero su
 * manejador en el backend **no llama al core**: la llamada está comentada bajo
 * un `//TODO : HACER TRANSFERENCIA INTERBANCARIA` y devuelve un éxito fijo
 * —`StatusId = "0"`, `TransactionId = "completado"`—. Conectarlo daría una
 * pantalla que le dice al cliente que pagó la tarjeta de otra persona sin que
 * se haya movido un peso, que es la peor forma posible de fallar. La app
 * Flutter tampoco lo usa: define la llamada en su fuente de datos y su bloc
 * nunca la invoca. Queda escalado al banco (P-03: el backend no se toca).
 */

type Fase =
  | 'cargando'
  | 'error-productos'
  | 'tipos'
  | 'formulario'
  | 'cotizando'
  | 'confirmacion'
  | 'procesando'
  | 'comprobante';

export interface PaymentsScreenProps {
  repositorio: PaymentRepository;
  segundoFactor: TwoFactorRepository;
  vinculoDeDispositivo: DeviceBindingService;
  /** Tarjetas, préstamos y cuentas del cliente. */
  cargarProductos: () => Promise<{
    tarjetas: Producto[];
    prestamos: Producto[];
    cuentas: Producto[];
  }>;
  /** Cotización, que comparte endpoint con las transferencias. */
  cotizar: (parametros: {
    monedaOrigen: number;
    monedaDestino: number;
    monto: number;
  }) => Promise<{ montoConvertido: number; tasa: string }>;
  customerCode: string;
  /**
   * El detalle de una tarjeta, que el asistente pide al elegirla.
   *
   * **D-26**: el listado de productos entrega los dos pagos mínimos cambiados
   * de moneda —la tarjeta ****7147 ofrecía pagar US$ 2,311.41 cuando su
   * mínimo en dólares son US$ 174.04— y el detalle es el coherente. El dato
   * llega así desde el core y no se corrige desde el canal (P-03).
   */
  cargarDetalleDeTarjeta: (
    numeroDeTarjeta: string,
  ) => Promise<DetalleDeTarjeta>;
  /** Tipo con el que arrancar, al llegar desde el detalle de un producto. */
  tipoInicial?: TipoDePago | undefined;
  /**
   * El producto y el ciclo que el cliente ya eligió en el detalle de la
   * tarjeta. El original los lleva en la dirección (`&product=`, `&currency=`)
   * y sin ellos el asistente arranca en la primera tarjeta y en pesos.
   */
  productoInicial?: string | undefined;
  monedaInicial?: 'DOP' | 'USD' | undefined;
  onActivity?: (() => void) | undefined;
  ahora?: (() => Date) | undefined;
}

export function PaymentsScreen({
  repositorio,
  segundoFactor,
  vinculoDeDispositivo,
  cargarProductos,
  cargarDetalleDeTarjeta,
  cotizar,
  customerCode,
  tipoInicial,
  productoInicial,
  monedaInicial,
  onActivity,
  ahora = () => new Date(),
}: PaymentsScreenProps): React.JSX.Element {
  const [fase, setFase] = useState<Fase>('cargando');
  const [tarjetas, setTarjetas] = useState<Producto[]>([]);
  const [prestamos, setPrestamos] = useState<Producto[]>([]);
  const [cuentas, setCuentas] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [datos, setDatos] = useState<DatosDelPago>(() =>
    pagoVacio(TipoDePago.Tarjeta),
  );
  const [resultado, setResultado] = useState<ResultadoDePago | null>(null);
  const [fecha, setFecha] = useState<Date>(() => ahora());
  const [pidiendoCodigo, setPidiendoCodigo] = useState(false);
  const [huella, setHuella] = useState<string | undefined>();

  const resolverCodigo = useRef<((id: string | null) => void) | null>(null);

  const cargar = useCallback(async (): Promise<void> => {
    try {
      const productos = await cargarProductos();
      setTarjetas(productos.tarjetas);
      setPrestamos(productos.prestamos);
      setCuentas(productos.cuentas);
      setFase('tipos');
    } catch {
      setError('Error al cargar tus productos');
      setFase('error-productos');
    }
  }, [cargarProductos]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const arrancado = useRef(false);
  /*
    Cuál es la petición de detalle vigente. Cambiar de tarjeta dos veces
    seguidas deja dos respuestas en vuelo y la primera puede llegar la última;
    sin este contador, el asistente acabaría enseñando el mínimo de la tarjeta
    que el cliente ya descartó.
  */
  const peticionDeDetalle = useRef(0);
  useEffect(() => {
    if (arrancado.current || tipoInicial === undefined || fase !== 'tipos')
      return;
    arrancado.current = true;
    /*
      El producto llega como número de tarjeta, que es como lo compone el
      original. Si no está entre los del cliente se cae al primero, que es el
      comportamiento anterior: una tarjeta que ya no existe no debe dejar la
      pantalla en blanco.
    */
    const elegido =
      productoInicial === undefined
        ? undefined
        : (tipoInicial === TipoDePago.Prestamo ? prestamos : tarjetas).find(
            p => p.identificacion === productoInicial,
          );

    empezar(tipoInicial, elegido, monedaInicial);
    // `empezar` es estable dentro de esta pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoInicial, productoInicial, monedaInicial, fase]);

  // ─── Acciones ─────────────────────────────────────────────────────────────

  /**
   * Arranca el asistente.
   *
   * `producto` llega cuando el cliente tocó una tarjeta concreta en la lista,
   * que es el caso normal desde que la pestaña abre con los productos. Sin él
   * —al llegar por enlace desde el detalle de un producto, donde solo viaja el
   * tipo— se parte del primero, como antes.
   */
  function empezar(
    tipo: TipoDePago,
    producto?: Producto,
    moneda?: 'DOP' | 'USD',
  ): void {
    onActivity?.();

    const disponibles = tipo === TipoDePago.Prestamo ? prestamos : tarjetas;
    const elegido = producto ?? disponibles[0] ?? null;
    const base: DatosDelPago = {
      ...pagoVacio(tipo),
      producto: elegido,
      cuentaOrigen: cuentas[0] ?? null,
    };

    /*
      El ciclo en dólares solo se respeta si la tarjeta lo tiene: pedir «USD»
      sobre una tarjeta que solo opera en pesos dejaría el formulario con los
      tres montos en cero y sin selector con el que volver.
    */
    const inicial: DatosDelPago =
      moneda === 'USD' && esTarjetaMultimoneda(base)
        ? { ...base, moneda }
        : base;

    // La opción de monto por defecto depende del producto: una tarjeta de
    // contado no tiene mínimo, y abrir con «Pago Mínimo RD$ 0.00» se leería
    // como que no hay nada que pagar.
    setDatos({ ...inicial, tipoDeMonto: primeraOpcionValida(inicial) });
    setError(null);
    setFase('formulario');

    if (tipo !== TipoDePago.Prestamo && elegido !== null) {
      void pedirDetalle(elegido.identificacion);
    }
  }

  /**
   * Trae el detalle de la tarjeta elegida y recalcula la opción por defecto.
   *
   * El fallo **no se propaga**: si el detalle no llega, el asistente sigue con
   * la cifra del listado. Dejar al cliente sin poder pagar porque una consulta
   * complementaria falló sería peor que enseñarle un mínimo que el propio
   * banco publica hoy en el listado.
   */
  async function pedirDetalle(numeroDeTarjeta: string): Promise<void> {
    peticionDeDetalle.current += 1;
    const mia = peticionDeDetalle.current;

    try {
      const detalleDeLaTarjeta = await cargarDetalleDeTarjeta(numeroDeTarjeta);
      if (peticionDeDetalle.current !== mia) return;

      setDatos(d => {
        // La tarjeta pudo cambiar mientras la respuesta viajaba.
        if (d.producto?.identificacion !== numeroDeTarjeta) return d;

        const siguiente = { ...d, detalleDeLaTarjeta };
        return { ...siguiente, tipoDeMonto: primeraOpcionValida(siguiente) };
      });
    } catch {
      if (peticionDeDetalle.current !== mia) return;
      setDatos(d => ({ ...d, detalleDeLaTarjeta: null }));
    }
  }

  const irAConfirmacion = async (): Promise<void> => {
    onActivity?.();
    setFase('cotizando');
    setError(null);

    let conCotizacion = datos;

    if (necesitaConversion(datos)) {
      try {
        const cotizacion = await cotizar({
          monedaOrigen: codigoDeMonedaDeLaCuenta(datos),
          monedaDestino: codigoDeMonedaDelPago(datos),
          monto: montoDelPago(datos),
        });
        conCotizacion = { ...datos, cotizacion };
      } catch {
        setFase('formulario');
        setError('No pudimos obtener la tasa de cambio. Intenta de nuevo.');
        return;
      }
    } else {
      conCotizacion = { ...datos, cotizacion: null };
    }

    // Un préstamo no paga comisión: no se consulta el resumen.
    if (esPrestamo(conCotizacion)) {
      setDatos(conCotizacion);
      setFase('confirmacion');
      return;
    }

    const comisiones = await repositorio.comisiones({
      codigoDeCliente: Number.parseInt(customerCode, 10) || 0,
      tipoDeProductoOrigen: tipoDeCuentaOrigen(conCotizacion),
      // El destino es una tarjeta de crédito.
      tipoDeProductoDestino: 3,
      monedaOrigen: codigoDeMonedaDeLaCuenta(conCotizacion),
      monedaDestino: codigoDeMonedaDelPago(conCotizacion),
      monto: montoADebitar(conCotizacion),
      cuentaOrigen: conCotizacion.cuentaOrigen?.identificacion ?? '',
      cuentaDestino: conCotizacion.producto?.identificacion ?? '',
      // Pagar la propia tarjeta no involucra a un tercero: el documento es el
      // del propio cliente, y el core lo resuelve por el código de cliente.
      documentoTipo: 1,
      documentoNumero: '',
    });

    setDatos({ ...conCotizacion, comisiones });
    setFase('confirmacion');
  };

  const confirmar = async (): Promise<void> => {
    onActivity?.();

    const prestamo = esPrestamo(datos);
    const orden = prestamo
      ? ordenDePrestamo(datos, customerCode)
      : ordenDeTarjeta(datos, customerCode);

    const huellaDeLaOrden = prestamo
      ? repositorio.huellaDePrestamo(
          orden as ReturnType<typeof ordenDePrestamo>,
        )
      : repositorio.huellaDeTarjeta(orden as ReturnType<typeof ordenDeTarjeta>);

    setHuella(huellaDeLaOrden);

    /*
      Pagar la propia tarjeta o el propio préstamo no saca el dinero del
      cliente: cuenta como operación entre productos propios y no escala por
      monto. Es la misma lectura que hace el original.
    */
    const nivel = clasificarRiesgo({
      mueveDinero: true,
      monto: montoDelPago(datos),
      enDolares: codigoDeMonedaDelPago(datos) === 840,
      entreCuentasPropias: true,
    });

    const pasos: PasosDeAutorizacion = {
      puedeFirmar: () => vinculoDeDispositivo.puedeFirmar(),
      firmar: () => vinculoDeDispositivo.firmarOperacion(huellaDeLaOrden),
      pedirCodigo: async () =>
        new Promise<string | null>(resolver => {
          resolverCodigo.current = resolver;
          setPidiendoCodigo(true);
        }),
    };

    const autorizacion = await autorizarOperacion(nivel, pasos);

    if (autorizacion.autorizacionId === null) {
      setError(autorizacion.aviso ?? 'No autorizamos la operación.');
      return;
    }

    setFase('procesando');
    setError(null);

    const aplicado = prestamo
      ? await repositorio.pagarPrestamo(
          orden as ReturnType<typeof ordenDePrestamo>,
          autorizacion.autorizacionId,
        )
      : await repositorio.pagarTarjeta(
          orden as ReturnType<typeof ordenDeTarjeta>,
          autorizacion.autorizacionId,
        );

    if (!aplicado.exito) {
      setFase('confirmacion');
      setError(aplicado.mensaje);
      return;
    }

    setResultado(aplicado);
    setFecha(ahora());
    setFase('comprobante');
  };

  const reiniciar = useCallback((): void => {
    setDatos(pagoVacio(TipoDePago.Tarjeta));
    setResultado(null);
    setError(null);
    setHuella(undefined);
    setFase('tipos');
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (fase === 'cargando') {
    return (
      <View style={styles.pantalla}>
        <BscPageHeader
          title="Pagos"
          subtitle="Paga tus tarjetas y tus préstamos"
        />
        <View style={styles.centro}>
          <BscSpinner testID="pagos-cargando" />
        </View>
      </View>
    );
  }

  if (fase === 'error-productos') {
    return (
      <View style={styles.pantalla}>
        <BscPageHeader
          title="Pagos"
          subtitle="Paga tus tarjetas y tus préstamos"
        />
        <BscEmptyState
          icon="cloud-off"
          title="No pudimos cargar tus productos"
          message={error ?? undefined}
          actionLabel="Reintentar"
          onAction={() => {
            setFase('cargando');
            void cargar();
          }}
          testID="pagos-error"
        />
      </View>
    );
  }

  if (fase === 'tipos') {
    /*
      La pestaña abre con **la lista de productos**, no con un selector de
      tipo. Ver `PaymentsHome.tsx` para por qué se volvió al modelo del
      original y qué habría que revisar si llegan más categorías de pago.
    */
    return (
      <PaymentsHome
        tarjetas={tarjetas}
        prestamos={prestamos}
        onElegir={({ producto, esPrestamo }) =>
          empezar(
            esPrestamo ? TipoDePago.Prestamo : TipoDePago.Tarjeta,
            producto,
          )
        }
        onActivity={onActivity}
      />
    );
  }

  const paso =
    fase === 'comprobante'
      ? 2
      : fase === 'formulario' || fase === 'cotizando'
      ? 0
      : 1;

  return (
    <>
      <TransferWizardChrome
        titulo={`Pago de ${tituloDeConfirmacion(datos.tipo)}`}
        paso={paso}
        onAtras={
          fase === 'comprobante'
            ? undefined
            : fase === 'confirmacion' || fase === 'procesando'
            ? () => setFase('formulario')
            : reiniciar
        }
      >
        {fase === 'formulario' || fase === 'cotizando' ? (
          <PaymentStepForm
            datos={datos}
            productos={esPrestamo(datos) ? prestamos : tarjetas}
            cuentas={cuentas}
            error={error}
            onProducto={producto => {
              setDatos(d => {
                // El detalle del anterior no vale para este.
                const siguiente = {
                  ...d,
                  producto,
                  detalleDeLaTarjeta: null,
                };
                return {
                  ...siguiente,
                  tipoDeMonto: primeraOpcionValida(siguiente),
                };
              });
              if (!esPrestamo(datos))
                void pedirDetalle(producto.identificacion);
            }}
            onCuenta={cuentaOrigen => setDatos(d => ({ ...d, cuentaOrigen }))}
            onMoneda={moneda =>
              setDatos(d => {
                const siguiente = { ...d, moneda };
                return {
                  ...siguiente,
                  tipoDeMonto: primeraOpcionValida(siguiente),
                };
              })
            }
            onTipoDeMonto={(tipoDeMonto: TipoDeMonto) =>
              setDatos(d => ({ ...d, tipoDeMonto }))
            }
            onMontoEscrito={montoEscrito =>
              setDatos(d => ({ ...d, montoEscrito }))
            }
            onComentario={comentario => setDatos(d => ({ ...d, comentario }))}
            onCancelar={reiniciar}
            onContinuar={() => void irAConfirmacion()}
          />
        ) : null}

        {fase === 'confirmacion' || fase === 'procesando' ? (
          <PaymentStepConfirmation
            datos={datos}
            error={error}
            onAtras={() => {
              setFase('formulario');
              setError(null);
            }}
            onConfirmar={() => void confirmar()}
          />
        ) : null}

        {fase === 'comprobante' && resultado !== null ? (
          <PaymentReceipt
            datos={datos}
            resultado={resultado}
            fecha={fecha}
            nuevoSaldo={saldoDeLaCuenta(datos) - totalDebitado(datos)}
            onInicio={reiniciar}
          />
        ) : null}

        {fase === 'cotizando' ? <CapaDeProceso mensaje="Calculando…" /> : null}
        {fase === 'procesando' ? (
          <CapaDeProceso mensaje="Procesando pago…" />
        ) : null}
      </TransferWizardChrome>

      <TwoFactorSheet
        visible={pidiendoCodigo}
        repositorio={segundoFactor}
        proposito={
          esPrestamo(datos)
            ? PropositoDeSegundoFactor.PagoDePrestamo
            : PropositoDeSegundoFactor.PagoDeTarjeta
        }
        resumenDeOperacion={`${
          codigoDeMonedaDelPago(datos) === 840 ? 'US$' : 'RD$'
        } ${montoDelPago(datos).toFixed(2)} a ${numeroVisible(datos)}`}
        huellaDeOperacion={huella}
        onCerrar={autorizacionId => {
          setPidiendoCodigo(false);
          resolverCodigo.current?.(autorizacionId);
          resolverCodigo.current = null;
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listaDeTipos: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  tituloSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
    marginBottom: 12,
  },
  textoSeccion: {
    ...BscTextStyles['Body MD/16 Bold'],
    color: BscColors.textPrimary,
  },
  filaDeTipo: {
    marginBottom: BscSpacing.xs,
  },
  tarjetaDeTipo: {
    padding: 0,
  },
});
