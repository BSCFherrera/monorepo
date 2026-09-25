import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BscDateRangeSheet } from '@bsc/ui-native';
import { lastDaysRange } from '@bsc/utils';
import { type DateRange } from '@bsc/contracts';
import { AccountOfficerScreen } from '../src/features/accountOfficer/ui/AccountOfficerScreen';
import {
  CATALOGOS_VACIOS,
  type CatalogosDeBeneficiario,
} from '../src/features/beneficiaries/data/beneficiaryContracts';
import { AddBeneficiarySheet } from '../src/features/beneficiaries/ui/AddBeneficiarySheet';
import { BeneficiariesScreen } from '../src/features/beneficiaries/ui/BeneficiariesScreen';
import { TransfersScreen } from '../src/features/transfers/ui/TransfersScreen';
import { PaymentsScreen } from '../src/features/payments/ui/PaymentsScreen';
import { TransferStepConfirmation } from '../src/features/transfers/ui/TransferStepConfirmation';
import { TransferReceipt } from '../src/features/transfers/ui/TransferReceipt';
import { TransferWizardChrome } from '../src/features/transfers/ui/TransferWizardChrome';
import {
  SIN_COMISIONES,
  SIN_VALIDAR,
  TipoDeTransferencia,
} from '../src/features/transfers/data/transferContracts';
import type { DatosDelAsistente } from '../src/features/transfers/domain/transferFlow';
import {
  agruparProductos,
  parseProducto,
} from '../src/features/dashboard/data/productContracts';
import type { DeviceBindingService } from '../src/features/deviceBinding/domain/deviceBindingService';
import { PantallaDeArranque } from '../src/app/PantallaDeArranque';
import { ProductDetailRepository } from '../src/features/productDetail/data/productDetailRepository';
import { CreditCardDetailScreen } from '../src/features/productDetail/ui/CreditCardDetailScreen';
import { ProductDetailScreen } from '../src/features/productDetail/ui/ProductDetailScreen';
import { ProfileScreen } from '../src/features/profile/ui/ProfileScreen';
import { MyDevicesScreen } from '../src/features/deviceBinding/ui/MyDevicesScreen';
import { SecurityScreen } from '../src/features/deviceBinding/ui/SecurityScreen';
import { SoftTokenScreen } from '../src/features/deviceBinding/ui/SoftTokenScreen';
import { ExchangeRatesScreen } from '../src/features/exchangeRates/ui/ExchangeRatesScreen';
import { PaymentsHome } from '../src/features/payments/ui/PaymentsHome';
import { TaxReceiptsScreen } from '../src/features/taxReceipts/ui/TaxReceiptsScreen';

import { MarcoDeTelefono } from './MarcoDeTelefono';
import {
  beneficiariosSimulados,
  clienteSimulado,
  repositorioSimulado,
  segundoFactorSimulado,
  transferenciasSimuladas,
  vinculoSimulado,
  CUENTAS_DE_TRANSFERENCIA,
  pagosSimulados,
  PRODUCTOS_A_PAGAR,
  almacenamientoSimulado,
  segundoFactorConSecreto,
  segundoFactorSinSecreto,
  vinculoCompletoSimulado,
  DISPOSITIVOS_SIMULADOS,
  tasasSimuladas,
  comprobantesSimulados,
  CUENTAS_DE_COMPROBANTES,
} from './datosSimulados';

/**
 * Galería de pantallas para comparar contra la app Flutter en el navegador.
 *
 * Cada pantalla se monta dentro de un marco del tamaño del Pixel para que las
 * medidas se lean como en el teléfono. Los datos vienen de `datosSimulados`,
 * que responde con **la forma cruda del core** en vez de con objetos ya
 * digeridos: así la vista previa ejercita también los contratos, que es donde
 * han aparecido la mayoría de los defectos.
 *
 * Los datos son sintéticos. No hay aquí ningún número de cuenta, nombre ni
 * monto de un cliente real.
 *
 * **Al capturar pantallas hay una limitación que conviene conocer.** Las hojas
 * modales no se dibujan dentro del marco: React Native Web las lleva a la raíz
 * del documento y ocupan el ancho de la ventana. Y el navegador en modo
 * headless de esta máquina no baja de unos 500 puntos de ancho, así que una
 * hoja capturada ahí sale a 500 y no a los 360 del teléfono. Para comparar una
 * hoja hay que capturar **la app Flutter con la ventana del mismo ancho**; para
 * todo lo demás, el marco de 360 es fiel.
 */

