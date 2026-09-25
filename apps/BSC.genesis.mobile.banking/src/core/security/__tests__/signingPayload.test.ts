import {
  base64ToBytes,
  bytesToBase64,
  hexToBytes,
  buildSigningPayload,
} from '../signingPayload';

/**
 * El oráculo es `Buffer` de Node, que no existe en el teléfono pero sí en las
 * pruebas. Contrastar contra él permite probar entradas arbitrarias sin tener
 * que conocer de antemano el resultado de cada una.
 */
const base64DeReferencia = (bytes: Uint8Array) =>
  Buffer.from(bytes).toString('base64');

describe('bytesToBase64', () => {
  it('coincide con Buffer para longitudes que no son múltiplo de 3', () => {
    // Los tres restos distintos al dividir entre 3 son donde aparece el relleno
    // con «=», y donde una implementación mal hecha se rompe.
    for (let longitud = 0; longitud <= 12; longitud += 1) {
      const bytes = Uint8Array.from(
        Array.from({ length: longitud }, (_, i) => (i * 37) % 256),
      );
      expect(bytesToBase64(bytes)).toBe(base64DeReferencia(bytes));
    }
  });

  it('cubre todo el rango de valores de byte', () => {
    const bytes = Uint8Array.from(Array.from({ length: 256 }, (_, i) => i));
    expect(bytesToBase64(bytes)).toBe(base64DeReferencia(bytes));
  });

  it('una cadena vacía produce una cadena vacía', () => {
    expect(bytesToBase64(new Uint8Array(0))).toBe('');
  });
});

describe('base64ToBytes', () => {
  it('es la inversa exacta de bytesToBase64', () => {
    for (let longitud = 0; longitud <= 20; longitud += 1) {
      const original = Uint8Array.from(
        Array.from({ length: longitud }, (_, i) => (i * 91) % 256),
      );
      expect(Array.from(base64ToBytes(bytesToBase64(original)))).toEqual(
        Array.from(original),
      );
    }
  });

  it('acepta base64 con saltos de línea', () => {
    const original = Uint8Array.from([1, 2, 3, 4, 5, 6]);
    const conSaltos = bytesToBase64(original).replace(/(.{4})/, '$1\n');
    expect(Array.from(base64ToBytes(conSaltos))).toEqual(Array.from(original));
  });

  it('rechaza caracteres que no pertenecen al alfabeto', () => {
    expect(() => base64ToBytes('AB*D')).toThrow(/Base64 inválido/);
  });
});

describe('hexToBytes', () => {
  it('convierte hexadecimal en minúscula y mayúscula', () => {
    expect(Array.from(hexToBytes('00ff10AB'))).toEqual([0, 255, 16, 171]);
  });

  it('acepta la cadena vacía', () => {
    expect(hexToBytes('')).toHaveLength(0);
  });

  it('rechaza una longitud impar', () => {
    expect(() => hexToBytes('abc')).toThrow(/número par/);
  });

  it('rechaza caracteres que no son hexadecimales', () => {
    expect(() => hexToBytes('zz')).toThrow(/Hexadecimal inválido/);
  });

  it('convierte una huella completa de 32 bytes', () => {
    const huella =
      'a455a04b5aff0450635bef222eac23bd7932b4add72a55e5452e00352eed01ea';
    expect(hexToBytes(huella)).toHaveLength(32);
  });
});

describe('buildSigningPayload', () => {
  const nonce = Uint8Array.from([0xde, 0xad, 0xbe, 0xef]);
  const nonceBase64 = bytesToBase64(nonce);
  const huella =
    'a455a04b5aff0450635bef222eac23bd7932b4add72a55e5452e00352eed01ea';

  it('concatena el reto y luego la huella, en ese orden', () => {
    // El orden es contrato con el backend: invertirlo produce una firma que el
    // servidor rechaza, sin ningún mensaje que explique por qué.
    const payload = base64ToBytes(buildSigningPayload(nonceBase64, huella));

    expect(payload).toHaveLength(nonce.length + 32);
    expect(Array.from(payload.subarray(0, 4))).toEqual([
      0xde, 0xad, 0xbe, 0xef,
    ]);
    expect(Array.from(payload.subarray(4))).toEqual(
      Array.from(hexToBytes(huella)),
    );
  });

  it('un reto distinto produce un contenido distinto', () => {
    // Esto es lo que impide reutilizar una firma capturada: sin el reto, la
    // misma firma valdría para siempre sobre la misma operación.
    const otroNonce = bytesToBase64(Uint8Array.from([1, 2, 3, 4]));
    expect(buildSigningPayload(nonceBase64, huella)).not.toBe(
      buildSigningPayload(otroNonce, huella),
    );
  });

  it('una huella distinta produce un contenido distinto', () => {
    // Y esto es lo que impide firmar una operación y ejecutar otra.
    const otraHuella = huella.replace(/^a4/, 'b4');
    expect(buildSigningPayload(nonceBase64, huella)).not.toBe(
      buildSigningPayload(nonceBase64, otraHuella),
    );
  });

  it('propaga el error si la huella no es hexadecimal válido', () => {
    expect(() => buildSigningPayload(nonceBase64, 'no-es-hex')).toThrow();
  });
});
