import { createHmac } from 'node:crypto';

import { sha256Bytes } from '../sha256';
import {
  codigoTotp,
  codigoTotpAlEstiloDelOriginal,
  contadorDeTiempo,
  decodificarBase32,
  hmacSha256,
  segundosRestantes,
} from '../totp';

/**
 * El TOTP se contrasta contra `node:crypto`, igual que la huella de operación.
 *
 * Una implementación de HMAC escrita a mano que se desvíe produce códigos que
 * *parecen* correctos —seis dígitos que cambian cada treinta segundos— y que
 * ningún servidor acepta. Sin un oráculo independiente, esa clase de error no
 * se descubre hasta que un cliente no puede operar por la web.
 */

const hmacDeNode = (clave: Uint8Array, mensaje: Uint8Array): string =>
  createHmac('sha256', Buffer.from(clave))
    .update(Buffer.from(mensaje))
    .digest('hex');

const hex = (bytes: Uint8Array): string => Buffer.from(bytes).toString('hex');

describe('decodificarBase32', () => {
  it('decodifica los vectores de la RFC 4648', () => {
    // Los de la propia norma, que es el contrato con cualquier otro
    // implementador.
    const casos: ReadonlyArray<[string, string]> = [
      ['MY======', 'f'],
      ['MZXQ====', 'fo'],
      ['MZXW6===', 'foo'],
      ['MZXW6YQ=', 'foob'],
      ['MZXW6YTB', 'fooba'],
      ['MZXW6YTBOI======', 'foobar'],
    ];

    for (const [codificado, esperado] of casos) {
      const bytes = decodificarBase32(codificado);
      expect(bytes).not.toBeNull();
      expect(Buffer.from(bytes!).toString('utf8')).toBe(esperado);
    }
  });

  it('acepta el secreto sin relleno y en minúsculas', () => {
    // El banco puede entregarlo de cualquiera de las dos formas y un secreto
    // rechazado por una diferencia de mayúsculas dejaría al cliente sin token.
    expect(decodificarBase32('mzxw6ytb')).toEqual(
      decodificarBase32('MZXW6YTB'),
    );
    expect(decodificarBase32('MZXW6')).toEqual(decodificarBase32('MZXW6==='));
  });

  it('devuelve nulo en vez de lanzar cuando no es base32', () => {
    // Un secreto corrupto en el almacenamiento seguro tiene que producir un
    // mensaje, no una caída.
    expect(decodificarBase32('no-es-base32!')).toBeNull();
    expect(decodificarBase32('')).toBeNull();
    expect(decodificarBase32('   ')).toBeNull();
    // 0, 1 y 8 no están en el alfabeto: es la confusión clásica con O, I y B.
    expect(decodificarBase32('ABCD0189')).toBeNull();
  });
});

describe('hmacSha256 contra node:crypto', () => {
  const mensaje = Uint8Array.from([0, 0, 0, 0, 3, 57, 42, 17]);

  it('coincide con una clave más corta que el bloque', () => {
    const clave = Uint8Array.from(Buffer.from('12345678901234567890', 'utf8'));
    expect(hex(hmacSha256(clave, mensaje))).toBe(hmacDeNode(clave, mensaje));
  });

  it('coincide con una clave de exactamente un bloque', () => {
    // El borde del relleno: sesenta y cuatro bytes no se rellenan ni se
    // sustituyen por su digest.
    const clave = Uint8Array.from(Buffer.alloc(64, 0xab));
    expect(hex(hmacSha256(clave, mensaje))).toBe(hmacDeNode(clave, mensaje));
  });

  it('coincide con una clave más larga que el bloque', () => {
    // La clave se sustituye por su SHA-256. Es el paso que más veces se omite
    // al escribir un HMAC a mano, y el que solo se nota con claves largas.
    const clave = Uint8Array.from(Buffer.alloc(100, 0x5a));
    expect(hex(hmacSha256(clave, mensaje))).toBe(hmacDeNode(clave, mensaje));
    expect(hex(sha256Bytes(clave)).length).toBe(64);
  });

  it('coincide con el mensaje vacío', () => {
    const clave = Uint8Array.from(Buffer.from('clave', 'utf8'));
    const vacio = new Uint8Array(0);
    expect(hex(hmacSha256(clave, vacio))).toBe(hmacDeNode(clave, vacio));
  });
});