/**
 * El día con el que se monta la vista previa.
 *
 * Es fijo para que las capturas sean comparables entre sesiones: con la fecha
 * real, las píldoras de período y los meses del estado de cuenta cambiarían de
 * un día para otro y dos capturas del mismo cambio no se podrían comparar.
 */
const HOY = new Date(2026, 4, 27);

/**
 * Un asistente a medio recorrer, para poder comparar los pasos 2 y 3.
 *
 * Datos sintéticos, y con comisión e impuesto puestos para que el desglose se
 * vea entero.
 */
const DATOS_DE_MUESTRA: DatosDelAsistente = {
  tipo: TipoDeTransferencia.Terceros,
  origen: {
    categoria: 'CA',
    identificacion: '11042010013953',
    codigoMoneda: 214,
    estado: 'A',
    saldoActual: 128_450.12,
    saldoDisponible: 128_450.12,
    numeroEnmascarado: undefined,
    saldoPesos: 0,
    saldoDolares: 0,
    disponiblePesos: 0,
    disponibleDolares: 0,
    pagoMinimoPesos: 0,
    pagoMinimoDolares: 0,
  } as DatosDelAsistente['origen'],
  destinoPropio: null,
  beneficiario: {
    id: 'b-001',
    tipo: 1,
    alias: 'Mamá',
    nombre: 'ROSA MARIA GUZMAN',
    numeroDeCuenta: '11042010077431',
    tipoDeCuenta: 'Savings',
    codigoMoneda: '214',
    banco: undefined,
    documentoTipo: 1,
    documentoNumero: '00100000001',
  },
  validacion: SIN_VALIDAR,
  monto: 1_500,
  comentario: 'Pago de la renta',
  cotizacion: null,
  comisiones: { ...SIN_COMISIONES, comision: 25, impuesto: 2.25 },
};

interface Pantalla {
  clave: string;
  nombre: string;
  render: (repositorio: ProductDetailRepository) => React.JSX.Element;
}

