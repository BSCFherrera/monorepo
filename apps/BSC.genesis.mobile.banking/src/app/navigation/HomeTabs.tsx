import { useCallback, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type {
  BottomTabBarProps,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppServices } from '../AppContext';
import { appConfig } from '../config';
import { versionConCompilacion } from '../../features/deviceBinding/domain/deviceDescription';
import { useAuthStore } from '../../features/auth/authStore';
import {
  BscBottomNav,
  type DestinoNav,
} from '../../features/dashboard/ui/BscBottomNav';
import { DashboardScreen } from '../../features/dashboard/ui/DashboardScreen';
import { ProfileScreen } from '../../features/profile/ui/ProfileScreen';
import {
  agruparProductos,
  parseRespuestaProductos,
} from '../../features/dashboard/data/productContracts';
import { Endpoints } from '../../core/network/endpoints';
import { ProductDetailRepository } from '../../features/productDetail/data/productDetailRepository';
import { TransfersScreen } from '../../features/transfers/ui/TransfersScreen';
import { PaymentsScreen } from '../../features/payments/ui/PaymentsScreen';
import { TipoDePago } from '../../features/payments/data/paymentContracts';
import { parseCotizacion } from '../../features/transfers/data/transferContracts';

import type { RootStackParamList, TabParamList } from './routes';

/**
 * Contenedor con la barra inferior.
 *
 * Equivale al `ShellRoute` de `routes.dart`: cuatro destinos que comparten la
 * barra, y las pantallas de detalle apiladas **fuera** de él, para que el
 * detalle ocupe la pantalla completa como en el original.
 *
 * La barra se dibuja con el componente propio, no con la de la librería: el
 * diamante central elevado no es un quinto destino y ninguna barra de pestañas
 * estándar sabe dibujarlo.
 *
 * Las transiciones entre pestañas van apagadas, igual que los `NoTransitionPage`
 * del original: las pestañas de una banca cambian de golpe, no se deslizan.
 */

const Tabs = createBottomTabNavigator<TabParamList>();

/** Correspondencia entre los destinos de la barra y las rutas de las pestañas. */
const DESTINO_A_RUTA: Readonly<Record<DestinoNav, keyof TabParamList>> = {
  inicio: 'InicioTab',
  transferir: 'TransferirTab',
  pagos: 'PagosTab',
  perfil: 'PerfilTab',
};

const RUTA_A_DESTINO: Readonly<Record<keyof TabParamList, DestinoNav>> = {
  InicioTab: 'inicio',
  TransferirTab: 'transferir',
  PagosTab: 'pagos',
  PerfilTab: 'perfil',
};

const RUTAS: readonly (keyof TabParamList)[] = [
  'InicioTab',
  'TransferirTab',
  'PagosTab',
  'PerfilTab',
];

function BarraInferior({
  state,
  navigation,
  onAccionCentral,
}: BottomTabBarProps & { onAccionCentral: () => void }): React.JSX.Element {
  const rutaActual = RUTAS[state.index] ?? 'InicioTab';

  return (
    <BscBottomNav
      activo={RUTA_A_DESTINO[rutaActual]}
      onSelect={destino => {
        navigation.navigate(DESTINO_A_RUTA[destino]);
      }}
      onAccionCentral={onAccionCentral}
    />
  );
}

function PantallaInicio({ onMas }: { onMas: () => void }): React.JSX.Element {
  const { contenedor, cerrarSesion, registrarActividad } = useAppServices();
  const navegacion =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <DashboardScreen
      http={contenedor.http}
      onLogout={cerrarSesion}
      onActivity={registrarActividad}
      onSelectProduct={producto => {
        registrarActividad();
        navegacion.navigate('DetalleDeProducto', {
          numeroDeProducto: producto.identificacion,
          tipoDeProducto: producto.categoria,
          codigoMoneda: producto.codigoMoneda,
          saldoInicial:
            producto.saldoDisponible !== 0
              ? producto.saldoDisponible
              : producto.saldoActual,
          ...(producto.numeroEnmascarado !== undefined
            ? { numeroEnmascarado: producto.numeroEnmascarado }
            : {}),
        });
      }}
      onAccionRapida={clave => {
        switch (clave) {
          case 'transferir':
            navegacion.navigate('Inicio', { screen: 'TransferirTab' });
            break;
          case 'pagar-tarjeta':
            navegacion.navigate('Inicio', {
              screen: 'PagosTab',
              params: { tipo: 'tarjeta' },
            });
            break;
          case 'tasa':
            navegacion.navigate('TasaDeCambio');
            break;
          case 'mas':
            onMas();
            break;
        }
      }}
      onPerfil={() => {
        navegacion.navigate('Inicio', { screen: 'PerfilTab' });
      }}
    />
  );
}

