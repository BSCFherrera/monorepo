/**
 * Redacción de datos personales y bancarios antes de registrar nada (T-14).
 *
 * **El problema que resuelve.** Una aplicación sin observabilidad no se puede
 * operar: cuando un cliente llama diciendo que su transferencia falló, alguien
 * tiene que poder mirar qué pasó. Pero el camino corto —registrar la petición y
 * la respuesta— convierte cada registro en un volcado de números de cuenta,
 * saldos, nombres y cédulas. En una banca eso no es un descuido menor: es una
 * fuga, y además sobrevive en los registros mucho más que en la pantalla.
 *
 * La regla de este módulo es que **lo que se registra se redacta primero, y la
 * redacción es lo predeterminado**. No hay una función que registre sin pasar
 * por aquí: si la hubiera, alguien la usaría con prisa un martes por la tarde.
 *
 * **Qué se conserva a propósito.** Los últimos cuatro dígitos de una cuenta y
 * el orden de magnitud de un monto. Sin nada de eso, un registro no sirve para
 * diagnosticar: «falló una transferencia» no se puede investigar, «falló una
 * transferencia de una cuenta ****3953 por un monto de cuatro cifras» sí.
 */

/** Claves cuyo valor no se registra nunca, ni redactado. */
const PROHIBIDAS = new Set([
  'password',
  'contrasena',
  'contraseña',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'signature',
  'firma',
  'publickey',
  'privatekey',
  'secret',
  'secreto',
  'base32secret',
  'sharedsecret',
  'pin',
  'cvv',
  'otp',
  'codigo',
  'code',
]);

/** Claves cuyo valor es una cuenta o un producto: se deja la cola. */
const CUENTAS = new Set([
  'accountnumber',
  'debitaccountnumber',
  'creditaccountnumber',
  'cardnumber',
  'loannumber',
  'productidentification',
  'identificacion',
  'cuentaorigen',
  'cuentadestino',
  'numerodecuenta',
  'deviceid',
]);

/** Claves cuyo valor es un monto: se deja el orden de magnitud. */
const MONTOS = new Set([
  'amount',
  'transactionamount',
  'paymentamount',
  'monto',
  'saldo',
  'balance',
  'saldoactual',
  'saldodisponible',
  'totaldebited',
]);

/** Claves con datos de la persona: se sustituyen enteras. */
const PERSONALES = new Set([
  'email',
  'correo',
  'phone',
  'telefono',
  'teléfono',
  'movil',
  'móvil',
  'fullname',
  'nombrecompleto',
  'customerfullname',
  'firstname',
  'lastname',
  'identificationnumber',
  'documentonumero',
  'cedula',
  'rnc',
]);

/**
 * Deja los últimos cuatro caracteres: `****3953`.
 *
 * Es lo que la propia aplicación le enseña al cliente, así que registrar eso no
 * añade exposición y sí permite cruzar un registro con lo que el cliente ve.
 */
export function colaDeCuenta(valor: string): string {
  const limpio = valor.trim();
  if (limpio.length <= 4) return '****';
  return `****${limpio.slice(-4)}`;
}

/**
 * El orden de magnitud de un monto, no el monto: `~10^4`.
 *
 * Permite distinguir un pago de mil pesos de uno de un millón —que es lo que
 * hace falta para investigar— sin dejar la cifra exacta en un registro.
 */
export function magnitudDeMonto(valor: number): string {
  if (!Number.isFinite(valor)) return 'no numérico';
  const absoluto = Math.abs(valor);
  if (absoluto === 0) return '0';
  return `~10^${Math.floor(Math.log10(absoluto))}`;
}

/** Cómo se clasifica una clave. Se compara en minúsculas y sin guiones. */
function clasificar(
  clave: string,
): 'prohibida' | 'cuenta' | 'monto' | 'personal' | 'libre' {
  const normalizada = clave.toLowerCase().replace(/[_\-\s]/gu, '');

  if (PROHIBIDAS.has(normalizada)) return 'prohibida';
  if (CUENTAS.has(normalizada)) return 'cuenta';
  if (MONTOS.has(normalizada)) return 'monto';
  if (PERSONALES.has(normalizada)) return 'personal';

  /*
    Las claves que no están en ninguna lista se juzgan por su forma, no por su
    nombre. Es lo que atrapa el campo nuevo que el backend añadió el mes pasado
    y que nadie se acordó de clasificar — que es exactamente por donde se
    escapan estas cosas.
  */
  return 'libre';
}

/** Un valor suelto que parece un número de cuenta o de tarjeta. */
function pareceCuenta(valor: string): boolean {
  const soloDigitos = valor.replace(/\D/gu, '');
  return soloDigitos.length >= 9 && soloDigitos.length <= 19;
}

/** Un valor suelto que parece un correo. */
function pareceCorreo(valor: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/u.test(valor);
}

/**
 * Redacta cualquier estructura antes de registrarla.
 *
 * Recorre objetos y listas en profundidad. Un ciclo se marca en vez de colgar
 * el proceso: registrar no puede tumbar la aplicación.
 */
export function redactar(
  valor: unknown,
  vistos = new WeakSet<object>(),
): unknown {
  if (valor === null || valor === undefined) return valor;

  if (typeof valor === 'string') {
    if (pareceCorreo(valor)) return '[correo]';
    if (pareceCuenta(valor)) return colaDeCuenta(valor);
    return valor;
  }

  if (typeof valor === 'number' || typeof valor === 'boolean') return valor;

  if (Array.isArray(valor)) {
    if (vistos.has(valor)) return '[ciclo]';
    vistos.add(valor);
    return valor.map(elemento => redactar(elemento, vistos));
  }

  if (typeof valor === 'object') {
    if (vistos.has(valor)) return '[ciclo]';
    vistos.add(valor);

    const salida: Record<string, unknown> = {};

    for (const [clave, contenido] of Object.entries(
      valor as Record<string, unknown>,
    )) {
      switch (clasificar(clave)) {
        case 'prohibida':
          salida[clave] = '[omitido]';
          break;
        case 'cuenta':
          salida[clave] =
            typeof contenido === 'string'
              ? colaDeCuenta(contenido)
              : '[cuenta]';
          break;
        case 'monto':
          salida[clave] =
            typeof contenido === 'number'
              ? magnitudDeMonto(contenido)
              : '[monto]';
          break;
        case 'personal':
          salida[clave] = '[dato personal]';
          break;
        default:
          salida[clave] = redactar(contenido, vistos);
      }
    }

    return salida;
  }

  // Funciones y símbolos no se registran.
  return '[no registrable]';
}
