import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BscCard,
  BscColors,
  BscEmptyState,
  BscIconTile,
  BscListRow,
  BscPageHeader,
  BscSpacing,
  BscSpinner,
  type BscIconName,
  BscTextStyles,
} from '@bsc/ui-native';
import { clasificarRiesgo } from '../../../core/security/operationRisk';
import {
  autorizarOperacion,
  type PasosDeAutorizacion,
} from '../../deviceBinding/domain/authorizeOperation';
import type { DeviceBindingService } from '../../deviceBinding/domain/deviceBindingService';
import type { Beneficiario } from '../../beneficiaries/data/beneficiaryContracts';
import type { Producto } from '../../dashboard/data/productContracts';
import { PropositoDeSegundoFactor } from '../../twoFactor/data/twoFactorContracts';
import type { TwoFactorRepository } from '../../twoFactor/data/twoFactorRepository';
import { TwoFactorSheet } from '../../twoFactor/ui/TwoFactorSheet';
import {
  codigoDeBeneficiario,
  SIN_COMISIONES,
  SIN_VALIDAR,
  TIPOS,
  TipoDeTransferencia,
  tipoParaBeneficiario,
  usaBeneficiario,
  type ResultadoDeTransferencia,
} from '../data/transferContracts';
import type { TransferRepository } from '../data/transferRepository';
import {
  destinoEnmascarado,
  documentoParaComisiones,
  monedaDelDestino,
  monedaDelOrigen,
  montoADebitar,
  necesitaConversion,
  nombreDelDestino,
  ordenDeLaTransferencia,
  simboloDelDestino,
  tipoDestinoParaComisiones,
  tipoOrigenParaComisiones,
  totalDebitado,
  type DatosDelAsistente,
} from '../domain/transferFlow';

import { TransferReceipt } from './TransferReceipt';
import { TransferStepConfirmation } from './TransferStepConfirmation';
import { TransferStepForm } from './TransferStepForm';
import { CapaDeProceso, TransferWizardChrome } from './TransferWizardChrome';

/**
 * Transferencias: el selector de tipo y el asistente de tres pasos.
 *
 * Portada de `transfers_screen.dart`, `transfer_home_body.dart` y
 * `transfer_wizard_body.dart`, con el estado que en el original vive en
 * `TransferBloc`. Los cálculos no están aquí: están en `domain/transferFlow`,
 * con pruebas. Esta pantalla decide **cuándo** se pide algo y qué se enseña.
 *
 * El punto donde se mueve el dinero es `confirmar`, y merece leerse entero: la
 * orden se compone una sola vez, se firma esa misma orden y se ejecuta esa
 * misma orden. Componer una para firmar y otra para enviar es exactamente el
 * defecto que la oleada 5 encontró en los otros dos canales.
 */

type Fase =
  | 'cargando'
  | 'error-cuentas'
  | 'tipos'
  | 'formulario'
  | 'cotizando'
  | 'confirmacion'
  | 'procesando'
  | 'comprobante';

const ORDEN_DE_TIPOS: readonly TipoDeTransferencia[] = [
  TipoDeTransferencia.CuentasPropias,
  TipoDeTransferencia.Terceros,
  TipoDeTransferencia.OtrosBancos,
  TipoDeTransferencia.Expresa,
  TipoDeTransferencia.Internacional,
];

const ICONOS: Readonly<Record<string, BscIconName>> = {
  transfer: 'transfer',
  people: 'people',
  bank: 'bank',
  // El original usa un rayo para la expresa; aquí la flecha, que es el trazo
  // más cercano del juego que ya tiene la aplicación.
  bolt: 'arrow-forward',
  globe: 'globe',
};

export interface TransfersScreenProps {
  repositorio: TransferRepository;
  segundoFactor: TwoFactorRepository;
  vinculoDeDispositivo: DeviceBindingService;
  /** Cuentas del cliente, ya cargadas por el dashboard. */
  cargarCuentas: () => Promise<Producto[]>;
  customerCode: string;
  /** Beneficiario con el que arrancar, cuando se llega desde su lista. */
  beneficiarioInicial?: { id: string; tipo: number } | undefined;
  onActivity?: (() => void) | undefined;
  /** Para que la prueba y la vista previa fijen la fecha del comprobante. */
  ahora?: (() => Date) | undefined;
}