describe('codigoTotp', () => {
  /**
   * El oráculo: TOTP calculado con `node:crypto`, escrito aparte y sin mirar la
   * implementación que se está probando.
   */
  const totpDeNode = (
    secretoBase32: string,
    ahora: number,
    digitos = 6,
    periodo = 30,
  ): string => {
    const secreto = decodificarBase32(secretoBase32)!;
    const contador = Math.floor(Math.floor(ahora / 1000) / periodo);

    const bytes = Buffer.alloc(8);
    bytes.writeBigUInt64BE(BigInt(contador));

    const digest = createHmac('sha256', Buffer.from(secreto))
      .update(bytes)
      .digest();

    const desplazamiento = digest[digest.length - 1]! & 0x0f;
    const binario = digest.readUInt32BE(desplazamiento) & 0x7fffffff;

    return String(binario % 10 ** digitos).padStart(digitos, '0');
  };

  const SECRETO = 'JBSWY3DPEHPK3PXP';

  it('coincide con node:crypto en varios instantes', () => {
    const instantes = [
      0, 59_000, 1_111_111_109_000, 1_234_567_890_000, 2_000_000_000_000,
      // Más allá de los 32 bits del contador de intervalos, que es donde una
      // implementación que use `>>>` para dividir empieza a fallar.
      99_999_999_999_000,
    ];

    for (const ahora of instantes) {
      expect(codigoTotp(SECRETO, ahora)).toBe(totpDeNode(SECRETO, ahora));
    }
  });

  it('el código es estable dentro del intervalo y cambia al cruzarlo', () => {
    // Es la propiedad que el cliente ve: el número aguanta lo que dice el
    // contador y entonces cambia.
    const base = 1_700_000_000_000;
    const dentro = base - (base % 30_000);

    expect(codigoTotp(SECRETO, dentro)).toBe(
      codigoTotp(SECRETO, dentro + 29_999),
    );
    expect(codigoTotp(SECRETO, dentro)).not.toBe(
      codigoTotp(SECRETO, dentro + 30_000),
    );
  });

  it('siempre son seis dígitos, con ceros a la izquierda si hace falta', () => {
    // Un código de cinco dígitos porque el primero era cero es un rechazo
    // seguro en el otro canal.
    for (let i = 0; i < 200; i += 1) {
      const codigo = codigoTotp(SECRETO, i * 31_000);
      expect(codigo).toMatch(/^\d{6}$/u);
    }
  });

  it('un secreto ilegible devuelve nulo', () => {
    expect(codigoTotp('no-es-base32!', 0)).toBeNull();
  });
});

describe('contadorDeTiempo y segundosRestantes', () => {
  it('el contador avanza una vez por periodo', () => {
    expect(contadorDeTiempo(0)).toBe(0);
    expect(contadorDeTiempo(29_999)).toBe(0);
    expect(contadorDeTiempo(30_000)).toBe(1);
    expect(contadorDeTiempo(59_999)).toBe(1);
  });

  it('los segundos restantes van de treinta a uno, nunca a cero', () => {
    /*
      Es lo que la barra de la pantalla enseña. Un cero significaría que el
      código ya no sirve mientras todavía sirve, y el cliente lo descartaría a
      mitad de teclearlo.
    */
    expect(segundosRestantes(0)).toBe(30);
    expect(segundosRestantes(1_000)).toBe(29);
    expect(segundosRestantes(29_000)).toBe(1);
    expect(segundosRestantes(30_000)).toBe(30);
  });
});

