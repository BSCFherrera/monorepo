import { useCallback, useMemo, useRef, useState } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import type { NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAppServices } from '../AppContext';
import { useAuthStore } from '../../features/auth/authStore';
import { AccountOfficerScreen } from '../../features/accountOfficer/ui/AccountOfficerScreen';
import { BeneficiariesScreen } from '../../features/beneficiaries/ui/BeneficiariesScreen';
import { MyDevicesScreen } from '../../features/deviceBinding/ui/MyDevicesScreen';
import { SecurityScreen } from '../../features/deviceBinding/ui/SecurityScreen';
import { SoftTokenScreen } from '../../features/deviceBinding/ui/SoftTokenScreen';
import {
  agruparProductos,
  parseRespuestaProductos,
  ProductCategory,
} from '../../features/dashboard/data/productContracts';
import { ExchangeRatesScreen } from '../../features/exchangeRates/ui/ExchangeRatesScreen';
import { TaxReceiptsScreen } from '../../features/taxReceipts/ui/TaxReceiptsScreen';
import { Endpoints } from '../../core/network/endpoints';
import { ProductDetailRepository } from '../../features/productDetail/data/productDetailRepository';
import { CreditCardDetailScreen } from '../../features/productDetail/ui/CreditCardDetailScreen';
import { ProductDetailScreen } from '../../features/productDetail/ui/ProductDetailScreen';

import { HomeTabs } from './HomeTabs';
import { parametrosDePagoDeTarjeta } from './parametrosDePago';
import { QuickActionsSheet, type DestinoRapido } from './QuickActionsSheet';
import type { RootStackParamList } from './routes';

/**
 * Apilado principal de la aplicación autenticada.
 *
 * El primer nivel es el contenedor con la barra inferior; todo lo demás se
 * **apila encima** a pantalla completa, que es lo que hace que el botón atrás de
 * Android funcione (P-21): antes no había pila, así que el sistema no tenía nada
 * a donde volver y cerraba la app desde el detalle de un producto.
 *
 * El contenedor de navegación se monta sin `linking`: la app Flutter no declara
 * ningún `intent-filter` de navegación y habilitar enlaces profundos exige antes
 * una especificación de validación de enlaces (T-09). Un navegador con enlaces
 * abiertos en una banca es superficie de ataque, no una comodidad.
 */

const Stack = createNativeStackNavigator<RootStackParamList>();

type DetalleProps = NativeStackScreenProps<
  RootStackParamList,
  'DetalleDeProducto'
>;

function PantallaDetalle({
  route,
  navigation,
}: DetalleProps): React.JSX.Element {
  const { contenedor, registrarActividad } = useAppServices();

  const repositorio = useMemo(
    () => new ProductDetailRepository(contenedor.http),
    [contenedor],
  );

  const {
    numeroDeProducto,
    tipoDeProducto,
    codigoMoneda,
    saldoInicial,
    numeroEnmascarado,
  } = route.params;

  /*
    La tarjeta de crédito **no entra por `ProductDetailScreen`**. Tiene
    arquitectura propia en el original —dos ciclos a la vez, pestañas, cuatro
    hojas de acción y su estado de cuenta— y forzarla dentro de la pantalla
    común habría obligado a llenarla de condicionales por tipo de producto.
  */
  if (tipoDeProducto === ProductCategory.CreditCard) {
    return (
      <CreditCardDetailScreen
        repositorio={repositorio}
        numeroDeTarjeta={numeroDeProducto}
        numeroEnmascarado={numeroEnmascarado}
        onBack={() => navigation.goBack()}
        onActivity={registrarActividad}
        /*
          El original va a `/payments` con el tipo, **el producto y la moneda**
          en la dirección, y los tres importan: sin el producto el asistente
          parte de la primera tarjeta del cliente, y sin la moneda parte en
          pesos aunque el cliente tuviera el ciclo en dólares delante. Se
          componen en `parametrosDePagoDeTarjeta`, que es donde la prueba de
          regresión los fija contra el Dart.
        */
        onPagar={opciones =>
          navigation.navigate('Inicio', {
            screen: 'PagosTab',
            params: parametrosDePagoDeTarjeta(opciones),
          })
        }
      />
    );
  }

  return (
    <ProductDetailScreen
      repositorio={repositorio}
      numeroDeProducto={numeroDeProducto}
      tipoDeProducto={tipoDeProducto}
      codigoMoneda={codigoMoneda}
      saldoInicial={saldoInicial}
      numeroEnmascarado={numeroEnmascarado}
      onBack={() => navigation.goBack()}
      onActivity={registrarActividad}
      /*
        Las acciones de la cabecera llevan a pantallas de oleadas posteriores.
        Las que ya tienen ruta se conectan; las que no, la propia pantalla las
        resuelve con el aviso de «estará disponible próximamente» que escribe
        el original.
      */
      onTransferir={() =>
        navigation.navigate('Inicio', { screen: 'TransferirTab' })
      }
      onPagar={() =>
        navigation.navigate('Inicio', {
          screen: 'PagosTab',
          params: {
            tipo:
              tipoDeProducto === ProductCategory.Loan ? 'prestamo' : 'tarjeta',
          },
        })
      }
      onOficialDeCuenta={() => navigation.navigate('OficialDeCuenta')}
    />
  );
}