function PantallaTransferir({
  route,
}: BottomTabScreenProps<TabParamList, 'TransferirTab'>): React.JSX.Element {
  const { contenedor, registrarActividad } = useAppServices();
  const usuario = useAuthStore(s => s.usuario);
  const customerCode = usuario?.customerCode ?? '';

  /*
    Las cuentas se piden aquí y no se comparten con el dashboard a propósito:
    el asistente necesita el saldo **del momento en que se va a transferir**, y
    uno cacheado de hace diez minutos le enseñaría al cliente un disponible que
    ya no existe justo antes de comprometerlo.
  */
  const cargarCuentas = useCallback(async () => {
    const respuesta = await contenedor.http.post(Endpoints.products, {
      productType: '',
    });

    const datos = parseRespuestaProductos(respuesta.data);

    // El core devuelve los fallos de negocio dentro de un HTTP 200, así que un
    // código distinto de cero es un error aunque la petición fuera bien.
    if (datos.codigoResultado !== 0) {
      throw new Error(datos.mensaje ?? 'No pudimos cargar tus cuentas.');
    }

    return agruparProductos(datos.productos).cuentas;
  }, [contenedor]);

  return (
    <TransfersScreen
      repositorio={contenedor.transfers}
      segundoFactor={contenedor.twoFactor}
      vinculoDeDispositivo={contenedor.deviceBinding}
      cargarCuentas={cargarCuentas}
      customerCode={customerCode}
      beneficiarioInicial={
        route.params === undefined
          ? undefined
          : { id: route.params.beneficiarioId, tipo: route.params.tipo }
      }
      onActivity={registrarActividad}
    />
  );
}

function PantallaPagos({
  route,
}: BottomTabScreenProps<TabParamList, 'PagosTab'>): React.JSX.Element {
  const { contenedor, registrarActividad } = useAppServices();
  const usuario = useAuthStore(s => s.usuario);
  const customerCode = usuario?.customerCode ?? '';

  const cargarProductos = useCallback(async () => {
    const respuesta = await contenedor.http.post(Endpoints.products, {
      productType: '',
    });

    const datos = parseRespuestaProductos(respuesta.data);
    if (datos.codigoResultado !== 0) {
      throw new Error(datos.mensaje ?? 'No pudimos cargar tus productos.');
    }

    const agrupados = agruparProductos(datos.productos);
    return {
      tarjetas: agrupados.tarjetas,
      prestamos: agrupados.prestamos,
      cuentas: agrupados.cuentas,
    };
  }, [contenedor]);

  /*
    **D-26**: el pago mínimo del listado de productos llega cambiado de moneda
    y el del detalle es el coherente, así que el asistente pide el detalle de
    la tarjeta que se va a pagar. Es el mismo repositorio que usa la pantalla
    de detalle de tarjeta; no se añade endpoint ni dependencia.
  */
  const cargarDetalleDeTarjeta = useCallback(
    (numeroDeTarjeta: string) =>
      new ProductDetailRepository(contenedor.http).obtenerDetalleDeTarjeta({
        numeroDeTarjeta,
      }),
    [contenedor],
  );

  /*
    La cotización comparte endpoint con las transferencias, así que se reutiliza
    su contrato en vez de duplicarlo. En el original hay dos copias del mismo
    lector, una por feature, y ya divergieron.
  */
  const cotizar = useCallback(
    async (parametros: {
      monedaOrigen: number;
      monedaDestino: number;
      monto: number;
    }) => {
      const respuesta = await contenedor.http.get(Endpoints.exchangeRateQuote, {
        params: {
          sourceCurrency: parametros.monedaOrigen,
          destinationCurrency: parametros.monedaDestino,
          clientCode: Number.parseInt(customerCode, 10) || 0,
          amount: parametros.monto,
          requestNumber: 'N/A',
        },
      });
      return parseCotizacion(respuesta.data);
    },
    [contenedor, customerCode],
  );

  return (
    <PaymentsScreen
      repositorio={contenedor.payments}
      segundoFactor={contenedor.twoFactor}
      vinculoDeDispositivo={contenedor.deviceBinding}
      cargarProductos={cargarProductos}
      cargarDetalleDeTarjeta={cargarDetalleDeTarjeta}
      cotizar={cotizar}
      customerCode={customerCode}
      tipoInicial={
        route.params === undefined
          ? undefined
          : route.params.tipo === 'prestamo'
          ? TipoDePago.Prestamo
          : TipoDePago.Tarjeta
      }
      productoInicial={route.params?.producto}
      monedaInicial={route.params?.moneda}
      onActivity={registrarActividad}
    />
  );
}

