/**
 * Construcción del contenido que se firma con la llave del dispositivo.
 *
 * El backend recompone exactamente estos bytes para verificar la firma, así que
 * el orden y la codificación son contrato, no detalle de implementación: el
 * reto del servidor (`nonce`, en base64) seguido de la huella canónica de la
 * operación (hexadecimal, convertida a bytes).
 *
 * Portado de `DeviceKey.signChallenge` en `lib/core/security/device_key.dart`.
 *
 * Las conversiones están escritas a mano en vez de usar `Buffer` —que no existe
 * en React Native— o `atob`/`btoa` —que existen pero no aceptan bytes binarios
 * sin rodeos—. Son pocas líneas, se prueban por completo, y evitan una
 * dependencia más en la ruta de la firma.
 */

const BASE64_ALFABETO =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Índice inverso del alfabeto, para decodificar sin recorrer la cadena. */
const BASE64_INVERSO: Record<string, number> = {};
for (let i = 0; i < BASE64_ALFABETO.length; i += 1) {
  BASE64_INVERSO[BASE64_ALFABETO[i]!] = i;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let salida = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]!;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];

    salida += BASE64_ALFABETO[b0 >> 2];
    salida += BASE64_ALFABETO[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    salida +=
      b1 === undefined
        ? '='
        : BASE64_ALFABETO[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)];
    salida += b2 === undefined ? '=' : BASE64_ALFABETO[b2 & 0x3f];
  }

  return salida;
}

export function base64ToBytes(base64: string): Uint8Array {
  const limpio = base64.replace(/[\r\n\s]/g, '').replace(/=+$/, '');
  const bytes = new Uint8Array(Math.floor((limpio.length * 3) / 4));

  let acumulador = 0;
  let bitsAcumulados = 0;
  let escritos = 0;

  for (const caracter of limpio) {
    const valor = BASE64_INVERSO[caracter];
    if (valor === undefined) {
      throw new Error(`Base64 inválido: carácter «${caracter}»`);
    }

    acumulador = (acumulador << 6) | valor;
    bitsAcumulados += 6;

    if (bitsAcumulados >= 8) {
      bitsAcumulados -= 8;
      bytes[escritos] = (acumulador >> bitsAcumulados) & 0xff;
      escritos += 1;
    }
  }

  return bytes.subarray(0, escritos);
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error(
      'Una cadena hexadecimal debe tener un número par de caracteres',
    );
  }

  const bytes = new Uint8Array(hex.length / 2);

  for (let i = 0; i < bytes.length; i += 1) {
    const par = hex.slice(i * 2, i * 2 + 2);
    if (!/^[0-9a-fA-F]{2}$/.test(par)) {
      throw new Error(`Hexadecimal inválido: «${par}»`);
    }
    bytes[i] = parseInt(par, 16);
  }

  return bytes;
}

/**
 * El contenido a firmar: los bytes del reto seguidos de los de la huella.
 *
 * Incluir el reto del servidor es lo que impide reutilizar una firma: sin él, una
 * firma capturada valdría para siempre sobre la misma operación. Incluir la
 * huella es lo que impide firmar una operación y ejecutar otra.
 */
export function buildSigningPayload(
  nonceBase64: string,
  operationHashHex: string,
): string {
  const nonce = base64ToBytes(nonceBase64);
  const hash = hexToBytes(operationHashHex);

  const payload = new Uint8Array(nonce.length + hash.length);
  payload.set(nonce, 0);
  payload.set(hash, nonce.length);

  return bytesToBase64(payload);
}
