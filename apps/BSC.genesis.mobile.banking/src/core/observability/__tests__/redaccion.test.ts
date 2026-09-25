import { colaDeCuenta, magnitudDeMonto, redactar } from '../redaccion';
import { Registro } from '../registro';

/**
 * La redacción del registro.
 *
 * Es de las pocas piezas del proyecto donde una prueba que falla significa
 * **una fuga de datos**, no una pantalla fea. Por eso se prueba con la misma
 * severidad que la huella de operación, y con datos que tienen la forma real de
 * los que maneja la aplicación.
 *
 * Todos los valores de aquí son sintéticos.
 */

describe('colaDeCuenta', () => {
  it('deja los últimos cuatro, que es lo que el cliente ya ve', () => {
    expect(colaDeCuenta('11042010013953')).toBe('****3953');
    expect(colaDeCuenta('4539123456780668')).toBe('****0668');
  });

  it('un valor corto no se filtra por ser corto', () => {
    // Enseñar «123» entero porque no llegaba a cinco caracteres sería una
    // excepción que alguien explotaría.
    expect(colaDeCuenta('123')).toBe('****');
    expect(colaDeCuenta('')).toBe('****');
  });
});

describe('magnitudDeMonto', () => {
  it('distingue mil de un millón sin dejar la cifra', () => {
    // Es lo que hace falta para investigar; el monto exacto no.
    expect(magnitudDeMonto(1_000)).toBe('~10^3');
    expect(magnitudDeMonto(1_000_000)).toBe('~10^6');
    expect(magnitudDeMonto(1_234.56)).toBe('~10^3');
  });

  it('el cero y los negativos no rompen el logaritmo', () => {
    expect(magnitudDeMonto(0)).toBe('0');
    expect(magnitudDeMonto(-5_000)).toBe('~10^3');
    expect(magnitudDeMonto(Number.NaN)).toBe('no numérico');
  });
});

describe('redactar', () => {
  it('omite del todo lo que nunca debe registrarse', () => {
    const redactado = redactar({
      password: 'contrasena-de-ejemplo',
      accessToken: 'eyJhbGciOiJIUzI1NiJ9.x.y',
      signature: 'MEUCIQD...',
      publicKey: 'MFkwEwYHKoZIzj0CAQ',
      otp: '123456',
    }) as Record<string, unknown>;

    for (const clave of Object.keys(redactado)) {
      expect(redactado[clave]).toBe('[omitido]');
    }
  });

  it('deja la cola de las cuentas y la magnitud de los montos', () => {
    /*
      Sin nada de esto un registro no sirve: «falló una transferencia» no se
      puede investigar. Con la cola y la magnitud sí, y el cliente ya ve esa
      cola en su propia pantalla.
    */
    const redactado = redactar({
      debitAccountNumber: '11042010013953',
      creditAccountNumber: '11042010099887',
      transactionAmount: 1_234.56,
    }) as Record<string, unknown>;

    expect(redactado.debitAccountNumber).toBe('****3953');
    expect(redactado.creditAccountNumber).toBe('****9887');
    expect(redactado.transactionAmount).toBe('~10^3');
  });

  it('sustituye los datos de la persona', () => {
    const redactado = redactar({
      email: 'alguien@example.com',
      customerFullName: 'NOMBRE APELLIDO',
      identificationNumber: '00100000001',
      telefono: '809-000-0000',
    }) as Record<string, unknown>;

    for (const clave of Object.keys(redactado)) {
      expect(redactado[clave]).toBe('[dato personal]');
    }
  });

  it('atrapa por su forma lo que no está clasificado por su nombre', () => {
    /*
      Es la regla que salva del campo nuevo que el backend añadió el mes pasado
      y que nadie clasificó. Una clave desconocida con un correo o con algo que
      parece un número de cuenta se redacta igual.
    */
    const redactado = redactar({
      campoQueNadieClasifico: 'alguien@example.com',
      otroCampoNuevo: '4539123456780668',
      textoNormal: 'Pago de la renta',
    }) as Record<string, unknown>;

    expect(redactado.campoQueNadieClasifico).toBe('[correo]');
    expect(redactado.otroCampoNuevo).toBe('****0668');
    // Un comentario del cliente no es PII por sí solo y sirve para diagnosticar.
    expect(redactado.textoNormal).toBe('Pago de la renta');
  });

  it('entra en objetos y listas anidados', () => {
    // El cuerpo real de una transferencia lleva el cliente destino dentro.
    const redactado = redactar({
      targetClient: {
        customerFullName: 'NOMBRE APELLIDO',
        identificationNumber: '00100000001',
      },
      productos: [{ accountNumber: '11042010013953', saldo: 128_450.12 }],
    }) as Record<string, Record<string, unknown>>;

    expect(redactado.targetClient?.customerFullName).toBe('[dato personal]');
    expect(
      (redactado.productos as unknown as Record<string, unknown>[])[0]
        ?.accountNumber,
    ).toBe('****3953');
  });

  it('un ciclo se marca en vez de colgar el proceso', () => {
    // Registrar no puede tumbar la aplicación.
    const ciclico: Record<string, unknown> = { nombre: 'x' };
    ciclico.yoMismo = ciclico;

    expect(() => redactar(ciclico)).not.toThrow();
  });

  it('no distingue mayúsculas ni guiones en el nombre de la clave', () => {
    // El backend manda `AccessToken`, el core `access_token` y la app
    // `accessToken`. Las tres son la misma cosa.
    for (const clave of ['AccessToken', 'access_token', 'access-token']) {
      const redactado = redactar({ [clave]: 'x.y.z' }) as Record<
        string,
        unknown
      >;
      expect(redactado[clave]).toBe('[omitido]');
    }
  });
});