function PantallaPerfil(): React.JSX.Element {
  const {
    contenedor,
    cerrarSesion,
    cerrarTodasLasSesiones,
    registrarActividad,
  } = useAppServices();
  const navegacion =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const usuario = useAuthStore(s => s.usuario);

  /*
    La versión sale del manifiesto, no de `package.json`: es la única forma de
    que el pie no pueda divergir de la compilación instalada, que es lo que
    soporte necesita al recibir un reporte. Se resuelve una vez al montar y
    arranca con el valor de la configuración para que el pie no parpadee.
  */
  const [version, setVersion] = useState(appConfig.version);

  useEffect(() => {
    let vigente = true;
    void versionConCompilacion().then(valor => {
      if (vigente) setVersion(valor);
    });
    return () => {
      vigente = false;
    };
  }, []);

  /*
    El perfil es una raíz de pestaña, así que **no lleva flecha de volver**: no
    hay a dónde. Las acciones que salen de aquí se apilan encima, fuera del
    contenedor de la barra inferior, para que ocupen la pantalla completa y el
    botón atrás de Android devuelva al perfil (P-21).
  */
  return (
    <ProfileScreen
      repositorio={contenedor.customer}
      customerCode={usuario?.customerCode ?? ''}
      usuario={usuario?.username ?? usuario?.email}
      version={version === '' ? undefined : version}
      onActivity={registrarActividad}
      onOficialDeCuenta={() => navegacion.navigate('OficialDeCuenta')}
      onSeguridad={() => navegacion.navigate('Seguridad')}
      onTasaDeCambio={() => navegacion.navigate('TasaDeCambio')}
      onBeneficiarios={() => navegacion.navigate('Beneficiarios')}
      onComprobantesFiscales={() => navegacion.navigate('ComprobantesFiscales')}
      onCerrarSesion={() => {
        void cerrarSesion();
      }}
      onCerrarTodasLasSesiones={() => {
        void cerrarTodasLasSesiones();
      }}
    />
  );
}

export function HomeTabs({
  onAccionCentral,
}: {
  onAccionCentral: () => void;
}): React.JSX.Element {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
      tabBar={props => (
        <BarraInferior {...props} onAccionCentral={onAccionCentral} />
      )}
    >
      {/* El botón «Más» abre la misma hoja que el diamante de la barra, que
            vive un nivel más arriba: por eso llega como función y no se
            resuelve aquí. */}
      <Tabs.Screen name="InicioTab">
        {() => <PantallaInicio onMas={onAccionCentral} />}
      </Tabs.Screen>
      <Tabs.Screen name="TransferirTab" component={PantallaTransferir} />
      <Tabs.Screen name="PagosTab" component={PantallaPagos} />
      <Tabs.Screen name="PerfilTab" component={PantallaPerfil} />
    </Tabs.Navigator>
  );
}