type OficialProps = NativeStackScreenProps<
  RootStackParamList,
  'OficialDeCuenta'
>;

function PantallaOficial({ navigation }: OficialProps): React.JSX.Element {
  const { contenedor, registrarActividad } = useAppServices();
  const usuario = useAuthStore(s => s.usuario);

  return (
    <AccountOfficerScreen
      repositorio={contenedor.customer}
      customerCode={usuario?.customerCode ?? ''}
      onBack={() => navigation.goBack()}
      onActivity={registrarActividad}
    />
  );
}

type SeguridadProps = NativeStackScreenProps<RootStackParamList, 'Seguridad'>;

function PantallaSeguridad({ navigation }: SeguridadProps): React.JSX.Element {
  const { contenedor, registrarActividad } = useAppServices();

  /*
    La revocación ocurre en «Mis dispositivos», así que al volver aquí el
    estado pudo cambiar. Sin este contador, el cliente revoca su teléfono,
    pulsa atrás y Seguridad sigue enseñando el interruptor encendido.
  */
  const [foco, setFoco] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setFoco(anterior => anterior + 1);
    }, []),
  );

  return (
    <SecurityScreen
      vinculo={contenedor.deviceBinding}
      recargarEn={foco}
      onBack={() => navigation.goBack()}
      onMisDispositivos={() => navigation.navigate('MisDispositivos')}
      onTokenSuave={() => navigation.navigate('TokenSuave')}
      onActivity={registrarActividad}
    />
  );
}

type DispositivosProps = NativeStackScreenProps<
  RootStackParamList,
  'MisDispositivos'
>;

function PantallaMisDispositivos({
  navigation,
}: DispositivosProps): React.JSX.Element {
  const { contenedor, registrarActividad } = useAppServices();

  return (
    <MyDevicesScreen
      vinculo={contenedor.deviceBinding}
      onBack={() => navigation.goBack()}
      onActivity={registrarActividad}
    />
  );
}

type TokenProps = NativeStackScreenProps<RootStackParamList, 'TokenSuave'>;

function PantallaTokenSuave({ navigation }: TokenProps): React.JSX.Element {
  const { contenedor, registrarActividad } = useAppServices();

  return (
    <SoftTokenScreen
      segundoFactor={contenedor.twoFactor}
      almacenamiento={contenedor.storage}
      onBack={() => navigation.goBack()}
      onActivity={registrarActividad}
    />
  );
}

type TasasProps = NativeStackScreenProps<RootStackParamList, 'TasaDeCambio'>;

function PantallaTasaDeCambio({ navigation }: TasasProps): React.JSX.Element {
  const { contenedor, registrarActividad } = useAppServices();

  return (
    <ExchangeRatesScreen
      repositorio={contenedor.exchangeRates}
      onBack={() => navigation.goBack()}
      onActivity={registrarActividad}
    />
  );
}

type ComprobantesProps = NativeStackScreenProps<
  RootStackParamList,
  'ComprobantesFiscales'
>;

function PantallaComprobantes({
  navigation,
}: ComprobantesProps): React.JSX.Element {
  const { contenedor, registrarActividad } = useAppServices();
  const usuario = useAuthStore(s => s.usuario);

  /*
    Las cuentas salen del mismo endpoint que alimenta el dashboard. El original
    las lee del bloc que ya está en memoria; aquí se piden otra vez porque esta
    pantalla se abre desde la hoja de acciones y puede no haber pasado por el
    inicio. Es una llamada más a cambio de que la pantalla no dependa de que
    otra se haya montado antes.
  */
  const cargarCuentas = useCallback(async () => {
    const respuesta = await contenedor.http.post(Endpoints.products, {
      productType: '',
    });

    const datos = parseRespuestaProductos(respuesta.data);
    if (datos.codigoResultado !== 0) {
      throw new Error(datos.mensaje ?? 'No pudimos cargar tus productos.');
    }

    return agruparProductos(datos.productos).cuentas;
  }, [contenedor]);

  return (
    <TaxReceiptsScreen
      repositorio={contenedor.taxReceipts}
      cargarCuentas={cargarCuentas}
      customerCode={usuario?.customerCode ?? ''}
      onBack={() => navigation.goBack()}
      onActivity={registrarActividad}
    />
  );
}

