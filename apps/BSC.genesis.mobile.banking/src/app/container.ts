import type { AxiosInstance } from 'axios';

import { createApiClient } from '../core/network/apiClient';
import { SecureStorage } from '../core/security/secureStorage';
import { SessionPolicyRepository } from '../core/security/politicaDeSesion';
import { SessionManager } from '../core/security/sessionManager';
import { AuthRepository } from '../features/auth/data/authRepository';
import { BeneficiaryRepository } from '../features/beneficiaries/data/beneficiaryRepository';
import { DeviceRepository } from '../features/deviceBinding/data/deviceRepository';
import { DeviceBindingService } from '../features/deviceBinding/domain/deviceBindingService';
import { CustomerRepository } from '../features/customer/data/customerRepository';
import { ExchangeRateRepository } from '../features/exchangeRates/data/exchangeRateRepository';
import { TaxReceiptRepository } from '../features/taxReceipts/data/taxReceiptRepository';
import { PaymentRepository } from '../features/payments/data/paymentRepository';
import { TransferRepository } from '../features/transfers/data/transferRepository';
import { TwoFactorRepository } from '../features/twoFactor/data/twoFactorRepository';

/**
 * Composición de dependencias.
 *
 * Reemplaza a `injection.dart` y a GetIt. Es una función y no un contenedor
 * porque el grafo de esta app es pequeño y explícito: quien lea este archivo ve
 * de una vez qué depende de qué, sin tener que rastrear registros dispersos.
 *
 * Se construye **una sola vez** al arrancar. Volver a construirlo crearía un
 * gestor de sesión nuevo con sus propios temporizadores, y el anterior seguiría
 * corriendo: la sesión expiraría dos veces, o ninguna.
 */

export interface Container {
  http: AxiosInstance;
  storage: SecureStorage;
  session: SessionManager;
  /**
   * La política de inactividad que publica el banco.
   *
   * Vive aquí y no dentro del gestor de sesión porque el gestor no habla con la
   * red: el original también los separa en `SessionManager` y
   * `SessionPolicyService`.
   */
  sessionPolicy: SessionPolicyRepository;
  auth: AuthRepository;
  /**
   * Perfil del titular, con caché de sesión.
   *
   * Vive en el contenedor y no en cada pantalla justamente para que la caché
   * sirva de algo: el perfil, la pantalla del oficial y —cuando se resuelva el
   * saludo del dashboard— la cabecera de inicio leen todos el mismo objeto.
   */
  customer: CustomerRepository;
  /** Beneficiarios y sus catálogos, con caché de sesión para los catálogos. */
  beneficiaries: BeneficiaryRepository;
  /**
   * Segundo factor.
   *
   * Vive aquí desde la oleada 4 aunque su interfaz sea de la 7: el alta de un
   * beneficiario y toda operación que mueva dinero necesitan pedir y verificar
   * un código, y sin esto quedarían a medias.
   */
  twoFactor: TwoFactorRepository;
  /** Cotización, comisiones y ejecución de una transferencia. */
  transfers: TransferRepository;
  /**
   * Convierte la firma del hardware en una autorización.
   *
   * Es la pieza que hace que la llave del StrongBox de la oleada 0 sirva
   * para mover dinero: sin esto, toda operación pediría código.
   */
  deviceBinding: DeviceBindingService;
  /** Pago de tarjeta de crédito y de cuota de préstamo. */
  payments: PaymentRepository;
  /**
   * Tasas de compra y venta del día.
   *
   * ⚠️ El backend filtra a dólar y euro, así que la pantalla nunca verá otra
   * moneda aunque el core las mande.
   */
  exchangeRates: ExchangeRateRepository;
  /** Comprobantes fiscales (NCF) emitidos sobre las cuentas. */
  taxReceipts: TaxReceiptRepository;
}

export interface ContainerOptions {
  /**
   * URL del backend. Se inyecta en la compilación y no tiene valor por defecto:
   * la app Flutter traía una dirección interna del banco escrita en el código.
   */
  baseURL: string;

  /** Se invoca cuando la sesión se pierde y hay que volver al acceso. */
  onSessionExpired: () => void;
}

export function createContainer(opciones: ContainerOptions): Container {
  const storage = new SecureStorage();

  const session = new SessionManager(storage);

  const http = createApiClient({
    baseURL: opciones.baseURL,
    store: storage,
    // El interceptor avisa cuando el token no se pudo renovar; el gestor de
    // sesión avisa cuando el cliente estuvo inactivo. Los dos terminan en el
    // mismo sitio, y por eso comparten la misma devolución de llamada.
    onSessionExpired: () => {
      void session.clearSession();
      opciones.onSessionExpired();
    },
  });

  return {
    http,
    storage,
    session,
    sessionPolicy: new SessionPolicyRepository(http),
    auth: new AuthRepository(http, storage),
    customer: new CustomerRepository(http),
    beneficiaries: new BeneficiaryRepository(http),
    twoFactor: new TwoFactorRepository(http),
    transfers: new TransferRepository(http),
    deviceBinding: new DeviceBindingService(
      new DeviceRepository(http),
      storage,
    ),
    payments: new PaymentRepository(http),
    exchangeRates: new ExchangeRateRepository(http),
    taxReceipts: new TaxReceiptRepository(http),
  };
}