const PANTALLAS: Pantalla[] = [
  {
    // La primera de la lista porque es la primera que ve el cliente: mientras
    // la aplicación lee el nombre recordado y valida el token guardado.
    clave: 'arranque',
    nombre: 'Arranque',
    render: () => <PantallaDeArranque />,
  },
  {
    clave: 'cuenta',
    nombre: 'Detalle · Cuenta de ahorros',
    render: (repositorio) => (
      <ProductDetailScreen
        repositorio={repositorio}
        numeroDeProducto="11042010013953"
        tipoDeProducto="CA"
        codigoMoneda={214}
        saldoInicial={128_450.12}
        onBack={() => undefined}
        onActivity={() => undefined}
      />
    ),
  },
  {
    clave: 'cuenta-sobregiro',
    nombre: 'Detalle · Cuenta con sobregiro',
    render: (repositorio) => (
      <ProductDetailScreen
        repositorio={repositorio}
        numeroDeProducto="11042010055512"
        tipoDeProducto="CC"
        codigoMoneda={214}
        saldoInicial={84_320.55}
        onBack={() => undefined}
        onActivity={() => undefined}
      />
    ),
  },
  {
    clave: 'cuenta-usd',
    nombre: 'Detalle · Cuenta en dólares',
    render: (repositorio) => (
      <ProductDetailScreen
        repositorio={repositorio}
        numeroDeProducto="11042010099887"
        tipoDeProducto="CA"
        codigoMoneda={840}
        saldoInicial={3_120.45}
        onBack={() => undefined}
        onActivity={() => undefined}
      />
    ),
  },
  {
    clave: 'tarjeta',
    nombre: 'Detalle · Tarjeta de crédito',
    render: (repositorio) => (
      <CreditCardDetailScreen
        repositorio={repositorio}
        numeroDeTarjeta="4539123456780668"
        numeroEnmascarado="4539********0668"
        onBack={() => undefined}
        onActivity={() => undefined}
        hoy={HOY}
      />
    ),
  },
  {
    // Una tarjeta cobrada de contado: el core manda el pago mínimo en cero y el
    // aviso tiene que anunciar el total del ciclo, no «Pago mínimo RD$ 0.00».
    clave: 'tarjeta-contado',
    nombre: 'Detalle · Tarjeta de contado',
    render: (repositorio) => (
      <CreditCardDetailScreen
        repositorio={repositorio}
        numeroDeTarjeta="4539123456781234"
        numeroEnmascarado="4539********1234"
        onBack={() => undefined}
        onActivity={() => undefined}
        hoy={HOY}
      />
    ),
  },
  {
    clave: 'prestamo',
    nombre: 'Detalle · Préstamo',
    render: (repositorio) => (
      <ProductDetailScreen
        repositorio={repositorio}
        numeroDeProducto="293276"
        tipoDeProducto="PR"
        codigoMoneda={214}
        saldoInicial={450_000}
        onBack={() => undefined}
        onActivity={() => undefined}
      />
    ),
  },
  {
    clave: 'certificado',
    nombre: 'Detalle · Certificado',
    render: (repositorio) => (
      <ProductDetailScreen
        repositorio={repositorio}
        numeroDeProducto="900123"
        tipoDeProducto="CD"
        codigoMoneda={214}
        saldoInicial={512_400}
        onBack={() => undefined}
        onActivity={() => undefined}
      />
    ),
  },
  {
    clave: 'perfil',
    nombre: 'Perfil',
    render: () => (
      <ProfileScreen
        repositorio={clienteSimulado()}
        customerCode="99001"
        usuario="mreyes"
        version="0.1.0 (1)"
        onOficialDeCuenta={() => undefined}
        onSeguridad={() => undefined}
        onTasaDeCambio={() => undefined}
        onBeneficiarios={() => undefined}
        onComprobantesFiscales={() => undefined}
        onCerrarSesion={() => undefined}
        onCerrarTodasLasSesiones={() => undefined}
      />
    ),
  },
  {
    // Sin oficial asignado el bloque «Mi oficial de cuenta» no debe aparecer.
    clave: 'perfil-sin-oficial',
    nombre: 'Perfil · sin oficial',
    render: () => (
      <ProfileScreen
        repositorio={clienteSimulado({ sinOficial: true })}
        customerCode="99001"
        usuario="mreyes"
        version="0.1.0 (1)"
        onOficialDeCuenta={() => undefined}
        onSeguridad={() => undefined}
        onTasaDeCambio={() => undefined}
        onBeneficiarios={() => undefined}
        onComprobantesFiscales={() => undefined}
        onCerrarSesion={() => undefined}
        onCerrarTodasLasSesiones={() => undefined}
      />
    ),
  },
  {
    clave: 'oficial',
    nombre: 'Mi Oficial de Cuenta',
    render: () => (
      <AccountOfficerScreen
        repositorio={clienteSimulado()}
        customerCode="99001"
        onBack={() => undefined}
        abrirEnlace={() => undefined}
      />
    ),
  },
  {
    // El camino de error: el que ofrece reintentar.
    clave: 'oficial-sin-asignar',
    nombre: 'Oficial · sin asignar',
    render: () => (
      <AccountOfficerScreen
        repositorio={clienteSimulado({ sinOficial: true })}
        customerCode="99001"
        onBack={() => undefined}
        abrirEnlace={() => undefined}
      />
    ),
  },
  {
    clave: 'pagos-inicio',
    nombre: 'Pagos · lista de productos',
    render: () => {
      const agrupados = agruparProductos(PRODUCTOS_A_PAGAR.map(parseProducto));
      return (
        <PaymentsHome
          tarjetas={agrupados.tarjetas}
          prestamos={agrupados.prestamos}
          onElegir={() => undefined}
        />
      );
    },
  },
  {
    clave: 'pagos-inicio-vacio',
    nombre: 'Pagos · nada por pagar',
    render: () => (
      <PaymentsHome tarjetas={[]} prestamos={[]} onElegir={() => undefined} />
    ),
  },
  {
    clave: 'tasa-de-cambio',
    nombre: 'Tasa de cambio',
    render: () => (
      <ExchangeRatesScreen
        repositorio={tasasSimuladas() as never}
        onBack={() => undefined}
      />
    ),
  },
  {
    clave: 'tasa-de-cambio-error',
    nombre: 'Tasa de cambio · sin red',
    render: () => (
      <ExchangeRatesScreen
        repositorio={tasasSimuladas({ falla: true }) as never}
        onBack={() => undefined}
      />
    ),
  },
  {
    clave: 'comprobantes',
    nombre: 'Comprobantes fiscales',
    render: () => (
      <TaxReceiptsScreen
        repositorio={comprobantesSimulados() as never}
        cargarCuentas={async () => CUENTAS_DE_COMPROBANTES as never}
        customerCode="99001"
        onBack={() => undefined}
        ahora={() => HOY}
      />
    ),
  },
  {
    clave: 'comprobantes-vacio',
    nombre: 'Comprobantes · sin resultados',
    render: () => (
      <TaxReceiptsScreen
        repositorio={comprobantesSimulados({ vacio: true }) as never}
        cargarCuentas={async () => CUENTAS_DE_COMPROBANTES as never}
        customerCode="99001"
        onBack={() => undefined}
        ahora={() => HOY}
      />
    ),
  },
  {
    clave: 'seguridad',
    nombre: 'Seguridad · enrolado',
    render: () => (
      <SecurityScreen
        vinculo={
          vinculoCompletoSimulado({ estado: 'ready' }) as never
        }
        onBack={() => undefined}
        onMisDispositivos={() => undefined}
        onTokenSuave={() => undefined}
      />
    ),
  },
  {
    clave: 'seguridad-sin-enrolar',
    nombre: 'Seguridad · sin enrolar',
    render: () => (
      <SecurityScreen
        vinculo={vinculoCompletoSimulado({ estado: 'notEnrolled' }) as never}
        onBack={() => undefined}
        onMisDispositivos={() => undefined}
        onTokenSuave={() => undefined}
      />
    ),
  },
  {
    clave: 'seguridad-llave-perdida',
    nombre: 'Seguridad · llave inválida',
    render: () => (
      <SecurityScreen
        vinculo={vinculoCompletoSimulado({ estado: 'keyLost' }) as never}
        onBack={() => undefined}
        onMisDispositivos={() => undefined}
        onTokenSuave={() => undefined}
      />
    ),
  },
  {
    clave: 'seguridad-sin-soporte',
    nombre: 'Seguridad · teléfono sin soporte',
    render: () => (
      <SecurityScreen
        vinculo={vinculoCompletoSimulado({ estado: 'unsupported' }) as never}
        onBack={() => undefined}
        onMisDispositivos={() => undefined}
        onTokenSuave={() => undefined}
      />
    ),
  },
  {
    clave: 'mis-dispositivos',
    nombre: 'Mis dispositivos',
    render: () => (
      <MyDevicesScreen
        vinculo={
          vinculoCompletoSimulado({
            estado: 'ready',
            dispositivos: DISPOSITIVOS_SIMULADOS,
          }) as never
        }
        onBack={() => undefined}
      />
    ),
  },
  {
    clave: 'mis-dispositivos-vacio',
    nombre: 'Mis dispositivos · vacío',
    render: () => (
      <MyDevicesScreen
        vinculo={vinculoCompletoSimulado({ estado: 'notEnrolled' }) as never}
        onBack={() => undefined}
      />
    ),
  },
  {
    clave: 'token-suave',
    nombre: 'Token · bloqueado',
    render: () => (
      <SoftTokenScreen
        segundoFactor={segundoFactorSinSecreto() as never}
        almacenamiento={almacenamientoSimulado() as never}
        onBack={() => undefined}
      />
    ),
  },
  {
    clave: 'token-suave-visible',
    nombre: 'Token · código a la vista',
    render: () => (
      <SoftTokenScreen
        segundoFactor={segundoFactorConSecreto() as never}
        almacenamiento={
          almacenamientoSimulado({ soft: 'JBSWY3DPEHPK3PXP' }) as never
        }
        onBack={() => undefined}
        ahora={() => HOY.getTime()}
      />
    ),
  },
  {
    clave: 'beneficiarios',
    nombre: 'Beneficiarios',
    render: () => (
      <BeneficiariesScreen
        repositorio={beneficiariosSimulados()}
        segundoFactor={segundoFactorSimulado()}
        onBack={() => undefined}
        onTransferir={() => undefined}
      />
    ),
  },
  {
    clave: 'beneficiarios-vacio',
    nombre: 'Beneficiarios · vacío',
    render: () => (
      <BeneficiariesScreen
        repositorio={beneficiariosSimulados({ vacia: true })}
        segundoFactor={segundoFactorSimulado()}
        onBack={() => undefined}
      />
    ),
  },
  {
    clave: 'beneficiarios-error',
    nombre: 'Beneficiarios · sin cargar',
    render: () => (
      <BeneficiariesScreen
        repositorio={beneficiariosSimulados({ falla: true })}
        segundoFactor={segundoFactorSimulado()}
        onBack={() => undefined}
      />
    ),
  },
  {
    // Abierta de entrada, como el selector de período: en modo headless no hay
    // quien toque el botón que la abre.
    clave: 'alta-beneficiario',
    nombre: 'Alta de beneficiario',
    render: () => <AltaDeBeneficiarioAbierta />,
  },
  {
    clave: 'transferencias',
    nombre: 'Transferencias · tipos',
    render: () => <TransferenciasDeMuestra />,
  },
  {
    // Los pasos 2 y 3 se montan sueltos: llegar a ellos por la pantalla exige
    // tocar, y en modo headless no hay quien toque.
    clave: 'transferencia-confirmar',
    nombre: 'Transferencia · confirmar',
    render: () => (
      <TransferWizardChrome titulo="A Terceros (BSC)" paso={1} onAtras={() => undefined}>
        <TransferStepConfirmation
          datos={DATOS_DE_MUESTRA}
          nombreDelOrigen="Cuenta de Ahorros"
          cuentaDelOrigen="****3953"
          saldoDelOrigen={128_450.12}
          error={null}
          onAtras={() => undefined}
          onConfirmar={() => undefined}
        />
      </TransferWizardChrome>
    ),
  },
  {
    clave: 'transferencia-comprobante',
    nombre: 'Transferencia · comprobante',
    render: () => (
      <TransferWizardChrome titulo="A Terceros (BSC)" paso={2}>
        <TransferReceipt
          datos={DATOS_DE_MUESTRA}
          resultado={{
            exito: true,
            mensaje: 'Transferencia realizada satisfactoriamente.',
            transaccionId: 'TX-99120',
            estadoId: '0',
            comisionCobrada: 25,
            tasaAplicada: 0,
          }}
          fecha={HOY}
          nombreDelOrigen="Cuenta de Ahorros"
          cuentaDelOrigen="****3953"
          nuevoSaldo={126_922.87}
          onInicio={() => undefined}
        />
      </TransferWizardChrome>
    ),
  },
  {
    // El estado «1» del core: recibida pero pendiente de aprobación. Otro
    // icono, otro color y otro título, para que nadie la dé por aplicada.
    clave: 'transferencia-pendiente',
    nombre: 'Transferencia · pendiente',
    render: () => (
      <TransferWizardChrome titulo="A Otros Bancos" paso={2}>
        <TransferReceipt
          datos={DATOS_DE_MUESTRA}
          resultado={{
            exito: true,
            mensaje: 'Transferencia recibida, pendiente de aprobación.',
            transaccionId: 'TX-99121',
            estadoId: '1',
            comisionCobrada: 25,
            tasaAplicada: 0,
          }}
          fecha={HOY}
          nombreDelOrigen="Cuenta de Ahorros"
          cuentaDelOrigen="****3953"
          nuevoSaldo={126_922.87}
          onInicio={() => undefined}
        />
      </TransferWizardChrome>
    ),
  },
  {
    clave: 'pagos',
    nombre: 'Pagos · tipos',
    render: () => <PagosDeMuestra />,
  },
  {
    clave: 'rango',
    nombre: 'Selector de período',
    // Abierta de entrada: la hoja normalmente se llega tocando la píldora
    // «Personalizado», y con el navegador en modo headless no hay quien toque.
    render: () => <SelectorDePeriodoAbierto />,
  },
];

