/**
 * SHA-256 en TypeScript puro, sin dependencias.
 *
 * Existe por tres razones concretas, no por gusto de reimplementar:
 *
 *  1. **React Native no tiene `crypto.subtle`.** El portal usa la Web Crypto
 *     del navegador, que en Hermes no existe. Una implementación compartida no
 *     puede depender de ella.
 *  2. **Está en la ruta de la firma de transacciones.** Una dependencia de npm
 *     comprometida aquí produciría huellas incorrectas — el mismo argumento por
 *     el que el módulo de llaves se escribió a mano en Kotlin.
 *  3. **`crypto.subtle` es asíncrono.** Obliga a que toda la cadena de cálculo
 *     de la huella sea asíncrona, lo que complica la lógica de las pantallas
 *     sin ganar nada: aquí el mensaje son decenas de bytes, no megabytes.
 *
 * Verificado contra los vectores compartidos por el backend en C# y la app
 * Flutter en Dart, que están en las pruebas de `operationFingerprint`.
 */

/** Constantes de ronda: raíces cúbicas de los primeros 64 primos. */
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

/**
 * Codifica a UTF-8 sin depender de `TextEncoder`.
 *
 * `TextEncoder` existe en Hermes reciente, pero no en todas las versiones que
 * el parque de dispositivos puede ejecutar, y un fallo aquí se manifestaría
 * como una huella que no coincide — el error más difícil de diagnosticar de
 * toda la cadena.
 */
function utf8Bytes(text: string): Uint8Array {
  const out: number[] = [];

  for (let i = 0; i < text.length; i += 1) {
    let codePoint = text.charCodeAt(i);

    // Par suplente: dos unidades UTF-16 que forman un solo carácter.
    if (codePoint >= 0xd800 && codePoint <= 0xdbff && i + 1 < text.length) {
      const low = text.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (low - 0xdc00);
        i += 1;
      }
    }

    // Suplente sin pareja: entrada mal formada. Se sustituye por U+FFFD, que es
    // lo que hacen `TextEncoder` y el UTF-8 de OpenSSL.
    //
    // No es un detalle cosmético: el portal codifica con `TextEncoder`, así que
    // emitir aquí el suplente crudo produciría una huella distinta para el mismo
    // dato y el backend rechazaría la transacción. Lo detectó la prueba que
    // contrasta contra OpenSSL.
    if (codePoint >= 0xd800 && codePoint <= 0xdfff) {
      codePoint = 0xfffd;
    }

    if (codePoint < 0x80) {
      out.push(codePoint);
    } else if (codePoint < 0x800) {
      out.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint < 0x10000) {
      out.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    } else {
      out.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }

  return Uint8Array.from(out);
}

function rotr(value: number, bits: number): number {
  return (value >>> bits) | (value << (32 - bits));
}

/**
 * Codifica a UTF-8. Se expone porque HMAC necesita los bytes de la clave.
 */
export function utf8Encode(text: string): Uint8Array {
  return utf8Bytes(text);
}

/** SHA-256 de una cadena, en hexadecimal minúscula de 64 caracteres. */
export function sha256Hex(message: string): string {
  return hexDe(sha256Bytes(utf8Bytes(message)));
}

/** El digest en hexadecimal minúscula. */
export function hexDe(bytes: Uint8Array): string {
  let salida = '';
  for (let i = 0; i < bytes.length; i += 1) {
    salida += bytes[i]!.toString(16).padStart(2, '0');
  }
  return salida;
}

/**
 * SHA-256 sobre bytes, devolviendo los 32 bytes del digest.
 *
 * Es la misma función que `sha256Hex` usa por dentro. Se expone aparte porque
 * **HMAC necesita encadenar dos digests sobre bytes**, y pasar por hexadecimal
 * entre uno y otro sería a la vez más lento y una fuente de errores de
 * conversión en la ruta de un segundo factor.
 */
export function sha256Bytes(bytes: Uint8Array): Uint8Array {
  const bitLength = bytes.length * 8;

  // Relleno: 0x80, ceros hasta dejar 8 bytes libres, y la longitud en bits
  // como entero de 64 bits big-endian.
  const paddedLength = (((bytes.length + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  // La longitud en bits cabe en 32 bits para cualquier mensaje realista aquí;
  // los 4 bytes altos quedan en cero, que es lo correcto.
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);

  // Estado inicial: raíces cuadradas de los primeros 8 primos.
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4, false);
    }

    for (let i = 16; i < 64; i += 1) {
      const a = w[i - 15]!;
      const b = w[i - 2]!;
      const s0 = rotr(a, 7) ^ rotr(a, 18) ^ (a >>> 3);
      const s1 = rotr(b, 17) ^ rotr(b, 19) ^ (b >>> 10);
      w[i] = (w[i - 16]! + s0 + w[i - 7]! + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i += 1) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + choice + K[i]! + w[i]!) >>> 0;
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + majority) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const digest = new Uint8Array(32);
  const salida = new DataView(digest.buffer);
  [h0, h1, h2, h3, h4, h5, h6, h7].forEach((valor, i) => {
    salida.setUint32(i * 4, valor >>> 0, false);
  });

  return digest;
}
