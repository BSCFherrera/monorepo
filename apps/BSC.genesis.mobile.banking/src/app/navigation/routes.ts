/**
 * Mapa de rutas de la aplicación.
 *
 * Calcado de `lib/app/routes.dart`, que usa GoRouter. Los nombres se conservan
 * —«/products/:id», «/security/devices»— aunque aquí no haya URLs, porque son
 * el vocabulario con el que el equipo ya habla de las pantallas y porque la
 * matriz de trazabilidad las referencia por ese nombre.
 *
 * La estructura del original tiene tres niveles y aquí se respeta:
 *
 *  1. **Acceso**, sin barra inferior.
 *  2. **Un contenedor con la barra inferior** y cuatro destinos dentro.
 *  3. **Pantallas de detalle**, que se apilan encima a pantalla completa y sin
 *     barra inferior.
 *
 * Perder el tercer nivel es lo que hacía que el botón atrás de Android cerrara
 * la app estando en el detalle de un producto.
 *
 * **Sin enlaces profundos**, igual que la app Flutter: su manifiesto no declara
 * ningún `intent-filter` de navegación. Habilitarlos exige antes una
 * especificación de validación de enlaces (T-09), así que el contenedor de
 * navegación se monta deliberadamente sin `linking`.
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

/** Parámetros de cada pantalla del apilado principal. */
export type RootStackParamList = {
  /**
   * Contenedor con la barra inferior.
   *
   * Acepta la pestaña a la que se quiere ir, para que una acción de la hoja
   * pueda llevar directo a «Transferir» en vez de dejar al cliente en inicio
   * con la sensación de que el toque no hizo nada.
   */
  Inicio: NavigatorScreenParams<TabParamList> | undefined;

  /**
   * Detalle de producto.
   *
   * Recibe el saldo que ya se conoce para pintar la cabecera de inmediato, en
   * vez de dejarla en blanco mientras carga: el cliente viene de tocar una fila
   * que mostraba ese número y verlo desaparecer se lee como un error.
   */
  DetalleDeProducto: {
    numeroDeProducto: string;
    tipoDeProducto: string;
    codigoMoneda: number;
    saldoInicial?: number;
    numeroEnmascarado?: string;
  };

  OficialDeCuenta: undefined;
  TasaDeCambio: undefined;
  Beneficiarios: undefined;
  Seguridad: undefined;
  MisDispositivos: undefined;
  TokenSuave: undefined;
  ComprobantesFiscales: undefined;
};

/** Los cuatro destinos de la barra inferior, en su orden. */
export type TabParamList = {
  InicioTab: undefined;

  /**
   * Transferencias.
   *
   * Acepta un beneficiario con el que arrancar. Llegando desde la lista de
   * beneficiarios el destino ya está decidido, y volver a preguntar el tipo de
   * transferencia solo sería una ocasión de equivocarse — es lo que dice el
   * propio comentario de `TransferType.fromBeneficiaryTypeCode` en el original.
   */
  TransferirTab: { beneficiarioId: string; tipo: number } | undefined;

  /**
   * Pagos.
   *
   * Acepta el tipo con el que arrancar. Llegando desde el detalle de una
   * tarjeta o de un préstamo el producto ya está decidido, y hacer que el
   * cliente vuelva a elegir «¿qué quieres pagar?» después de haber tocado
   * «Pagar» en su propia tarjeta es un paso que no aporta nada.
   */
  PagosTab:
    | {
        tipo: 'tarjeta' | 'prestamo';
        /**
         * El producto concreto que el cliente tocó, y el ciclo que tenía
         * elegido. Los dos viajan porque el original los lleva en la
         * dirección; sin ellos el asistente parte de la primera tarjeta del
         * cliente y en pesos, que no es lo que se pidió.
         */
        producto?: string;
        moneda?: 'DOP' | 'USD';
      }
    | undefined;

  PerfilTab: undefined;
};

/**
 * Correspondencia con las rutas de la app Flutter.
 *
 * No se usa para navegar: existe para que la matriz de trazabilidad pueda
 * comprobarse en código y no a ojo, y para que quien venga del proyecto Flutter
 * encuentre su ruta.
 */
export const RUTAS_FLUTTER: Readonly<
  Record<keyof RootStackParamList | keyof TabParamList, string>
> = {
  Inicio: '/home',
  InicioTab: '/home',
  TransferirTab: '/transfers',
  PagosTab: '/payments',
  PerfilTab: '/profile',
  DetalleDeProducto: '/products/:productId',
  OficialDeCuenta: '/account-officer',
  TasaDeCambio: '/exchange-rates',
  Beneficiarios: '/beneficiaries',
  Seguridad: '/security',
  MisDispositivos: '/security/devices',
  TokenSuave: '/security/token',
  ComprobantesFiscales: '/tax-receipts',
};

/**
 * Rutas del original que son un alias de otra pantalla.
 *
 * GoRouter declara `/accounts/:accountId` y `/products/:productId` con el
 * mismo constructor: son dos direcciones para el detalle de producto, herencia
 * de cuando las cuentas tenían pantalla propia. Aquí hay una sola pantalla, y
 * el alias se registra para que la comprobación de paridad no lo confunda con
 * una pantalla olvidada.
 */
export const ALIAS_FLUTTER: Readonly<Record<string, keyof RootStackParamList>> =
  {
    '/accounts/:accountId': 'DetalleDeProducto',
  };