/**
 * El asistente de transferencias con cuentas y beneficiarios sintéticos.
 *
 * Arranca en el selector de tipo. En el navegador el dispositivo no puede
 * firmar, así que al confirmar se abre la hoja del segundo factor, que es el
 * camino de un teléfono sin enrolar.
 */
function TransferenciasDeMuestra(): React.JSX.Element {
  const repositorio = useMemo(() => transferenciasSimuladas(), []);
  const segundoFactor = useMemo(() => segundoFactorSimulado(), []);
  const vinculo = useMemo(
    () => vinculoSimulado() as unknown as DeviceBindingService,
    [],
  );

  const cargarCuentas = useMemo(
    () => async () =>
      agruparProductos(CUENTAS_DE_TRANSFERENCIA.map(parseProducto)).cuentas,
    [],
  );

  return (
    <TransfersScreen
      repositorio={repositorio}
      segundoFactor={segundoFactor}
      vinculoDeDispositivo={vinculo}
      cargarCuentas={cargarCuentas}
      customerCode="99001"
      ahora={() => HOY}
    />
  );
}

/** El asistente de pagos con tarjetas, un préstamo y cuentas sintéticas. */
function PagosDeMuestra(): React.JSX.Element {
  const repositorio = useMemo(() => pagosSimulados(), []);
  const segundoFactor = useMemo(() => segundoFactorSimulado(), []);
  const vinculo = useMemo(
    () => vinculoSimulado() as unknown as DeviceBindingService,
    [],
  );

  const cargarProductos = useMemo(
    () => async () => {
      const agrupados = agruparProductos(PRODUCTOS_A_PAGAR.map(parseProducto));
      const cuentas = agruparProductos(
        CUENTAS_DE_TRANSFERENCIA.map(parseProducto),
      ).cuentas;

      return {
        tarjetas: agrupados.tarjetas,
        prestamos: agrupados.prestamos,
        cuentas,
      };
    },
    [],
  );

  return (
    <PaymentsScreen
      repositorio={repositorio}
      segundoFactor={segundoFactor}
      vinculoDeDispositivo={vinculo}
      cargarProductos={cargarProductos}
      cotizar={async () => ({ montoConvertido: 1_785, tasa: '59.5000' })}
      customerCode="99001"
      ahora={() => HOY}
    />
  );
}

