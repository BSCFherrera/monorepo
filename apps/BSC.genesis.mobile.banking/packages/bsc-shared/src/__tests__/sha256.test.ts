import { createHash } from 'node:crypto';

import { sha256Hex } from '../sha256';

/**
 * La implementación propia se contrasta contra dos referencias independientes:
 * los vectores publicados del estándar, y el SHA-256 de Node, que es OpenSSL.
 *
 * Usar Node como oráculo permite probar entradas arbitrarias —acentos, emoji,
 * mensajes largos, bordes del relleno— sin tener que conocer de antemano el
 * hash de cada una. Node solo está disponible en las pruebas; la
 * implementación de producción no lo usa, porque en el teléfono no existe.
 */
const reference = (text: string): string =>
  createHash('sha256').update(text, 'utf8').digest('hex');

describe('sha256Hex — vectores del estándar', () => {
  it('cadena vacía', () => {
    expect(sha256Hex('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('abc', () => {
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('mensaje de 56 caracteres (dos bloques)', () => {
    expect(
      sha256Hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'),
    ).toBe('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
  });
});

describe('sha256Hex — coincide con OpenSSL', () => {
  const casos: ReadonlyArray<{ nombre: string; texto: string }> = [
    { nombre: 'ASCII corto', texto: 'BSC' },
    {
      nombre: 'cadena canónica típica',
      texto: 'v1|2|80191|11042010013953|52672576257265|25000.00|214',
    },
    {
      nombre: 'acentos y eñe (2 bytes por carácter)',
      texto: 'Transferencia a José Peña — RD$ 1,500.00',
    },
    { nombre: 'símbolo de tres bytes', texto: 'Comisión € 25.00 ₱' },
    { nombre: 'emoji (par suplente, 4 bytes)', texto: 'Pago confirmado 🎉✅' },
    { nombre: 'suplente alto al final del texto', texto: 'roto\ud83d' },
    {
      nombre: 'suplente alto seguido de un carácter normal',
      texto: 'roto\ud83dA',
    },
    { nombre: 'suplente bajo suelto', texto: '\udc00suelto' },
    { nombre: 'dos suplentes altos seguidos', texto: '\ud83d\ud83dfin' },
    { nombre: 'mensaje largo de varios bloques', texto: 'x'.repeat(1000) },
  ];

  it.each(casos)('$nombre', ({ texto }) => {
    expect(sha256Hex(texto)).toBe(reference(texto));
  });
});

describe('sha256Hex — bordes del relleno', () => {
  // El relleno cambia de forma según cuántos bytes falten para completar el
  // bloque de 64. Estas longitudes son exactamente donde se rompe una
  // implementación mal hecha.
  const longitudes = [0, 1, 54, 55, 56, 57, 63, 64, 65, 119, 120, 127, 128];

  it.each(longitudes)('mensaje de %i bytes', longitud => {
    const texto = 'a'.repeat(longitud);
    expect(sha256Hex(texto)).toBe(reference(texto));
  });
});

describe('sha256Hex — forma del resultado', () => {
  it('siempre son 64 caracteres hexadecimales en minúscula', () => {
    for (const texto of ['', 'a', 'BSC', 'ñ'.repeat(100)]) {
      expect(sha256Hex(texto)).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it('un solo bit distinto cambia el resultado por completo', () => {
    const a = sha256Hex('v1|2|80191|1104|5267|25000.00|214');
    const b = sha256Hex('v1|2|80191|1104|5267|25000.01|214');

    expect(a).not.toBe(b);

    // Ningún prefijo largo en común: el hash no filtra cuán parecida era la
    // entrada.
    expect(a.slice(0, 8)).not.toBe(b.slice(0, 8));
  });
});