describe('Registro', () => {
  beforeEach(() => {
    Registro.limpiar();
    Registro.enviarA(null);
  });

  it('redacta en el propio registro, no en quien llama', () => {
    /*
      Es la decisión que sostiene todo el módulo: confiar en que cada punto de
      llamada redacte es confiar en que nadie tenga prisa nunca.
    */
    Registro.info('transferencia enviada', {
      debitAccountNumber: '11042010013953',
      password: 'contrasena-de-ejemplo',
    });

    const [entrada] = Registro.historial();
    const datos = entrada?.datos as Record<string, unknown>;

    expect(datos.debitAccountNumber).toBe('****3953');
    expect(datos.password).toBe('[omitido]');
  });

  it('un error registra el mensaje de la causa, no la excepción entera', () => {
    // Una excepción de red lleva dentro la petición completa, con cabeceras y
    // cuerpo. Eso es justo lo que no puede quedar registrado.
    Registro.error('falló la ejecución', new Error('timeout de red'));

    const [entrada] = Registro.historial();
    expect((entrada?.datos as Record<string, unknown>).causa).toBe(
      'Error: timeout de red',
    );
  });

  it('el historial no crece sin límite', () => {
    // Un registro sin tope es una fuga de memoria en una aplicación que puede
    // pasar horas abierta.
    for (let i = 0; i < 500; i += 1) Registro.info(`evento ${i}`);

    expect(Registro.historial().length).toBeLessThanOrEqual(200);
    // Y lo que queda es lo reciente, que es lo que sirve para diagnosticar.
    expect(Registro.historial().at(-1)?.mensaje).toBe('evento 499');
  });

  it('el destino externo recibe la entrada ya redactada', () => {
    const recibidas: unknown[] = [];
    Registro.enviarA(entrada => recibidas.push(entrada.datos));

    Registro.warn('intento', { cardNumber: '4539123456780668' });

    expect((recibidas[0] as Record<string, unknown>).cardNumber).toBe(
      '****0668',
    );
  });
});