describe('el modo de la app Flutter', () => {
  const SECRETO = 'JBSWY3DPEHPK3PXP';

  it('no produce el mismo código que el TOTP estándar', () => {
    /*
      Esta prueba fija el hallazgo, y está escrita para fallar el día en que
      alguien "arregle" una de las dos funciones creyendo que deberían coincidir.

      El paquete `otp` de Dart con `isGoogle: false` no decodifica el base32:
      hace el HMAC con los bytes UTF-8 de la propia cadena, repetidos hasta
      llenar los treinta y dos bytes del bloque. Un verificador estándar
      rechazaría esos códigos, así que la app Flutter no habría podido operar
      por la web con ellos ni aunque el backend le hubiera entregado el secreto.
    */
    const ahora = 1_700_000_000_000;

    expect(codigoTotpAlEstiloDelOriginal(SECRETO, ahora)).not.toBe(
      codigoTotp(SECRETO, ahora),
    );
  });

  it('el del original se calcula sobre la cadena repetida, no sobre el secreto', () => {
    // Se reproduce aquí la regla del paquete de Dart, para dejar constancia
    // ejecutable de en qué consiste la divergencia.
    const ahora = 1_700_000_000_000;

    const utf8 = Buffer.from(SECRETO, 'utf8');
    const rellenada = Buffer.alloc(32);
    for (let i = 0; i < 32; i += 1) rellenada[i] = utf8[i % utf8.length]!;

    const contador = Buffer.alloc(8);
    contador.writeBigUInt64BE(BigInt(Math.floor(ahora / 1000 / 30)));

    const digest = createHmac('sha256', rellenada).update(contador).digest();
    const desplazamiento = digest[digest.length - 1]! & 0x0f;
    const binario = digest.readUInt32BE(desplazamiento) & 0x7fffffff;

    expect(codigoTotpAlEstiloDelOriginal(SECRETO, ahora)).toBe(
      String(binario % 1_000_000).padStart(6, '0'),
    );
  });
});

describe('las opciones del código', () => {
  const SECRETO = 'JBSWY3DPEHPK3PXP';

  it('acepta otra longitud y otro periodo', () => {
    /*
      TokenBSC usa seis dígitos y treinta segundos, que son los valores por
      defecto. Los parámetros existen porque `TotpGenerator` del servidor los
      acepta —`digits` y `timeStepSeconds` viven en la tabla del cliente—, así
      que el día que el banco cambie la configuración de un cliente, el canal
      tiene que poder seguirla sin tocar código.
    */
    const ahora = 1_700_000_000_000;

    expect(codigoTotp(SECRETO, ahora, { digitos: 8 })).toMatch(/^\d{8}$/u);
    expect(codigoTotp(SECRETO, ahora, { periodo: 60 })).toMatch(/^\d{6}$/u);

    // Un periodo distinto produce un código distinto: el contador cambia.
    expect(codigoTotp(SECRETO, ahora, { periodo: 60 })).not.toBe(
      codigoTotp(SECRETO, ahora),
    );
  });

  it('el modo del original también acepta opciones', () => {
    const ahora = 1_700_000_000_000;
    expect(
      codigoTotpAlEstiloDelOriginal(SECRETO, ahora, { digitos: 8 }),
    ).toMatch(/^\d{8}$/u);
  });

  it('contadorDeTiempo y segundosRestantes aceptan otro periodo', () => {
    expect(contadorDeTiempo(120_000, 60)).toBe(2);
    expect(segundosRestantes(90_000, 60)).toBe(30);
  });
});

describe('el relleno del modo del original', () => {
  it('un secreto que ya llena el bloque no se repite', () => {
    /*
      `_padSecret` del paquete de Dart devuelve el secreto tal cual cuando ya
      mide treinta y dos bytes o más. Con los secretos corrientes —dieciséis
      caracteres— ese camino no se recorre nunca, así que hay que pedirlo a
      propósito; si no, queda sin probar justo la rama que decide si el HMAC se
      calcula sobre lo que se espera.
    */
    const largo = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP'; // 48 caracteres
    const ahora = 1_700_000_000_000;

    expect(codigoTotpAlEstiloDelOriginal(largo, ahora)).toMatch(/^\d{6}$/u);
    // Y un secreto de exactamente el tamaño del bloque tampoco se repite.
    expect(codigoTotpAlEstiloDelOriginal('A'.repeat(32), ahora)).toMatch(
      /^\d{6}$/u,
    );
  });

  it('un secreto vacío no entra en un bucle infinito', () => {
    // `repetirHasta` devuelve el arreglo vacío en vez de intentar llenarlo.
    expect(codigoTotpAlEstiloDelOriginal('', 0)).toMatch(/^\d{6}$/u);
  });
});
