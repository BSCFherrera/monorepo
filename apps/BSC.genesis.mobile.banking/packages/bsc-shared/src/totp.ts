import { sha256Bytes, utf8Encode } from './sha256';

/**
 * Token de un solo uso basado en el tiempo (TOTP), RFC 6238.
 *
 * Es lo que la pantalla «Token para otros canales» enseña: un código de seis
 * dígitos que cambia cada treinta segundos y que el cliente teclea en la banca
 * en línea. Se calcula **en el teléfono, sin red**, a partir de un secreto que
 * el banco entrega una sola vez.
 *
 * Se escribe a mano, como el SHA-256 del que depende, y por las mismas razones:
 * React Native no trae `crypto.subtle`, esto vive en la ruta de un segundo
 * factor, y las alternativas de npm son dependencias en el sitio donde menos
 * conviene tenerlas. Son sesenta líneas contrastadas contra `node:crypto`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️ **Dos hallazgos sobre el original que hay que leer antes de usar esto.**
 *
 * **1. El backend no entrega el secreto.** `soft_token_screen.dart` lo lee del
 * campo `Base32Secret` de `/two-factor/soft-token/provision`, y ese campo **no
 * existe**: `TokenBscProvisionResponse` declara `Success`, `Message`,
 * `AlreadyProvisioned` y `Error`, y nada más. El controlador devuelve ese tipo,
 * así que aunque TokenBSC lo mandara, el gateway lo descartaría al
 * deserializar. La pantalla del original, por tanto, **siempre** cae en «No
 * pudimos preparar tu token». Escalado al banco.
 *
 * **2. El original no calcula un TOTP estándar.** Llama al paquete `otp` de
 * Dart con `isGoogle: false`, y en ese modo el paquete **no decodifica el
 * base32**: usa los bytes UTF-8 de la propia cadena y los repite hasta llenar
 * los 32 bytes del bloque. Un verificador estándar —el de TokenBSC, o cualquier
 * autenticador— rechazaría esos códigos. Aquí se implementa el estándar, que es
 * lo que el servidor que valida necesita, y el modo del original queda
 * disponible en `codigoTotpAlEstiloDelOriginal` para poder comparar si el banco
 * confirma que TokenBSC hace lo mismo.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** El periodo del original: el código cambia cada treinta segundos. */
export const PERIODO_TOTP = 30;

/** Seis dígitos, como el original y como todo autenticador. */
export const DIGITOS_TOTP = 6;

// ─── Base32 ──────────────────────────────────────────────────────────────────

const ALFABETO_BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decodifica base32 (RFC 4648, sin relleno obligatorio).
 *
 * Devuelve `null` en vez de lanzar cuando la cadena no es base32: un secreto
 * corrupto en el almacenamiento seguro debe hacer que la pantalla diga que no
 * pudo preparar el token, no que la aplicación se caiga enseñando una pila.
 */
export function decodificarBase32(texto: string): Uint8Array | null {
  const limpio = texto.replace(/=+$/u, '').replace(/\s+/gu, '').toUpperCase();
  if (limpio === '') return null;

  const salida: number[] = [];
  let acumulado = 0;
  let bits = 0;

  for (const caracter of limpio) {
    const valor = ALFABETO_BASE32.indexOf(caracter);
    if (valor === -1) return null;

    acumulado = (acumulado << 5) | valor;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      salida.push((acumulado >> bits) & 0xff);
    }
  }

  return salida.length === 0 ? null : Uint8Array.from(salida);
}

// ─── HMAC ────────────────────────────────────────────────────────────────────

/** Tamaño de bloque de SHA-256, en bytes. */
const BLOQUE = 64;

/** HMAC-SHA256, RFC 2104. */
export function hmacSha256(clave: Uint8Array, mensaje: Uint8Array): Uint8Array {
  // Una clave más larga que el bloque se sustituye por su digest; una más corta
  // se rellena con ceros. Saltarse cualquiera de los dos pasos produce un HMAC
  // que parece funcionar y no coincide con ningún otro.
  let normalizada = clave.length > BLOQUE ? sha256Bytes(clave) : clave;

  if (normalizada.length < BLOQUE) {
    const rellenada = new Uint8Array(BLOQUE);
    rellenada.set(normalizada);
    normalizada = rellenada;
  }

  const interno = new Uint8Array(BLOQUE);
  const externo = new Uint8Array(BLOQUE);

  for (let i = 0; i < BLOQUE; i += 1) {
    interno[i] = normalizada[i]! ^ 0x36;
    externo[i] = normalizada[i]! ^ 0x5c;
  }

  const primero = new Uint8Array(BLOQUE + mensaje.length);
  primero.set(interno);
  primero.set(mensaje, BLOQUE);

  const digestInterno = sha256Bytes(primero);

  const segundo = new Uint8Array(BLOQUE + digestInterno.length);
  segundo.set(externo);
  segundo.set(digestInterno, BLOQUE);

  return sha256Bytes(segundo);
}