/** La hoja de alta, abierta en su primer paso. */
function AltaDeBeneficiarioAbierta(): React.JSX.Element {
  const [catalogos, setCatalogos] = useState<CatalogosDeBeneficiario>(
    CATALOGOS_VACIOS,
  );
  const repositorio = useMemo(() => beneficiariosSimulados(), []);
  const segundoFactor = useMemo(() => segundoFactorSimulado(), []);

  useEffect(() => {
    void repositorio.obtenerCatalogos().then(setCatalogos);
  }, [repositorio]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      <AddBeneficiarySheet
        visible
        catalogos={catalogos}
        repositorio={repositorio}
        segundoFactor={segundoFactor}
        onCerrar={() => undefined}
      />
    </View>
  );
}

/** La hoja de rango, ya abierta, para poder compararla contra la de Flutter. */
function SelectorDePeriodoAbierto(): React.JSX.Element {
  const [rango, setRango] = useState<DateRange>(() => lastDaysRange(30, HOY));

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      <BscDateRangeSheet
        visible
        initialRange={rango}
        today={HOY}
        title="Período de movimientos"
        onClose={() => undefined}
        onApply={setRango}
      />
    </View>
  );
}

/** Pantalla pedida por la URL, para poder capturarla sin tocar nada. */
function pantallaDeLaUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('pantalla');
}

