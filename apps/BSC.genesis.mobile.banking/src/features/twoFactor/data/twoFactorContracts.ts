import {
  comoLista,
  comoObjeto,
  esVerdadero,
  leerSobreApi,
  texto,
  textoOpcional,
} from '../../../core/network/envelopes';

/**
 * Contratos de `/two-factor/*`.
 *
 * Portado de `two_factor.dart` y `two_factor_repository.dart`. Se migra en la
 * oleada 4 y no en la 7, que es la suya, porque **el alta de un beneficiario no
 * se puede terminar sin un código**: sin esto la oleada 4 llegaría hasta crear
 * un beneficiario pendiente que nadie puede activar. La oleada 7 es la interfaz
 * sobre esto —pantalla de seguridad, mis dispositivos, token suave—, no el
 * canal en sí.
 *
 * Los tres endpoints responden con `ApiResponse<T>`, y `verify-token` contesta
 * **HTTP 400 con el motivo** cuando el código es incorrecto, incluyendo los
 * intentos que quedan. Ese texto se enseña tal cual: los intentos restantes le
 * importan al cliente mucho más que un «código incorrecto» genérico.
 */

// ─── Métodos ────────────────────────────────────────────────────────────────

export interface MetodoDeSegundoFactor {
  id: string;
  /** El backend manda la palabra —`AppToken`, `SMS`, `Email`—; antes, números. */
  tipo: string;
  nombre: string;
  habilitado: boolean;
  principal: boolean;
  /** Ya viene enmascarado por el backend: `***-***-0274`. */
  contactoEnmascarado: string | undefined;
}

export function esTokenDeApp(metodo: MetodoDeSegundoFactor): boolean {
  const tipo = metodo.tipo.toUpperCase();
  return tipo === 'APPTOKEN' || tipo === '3';
}

export function esSms(metodo: MetodoDeSegundoFactor): boolean {
  const tipo = metodo.tipo.toUpperCase();
  return tipo === 'SMS' || tipo === '1';
}

export function esCorreo(metodo: MetodoDeSegundoFactor): boolean {
  const tipo = metodo.tipo.toUpperCase();
  return tipo === 'EMAIL' || tipo === '2';
}

/**
 * Solo devuelve los métodos habilitados.
 *
 * Ofrecer un canal apagado manda al cliente a esperar un código que nunca va a
 * llegar, y el original ya lo filtra aquí y no en la pantalla.
 */
export function parseMetodos(cuerpo: unknown): MetodoDeSegundoFactor[] {
  return comoLista(leerSobreApi(cuerpo).datos)
    .map(crudo => ({
      id: texto(crudo, 'Id', 'id', 'MethodId', 'methodId'),
      tipo: texto(crudo, 'MethodType', 'methodType', 'Type', 'type'),
      nombre: texto(crudo, 'MethodName', 'methodName', 'Name', 'name'),
      // Ausente se interpreta como habilitado: el backend solo manda el campo
      // cuando está apagado, y esconder todos los métodos dejaría al cliente
      // sin poder autorizar nada.
      habilitado:
        crudo.IsEnabled === undefined && crudo.isEnabled === undefined
          ? true
          : esVerdadero(crudo.IsEnabled ?? crudo.isEnabled),
      principal: esVerdadero(crudo.IsPrimary ?? crudo.isPrimary),
      contactoEnmascarado: textoOpcional(
        crudo,
        'MaskedContact',
        'maskedContact',
      ),
    }))
    .filter(metodo => metodo.id !== '' && metodo.habilitado);
}

/** El principal, o el primero si ninguno lo es. */
export function metodoPreferido(
  metodos: MetodoDeSegundoFactor[],
): MetodoDeSegundoFactor | null {
  return metodos.find(m => m.principal) ?? metodos[0] ?? null;
}

// ─── Envío del código ───────────────────────────────────────────────────────

export interface EnvioDeCodigo {
  enviado: boolean;
  mensaje: string;
  tipo: string | undefined;
  contactoEnmascarado: string | undefined;
}

export function parseEnvio(cuerpo: unknown): EnvioDeCodigo {
  const sobre = leerSobreApi(cuerpo);
  const interno = comoObjeto(sobre.datos);

  const interior = interno.Success ?? interno.success;

  return {
    enviado: esVerdadero(interior) || sobre.exito,
    mensaje:
      textoOpcional(interno, 'Message', 'message') ??
      sobre.mensaje ??
      'Código enviado.',
    tipo: textoOpcional(interno, 'MethodType', 'methodType'),
    contactoEnmascarado: textoOpcional(
      interno,
      'MaskedContact',
      'maskedContact',
    ),
  };
}

// ─── Verificación ───────────────────────────────────────────────────────────

export interface ResultadoDeVerificacion {
  valido: boolean;
  mensaje: string;
  /**
   * Autorización que emite el backend, **ligada a la operación verificada**.
   *
   * Viaja al ejecutar la transacción; el backend la consume una sola vez y
   * comprueba que la operación sea la misma que se autorizó. Es nula cuando la
   * verificación no fue contra una operación concreta —el alta de un
   * beneficiario, por ejemplo, que no mueve dinero—.
   */
  autorizacionId: string | undefined;
}

export function parseVerificacion(cuerpo: unknown): ResultadoDeVerificacion {
  const sobre = leerSobreApi(cuerpo);
  const interno = comoObjeto(sobre.datos);
  const sinContenido = Object.keys(interno).length === 0;

  const valido =
    esVerdadero(interno.IsValid ?? interno.isValid) ||
    (sobre.exito && sinContenido);

  return {
    valido,
    mensaje:
      textoOpcional(interno, 'Message', 'message') ??
      sobre.mensaje ??
      (valido ? 'Código verificado.' : 'Código incorrecto.'),
    autorizacionId:
      textoOpcional(interno, 'AuthorizationId', 'authorizationId') ??
      textoOpcional(comoObjeto(cuerpo), 'AuthorizationId', 'authorizationId'),
  };
}

// ─── Propósitos ─────────────────────────────────────────────────────────────

/** Lo que el código autoriza. Viaja al backend como `purpose`. */
export const PropositoDeSegundoFactor = {
  Transferencia: 'Transfer',
  PagoDeTarjeta: 'CreditCardPayment',
  PagoDePrestamo: 'LoanPayment',
  AltaDeBeneficiario: 'AddBeneficiary',
} as const;

export type Proposito =
  (typeof PropositoDeSegundoFactor)[keyof typeof PropositoDeSegundoFactor];