// ─── TOTP ────────────────────────────────────────────────────────────────────

/** El contador de ocho bytes, big-endian, que RFC 4226 llama `C`. */
function contadorEnBytes(contador: number): Uint8Array {
  const bytes = new Uint8Array(8);
  let resto = contador;

  for (let i = 7; i >= 0; i -= 1) {
    bytes[i] = resto & 0xff;
    // División entera: el contador excede los 32 bits en los que funcionan los
    // operadores de bits de JavaScript, así que no se puede usar `>>>`.
    resto = Math.floor(resto / 256);
  }

  return bytes;
}

/**
 * La truncación dinámica de RFC 4226: convierte el digest en un número.
 *
 * Los cuatro últimos bits del digest eligen desde dónde se leen cuatro bytes, y
 * el bit más alto se descarta para que el resultado no dependa del signo.
 */
function truncar(digest: Uint8Array, digitos: number): string {
  const desplazamiento = digest[digest.length - 1]! & 0x0f;

  const binario =
    ((digest[desplazamiento]! & 0x7f) << 24) |
    ((digest[desplazamiento + 1]! & 0xff) << 16) |
    ((digest[desplazamiento + 2]! & 0xff) << 8) |
    (digest[desplazamiento + 3]! & 0xff);

  return String(binario % 10 ** digitos).padStart(digitos, '0');
}

/** El contador del intervalo actual, que es lo que se firma. */
export function contadorDeTiempo(
  ahoraEnMilisegundos: number,
  periodo: number = PERIODO_TOTP,
): number {
  return Math.floor(Math.floor(ahoraEnMilisegundos / 1000) / periodo);
}

/** Cuántos segundos quedan antes de que el código cambie. */
export function segundosRestantes(
  ahoraEnMilisegundos: number,
  periodo: number = PERIODO_TOTP,
): number {
  return periodo - (Math.floor(ahoraEnMilisegundos / 1000) % periodo);
}

/**
 * El código TOTP estándar (RFC 6238) con HMAC-SHA256.
 *
 * Devuelve `null` cuando el secreto no es base32 legible, para que la pantalla
 * pueda decirlo sin distinguir causas que al cliente no le sirven.
 */
export function codigoTotp(
  secretoBase32: string,
  ahoraEnMilisegundos: number,
  opciones: { periodo?: number; digitos?: number } = {},
): string | null {
  const periodo = opciones.periodo ?? PERIODO_TOTP;
  const digitos = opciones.digitos ?? DIGITOS_TOTP;

  const secreto = decodificarBase32(secretoBase32);
  if (secreto === null) return null;

  const digest = hmacSha256(
    secreto,
    contadorEnBytes(contadorDeTiempo(ahoraEnMilisegundos, periodo)),
  );

  return truncar(digest, digitos);
}

/**
 * El código tal como lo calcula la app Flutter, para poder compararlos.
 *
 * ⚠️ **No es TOTP estándar y no debe usarse sin que el banco confirme que
 * TokenBSC valida así.** El paquete `otp` de Dart, con `isGoogle: false`, toma
 * los bytes UTF-8 de la cadena base32 —sin decodificarla— y los repite hasta
 * llenar los treinta y dos bytes que pide SHA-256. Está aquí porque si TokenBSC
 * resultara compartir esa implementación, cambiar de una a otra es cambiar una
 * llamada, y porque documentar el hallazgo con código ejecutable vale más que
 * documentarlo con prosa.
 */
export function codigoTotpAlEstiloDelOriginal(
  secretoBase32: string,
  ahoraEnMilisegundos: number,
  opciones: { periodo?: number; digitos?: number } = {},
): string {
  const periodo = opciones.periodo ?? PERIODO_TOTP;
  const digitos = opciones.digitos ?? DIGITOS_TOTP;

  const digest = hmacSha256(
    repetirHasta(utf8Encode(secretoBase32), 32),
    contadorEnBytes(contadorDeTiempo(ahoraEnMilisegundos, periodo)),
  );

  return truncar(digest, digitos);
}

/** El `_padSecret` del paquete de Dart: repetir hasta la longitud pedida. */
function repetirHasta(bytes: Uint8Array, longitud: number): Uint8Array {
  if (bytes.length === 0 || bytes.length >= longitud) return bytes;

  const salida = new Uint8Array(longitud);
  for (let i = 0; i < longitud; i += 1) {
    salida[i] = bytes[i % bytes.length]!;
  }
  return salida;
}