export function TransfersScreen({
  repositorio,
  segundoFactor,
  vinculoDeDispositivo,
  cargarCuentas,
  customerCode,
  beneficiarioInicial,
  onActivity,
  ahora = () => new Date(),
}: TransfersScreenProps): React.JSX.Element {
  const [fase, setFase] = useState<Fase>('cargando');
  const [cuentas, setCuentas] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [datos, setDatos] = useState<DatosDelAsistente>(() => vacio());
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [cargandoBeneficiarios, setCargandoBeneficiarios] = useState(false);
  const [cuentaExpresa, setCuentaExpresa] = useState('');
  const [validando, setValidando] = useState(false);

  const [resultado, setResultado] = useState<ResultadoDeTransferencia | null>(
    null,
  );
  const [fecha, setFecha] = useState<Date>(() => ahora());
  const [pidiendoCodigo, setPidiendoCodigo] = useState(false);
  const [huella, setHuella] = useState<string | undefined>();

  /** Resuelve la promesa del código cuando la hoja se cierra. */
  const resolverCodigo = useRef<((id: string | null) => void) | null>(null);

  // ─── Carga inicial ────────────────────────────────────────────────────────

  useEffect(() => {
    let vigente = true;

    void (async () => {
      try {
        const leidas = await cargarCuentas();
        if (!vigente) return;
        setCuentas(leidas);
        setFase('tipos');
      } catch {
        if (vigente) {
          setError('Error al cargar tus cuentas');
          setFase('error-cuentas');
        }
      }
    })();

    return () => {
      vigente = false;
    };
  }, [cargarCuentas]);

  // Llegando desde la lista de beneficiarios, el destino ya está decidido: se
  // entra directo a su flujo en vez de preguntar el tipo otra vez.
  const arrancado = useRef(false);
  useEffect(() => {
    if (arrancado.current || beneficiarioInicial === undefined) return;
    if (fase !== 'tipos') return;

    const tipo = tipoParaBeneficiario(beneficiarioInicial.tipo);
    if (tipo === null) return;

    arrancado.current = true;
    void empezar(tipo, beneficiarioInicial.id);
    // `empezar` es estable dentro de esta pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beneficiarioInicial, fase]);

  // ─── Acciones del asistente ───────────────────────────────────────────────

  const empezar = async (
    tipo: TipoDeTransferencia,
    beneficiarioId?: string,
  ): Promise<void> => {
    onActivity?.();

    const origen = cuentas[0] ?? null;
    const destinoPropio =
      tipo === TipoDeTransferencia.CuentasPropias
        ? cuentas.find(c => c.identificacion !== origen?.identificacion) ?? null
        : null;

    setDatos({ ...vacio(), tipo, origen, destinoPropio });
    setCuentaExpresa('');
    setError(null);
    setFase('formulario');

    if (!usaBeneficiario(tipo)) {
      // El destino propio se valida contra el core igual que uno ajeno: es lo
      // que trae el `targetProduct` que el backend pide.
      if (destinoPropio !== null) {
        await validarDestino(destinoPropio.identificacion);
      }
      return;
    }

    const codigo = codigoDeBeneficiario(tipo);
    if (codigo === null) return;

    setCargandoBeneficiarios(true);
    try {
      const lista = await repositorio.beneficiariosDeTipo(codigo);
      setBeneficiarios(lista);

      const elegido =
        beneficiarioId === undefined
          ? null
          : lista.find(b => b.id === beneficiarioId) ?? null;

      if (elegido !== null) setDatos(d => ({ ...d, beneficiario: elegido }));
    } catch {
      setError('No pudimos cargar tus beneficiarios.');
    } finally {
      setCargandoBeneficiarios(false);
    }
  };

  const validarDestino = async (numeroDeCuenta: string): Promise<void> => {
    setValidando(true);
    setError(null);

    const validacion = await repositorio.validarCuenta(
      numeroDeCuenta,
      customerCode,
    );
    setValidando(false);

    if (validacion.producto === null) {
      setError('No pudimos validar la cuenta destino.');
      setDatos(d => ({ ...d, validacion: SIN_VALIDAR }));
      return;
    }

    setDatos(d => ({ ...d, validacion }));
  };

  const irAConfirmacion = async (): Promise<void> => {
    onActivity?.();
    setFase('cotizando');
    setError(null);

    let conCotizacion = datos;

    if (necesitaConversion(datos)) {
      try {
        const cotizacion = await repositorio.cotizar({
          monedaOrigen: monedaDelOrigen(datos),
          monedaDestino: monedaDelDestino(datos),
          codigoDeCliente: Number.parseInt(customerCode, 10) || 0,
          monto: datos.monto,
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

    const documento = documentoParaComisiones(conCotizacion);

    const comisiones = await repositorio.comisiones({
      codigoDeCliente: Number.parseInt(customerCode, 10) || 0,
      tipoDeProductoOrigen: tipoOrigenParaComisiones(conCotizacion),
      tipoDeProductoDestino: tipoDestinoParaComisiones(conCotizacion),
      monedaOrigen: monedaDelOrigen(conCotizacion),
      monedaDestino: monedaDelDestino(conCotizacion),
      // El resumen se pide sobre lo que sale de la cuenta, no sobre lo que
      // llega: es lo que hace el original cuando hay conversión.
      monto: montoADebitar(conCotizacion),
      cuentaOrigen: conCotizacion.origen?.identificacion ?? '',
      cuentaDestino: ordenDeLaTransferencia(conCotizacion).cuentaDestino,
      documentoTipo: documento.tipo,
      documentoNumero: documento.numero,
      subtipo: ordenDeLaTransferencia(conCotizacion).subtipo,
    });

    setDatos({ ...conCotizacion, comisiones });
    setFase('confirmacion');
  };

  /**
   * Autoriza y ejecuta.
   *
   * La orden se compone **una sola vez**: se firma esa orden y se envía esa
   * orden. Es lo que garantiza que la huella que el backend recalcula sea la
   * misma que se autorizó.
   */
  const confirmar = async (): Promise<void> => {
    onActivity?.();

    const orden = ordenDeLaTransferencia(datos);
    const huellaDeLaOrden = repositorio.huellaDe(orden, customerCode);
    setHuella(huellaDeLaOrden);

    const nivel = clasificarRiesgo({
      mueveDinero: true,
      monto: datos.monto,
      enDolares: monedaDelDestino(datos) === 840,
      entreCuentasPropias: datos.tipo === TipoDeTransferencia.CuentasPropias,
      internacional: datos.tipo === TipoDeTransferencia.Internacional,
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

    const ejecutada = await repositorio.ejecutar(
      orden,
      autorizacion.autorizacionId,
    );

    if (!ejecutada.exito) {
      setFase('confirmacion');
      setError(ejecutada.mensaje);
      return;
    }

    setResultado(ejecutada);
    setFecha(ahora());
    setFase('comprobante');
  };

  const reiniciar = useCallback((): void => {
    setDatos(vacio());
    setBeneficiarios([]);
    setCuentaExpresa('');
    setResultado(null);
    setError(null);
    setHuella(undefined);
    setFase('tipos');
  }, []);

  // ─── Datos derivados para las pantallas ───────────────────────────────────

  const nombreDelOrigen = useMemo(
    () =>
      datos.origen?.categoria === 'CC'
        ? 'Cuenta Corriente'
        : 'Cuenta de Ahorros',
    [datos.origen],
  );

  const cuentaDelOrigen = useMemo(() => {
    const numero = datos.origen?.identificacion ?? '';
    return numero.length <= 4 ? numero : `****${numero.slice(-4)}`;
  }, [datos.origen]);

  const saldoDelOrigen =
    datos.origen === null
      ? 0
      : datos.origen.saldoDisponible !== 0
      ? datos.origen.saldoDisponible
      : datos.origen.saldoActual;

  const resumenDeOperacion = `${simboloDelDestino(datos)} ${datos.monto.toFixed(
    2,
  )} a ${nombreDelDestino(datos)} ${destinoEnmascarado(datos)}`;

  // ─── Render ───────────────────────────────────────────────────────────────

  if (fase === 'cargando') {
    return (
      <View style={styles.pantalla}>
        <BscPageHeader
          title="Transferencias"
          subtitle="Envía dinero de forma rápida y segura"
        />
        <View style={styles.centro}>
          <BscSpinner testID="transferencias-cargando" />
        </View>
      </View>
    );
  }

  if (fase === 'error-cuentas') {
    return (
      <View style={styles.pantalla}>
        <BscPageHeader
          title="Transferencias"
          subtitle="Envía dinero de forma rápida y segura"
        />
        <BscEmptyState
          icon="cloud-off"
          title="No pudimos cargar tus cuentas"
          message={error ?? undefined}
          actionLabel="Reintentar"
          onAction={() => {
            setFase('cargando');
            void cargarCuentas()
              .then(leidas => {
                setCuentas(leidas);
                setFase('tipos');
              })
              .catch(() => {
                setError('Error al cargar tus cuentas');
                setFase('error-cuentas');
              });
          }}
          testID="transferencias-error"
        />
      </View>
    );
  }

  if (fase === 'tipos') {
    return (
      <View style={styles.pantalla}>
        <BscPageHeader
          title="Transferencias"
          subtitle="Envía dinero de forma rápida y segura"
        />

        <ScrollView
          contentContainerStyle={styles.listaDeTipos}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tituloSeccion}>
            <BscIconTile icon="transfer" size={30} iconSize={15} />
            <Text style={styles.textoSeccion}>Tipo de Transferencia</Text>
          </View>

          {ORDEN_DE_TIPOS.map(tipo => (
            <View key={tipo} style={styles.filaDeTipo}>
              <BscCard style={styles.tarjetaDeTipo}>
                <BscListRow
                  leading={
                    <BscIconTile
                      icon={ICONOS[TIPOS[tipo].icono] ?? 'transfer'}
                      size={44}
                      iconSize={21}
                    />
                  }
                  title={TIPOS[tipo].titulo}
                  subtitle={TIPOS[tipo].descripcion}
                  showChevron
                  onPress={() => void empezar(tipo)}
                  testID={`tipo-${tipo}`}
                />
              </BscCard>
            </View>
          ))}
        </ScrollView>
      </View>
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
        titulo={TIPOS[datos.tipo].titulo}
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
          <TransferStepForm
            datos={datos}
            cuentas={cuentas}
            beneficiarios={beneficiarios}
            cargandoBeneficiarios={cargandoBeneficiarios}
            validando={validando}
            cuentaExpresa={cuentaExpresa}
            error={error}
            onOrigen={cuenta => setDatos(d => ({ ...d, origen: cuenta }))}
            onDestinoPropio={cuenta => {
              setDatos(d => ({ ...d, destinoPropio: cuenta }));
              void validarDestino(cuenta.identificacion);
            }}
            onBeneficiario={beneficiario =>
              setDatos(d => ({ ...d, beneficiario }))
            }
            onCuentaExpresa={setCuentaExpresa}
            onValidarExpresa={() => void validarDestino(cuentaExpresa)}
            onMonto={monto => setDatos(d => ({ ...d, monto }))}
            onComentario={comentario => setDatos(d => ({ ...d, comentario }))}
            onCancelar={reiniciar}
            onContinuar={() => void irAConfirmacion()}
          />
        ) : null}

        {fase === 'confirmacion' || fase === 'procesando' ? (
          <TransferStepConfirmation
            datos={datos}
            nombreDelOrigen={nombreDelOrigen}
            cuentaDelOrigen={cuentaDelOrigen}
            saldoDelOrigen={saldoDelOrigen}
            error={error}
            onAtras={() => {
              setFase('formulario');
              setError(null);
            }}
            onConfirmar={() => void confirmar()}
          />
        ) : null}

        {fase === 'comprobante' && resultado !== null ? (
          <TransferReceipt
            datos={datos}
            resultado={resultado}
            fecha={fecha}
            nombreDelOrigen={nombreDelOrigen}
            cuentaDelOrigen={cuentaDelOrigen}
            nuevoSaldo={saldoDelOrigen - totalDebitado(datos)}
            onInicio={reiniciar}
          />
        ) : null}

        {fase === 'cotizando' ? <CapaDeProceso mensaje="Calculando…" /> : null}
        {fase === 'procesando' ? (
          <CapaDeProceso mensaje="Procesando transferencia…" />
        ) : null}
      </TransferWizardChrome>

      <TwoFactorSheet
        visible={pidiendoCodigo}
        repositorio={segundoFactor}
        proposito={PropositoDeSegundoFactor.Transferencia}
        resumenDeOperacion={resumenDeOperacion}
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

function vacio(): DatosDelAsistente {
  return {
    tipo: TipoDeTransferencia.CuentasPropias,
    origen: null,
    destinoPropio: null,
    beneficiario: null,
    validacion: SIN_VALIDAR,
    monto: 0,
    comentario: '',
    cotizacion: null,
    comisiones: SIN_COMISIONES,
  };
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