type BeneficiariosProps = NativeStackScreenProps<
  RootStackParamList,
  'Beneficiarios'
>;

function PantallaBeneficiarios({
  navigation,
}: BeneficiariosProps): React.JSX.Element {
  const { contenedor, registrarActividad } = useAppServices();

  return (
    <BeneficiariesScreen
      repositorio={contenedor.beneficiaries}
      segundoFactor={contenedor.twoFactor}
      onBack={() => navigation.goBack()}
      onActivity={registrarActividad}
      /*
        El original va a `/transfers?beneficiary=…&btype=…`. Ahora que la
        oleada 5 existe, el beneficiario viaja con él: el asistente entra
        directo a su flujo y llega con el destino puesto, en vez de pedirle al
        cliente que vuelva a buscar el mismo nombre en una segunda lista.
      */
      onTransferir={beneficiario =>
        navigation.navigate('Inicio', {
          screen: 'TransferirTab',
          params: { beneficiarioId: beneficiario.id, tipo: beneficiario.tipo },
        })
      }
    />
  );
}

/*
  Ya no queda ninguna pantalla marcadora.

  `PENDIENTES` listaba las pantallas de la app Flutter que aún no se habían
  migrado, con su ruta y su botón atrás, para que ningún botón quedara muerto y
  para que se viera de un vistazo qué faltaba. Con las oleadas 7 y 8 cerradas la
  lista quedó vacía y se retira junto con `PantallaPendiente`. La prueba de
  paridad de rutas es la que sigue vigilando que no falte ninguna.
*/

export function RootNavigator(): React.JSX.Element {
  const [hojaAbierta, setHojaAbierta] = useState(false);
  const navegacionRef =
    useRef<NavigationContainerRef<RootStackParamList> | null>(null);

  /**
   * Lleva cada acción de la hoja a su pantalla.
   *
   * Las tres primeras son pestañas y las demás se apilan: la hoja se cierra
   * antes de navegar para que al volver no reaparezca encima.
   */
  const irA = useCallback((destino: DestinoRapido): void => {
    setHojaAbierta(false);

    const navegacion = navegacionRef.current;
    if (navegacion === null) return;

    switch (destino) {
      case 'transferir':
        navegacion.navigate('Inicio', { screen: 'TransferirTab' });
        break;
      // Tarjeta y préstamo comparten pantalla: es la misma de pagos con otro
      // tipo de producto, y ahora el tipo viaja con la navegación.
      case 'pagar-tarjeta':
        navegacion.navigate('Inicio', {
          screen: 'PagosTab',
          params: { tipo: 'tarjeta' },
        });
        break;
      case 'pagar-prestamo':
        navegacion.navigate('Inicio', {
          screen: 'PagosTab',
          params: { tipo: 'prestamo' },
        });
        break;
      case 'beneficiarios':
        navegacion.navigate('Beneficiarios');
        break;
      case 'tasa-de-cambio':
        navegacion.navigate('TasaDeCambio');
        break;
      case 'comprobantes-fiscales':
        navegacion.navigate('ComprobantesFiscales');
        break;
      case 'oficial-de-cuenta':
        navegacion.navigate('OficialDeCuenta');
        break;
    }
  }, []);

  return (
    <NavigationContainer ref={navegacionRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio">
          {() => <HomeTabs onAccionCentral={() => setHojaAbierta(true)} />}
        </Stack.Screen>

        <Stack.Screen name="DetalleDeProducto" component={PantallaDetalle} />

        <Stack.Screen name="OficialDeCuenta" component={PantallaOficial} />

        <Stack.Screen name="Beneficiarios" component={PantallaBeneficiarios} />

        <Stack.Screen name="Seguridad" component={PantallaSeguridad} />

        <Stack.Screen
          name="MisDispositivos"
          component={PantallaMisDispositivos}
        />

        <Stack.Screen name="TokenSuave" component={PantallaTokenSuave} />

        <Stack.Screen name="TasaDeCambio" component={PantallaTasaDeCambio} />

        <Stack.Screen
          name="ComprobantesFiscales"
          component={PantallaComprobantes}
        />
      </Stack.Navigator>

      <QuickActionsSheet
        visible={hojaAbierta}
        onCerrar={() => setHojaAbierta(false)}
        onElegir={irA}
      />
    </NavigationContainer>
  );
}