/**
 * `?solo=1` esconde el panel lateral y deja la pantalla sola, a 360 puntos.
 *
 * Hace falta para las hojas modales: en web se dibujan fuera del marco, a lo
 * ancho del documento, y con el panel al lado el documento mide más de 360, así
 * que la hoja sale más ancha que el teléfono y las medidas dejan de ser
 * comparables. Sin panel, la captura coincide con lo que se ve en el Pixel.
 */
function soloLaPantalla(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('solo') === '1';
}

export function Preview(): React.JSX.Element {
  const [activa, setActiva] = useState(
    () => pantallaDeLaUrl() ?? PANTALLAS[0]?.clave ?? '',
  );
  const [vacia, setVacia] = useState(false);
  const [lenta, setLenta] = useState(false);

  const pantalla = PANTALLAS.find((p) => p.clave === activa) ?? PANTALLAS[0];
  // La cuenta con sobregiro es la única que necesita otra respuesta del core.
  const repositorio = repositorioSimulado({
    vacia,
    lenta,
    conSobregiro: activa === 'cuenta-sobregiro',
    producto:
      activa === 'prestamo'
        ? 'prestamo'
        : activa === 'certificado'
          ? 'certificado'
          : activa.startsWith('tarjeta')
            ? 'tarjeta'
            : 'cuenta',
    tarjetaDeContado: activa === 'tarjeta-contado',
  });
  const solo = soloLaPantalla();

  const escenario = (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 360, height: 800 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <MarcoDeTelefono desnudo={solo}>
        <View style={{ flex: 1 }} key={`${activa}-${String(vacia)}`}>
          {pantalla?.render(repositorio)}
        </View>
      </MarcoDeTelefono>
    </SafeAreaProvider>
  );

  if (solo) return escenario;

  return (
    <div style={estilos.pagina}>
      <aside style={estilos.panel}>
        <h1 style={estilos.titulo}>BSC Móvil · vista previa</h1>
        <p style={estilos.nota}>
          Solo para comparar el diseño. Datos sintéticos, sin backend.
        </p>

        <nav style={estilos.lista}>
          {PANTALLAS.map((p) => (
            <button
              key={p.clave}
              onClick={() => {
                setActiva(p.clave);
                // La pantalla queda en la URL para poder volver a esta misma
                // captura, que es como se comparan dos versiones.
                const url = new URL(window.location.href);
                url.searchParams.set('pantalla', p.clave);
                window.history.replaceState(null, '', url);
              }}
              style={{
                ...estilos.boton,
                ...(p.clave === activa ? estilos.botonActivo : null),
              }}
            >
              {p.nombre}
            </button>
          ))}
        </nav>

        <div style={estilos.opciones}>
          <label style={estilos.opcion}>
            <input
              type="checkbox"
              checked={vacia}
              onChange={(e) => setVacia(e.target.checked)}
            />
            Período sin movimientos
          </label>
          <label style={estilos.opcion}>
            <input
              type="checkbox"
              checked={lenta}
              onChange={(e) => setLenta(e.target.checked)}
            />
            Respuesta lenta (ver el cargando)
          </label>
        </div>
      </aside>

      <main style={estilos.escenario}>{escenario}</main>
    </div>
  );
}

const estilos: Record<string, React.CSSProperties> = {
  pagina: {
    display: 'flex',
    height: '100%',
    gap: 24,
  },
  panel: {
    width: 280,
    flexShrink: 0,
    padding: 20,
    background: '#ffffff',
    borderRight: '1px solid #e4e9f2',
    overflowY: 'auto',
  },
  titulo: {
    fontSize: 15,
    fontWeight: 700,
    color: '#0f2033',
    margin: '0 0 4px',
  },
  nota: {
    fontSize: 12,
    color: '#64748b',
    margin: '0 0 16px',
    lineHeight: 1.4,
  },
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  boton: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: 13,
    borderRadius: 10,
    border: '1px solid #e4e9f2',
    background: '#f7f9fc',
    color: '#64748b',
    cursor: 'pointer',
  },
  botonActivo: {
    background: '#0b3b8c',
    borderColor: '#0b3b8c',
    color: '#ffffff',
    fontWeight: 600,
  },
  opciones: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  opcion: {
    fontSize: 12.5,
    color: '#0f2033',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  escenario: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    overflow: 'auto',
  },
};
