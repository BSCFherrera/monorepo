import type { AxiosInstance } from 'axios';

import {
  ProductDetailRepository,
  rangoPorDefecto,
} from '../productDetailRepository';

function construir(respuestas: { get?: jest.Mock; post?: jest.Mock } = {}): {
  repo: ProductDetailRepository;
  get: jest.Mock;
  post: jest.Mock;
} {
  const get = respuestas.get ?? jest.fn(async () => ({ data: { Value: [] } }));
  const post =
    respuestas.post ?? jest.fn(async () => ({ data: { Value: [] } }));

  return {
    get,
    post,
    repo: new ProductDetailRepository({
      get,
      post,
    } as unknown as AxiosInstance),
  };
}

const RANGO = {
  from: new Date(2026, 4, 1),
  to: new Date(2026, 4, 31),
};

describe('rango por defecto', () => {
  it('son treinta días contando hoy', () => {
    // Del 2 al 31 de mayo, ambos incluidos, son treinta. La app Flutter restaba
    // treinta días completos en la píldora y producía un rango de treinta y
    // uno, mientras que el atajo «30 días» de su propia hoja restaba
    // veintinueve; aquí los dos caminos usan el mismo cálculo.
    const rango = rangoPorDefecto(new Date(2026, 4, 31));

    expect(rango.to.getDate()).toBe(31);
    expect(rango.from.getDate()).toBe(2);
    expect(rango.from.getMonth()).toBe(4);
  });

  it('cruza el cambio de mes correctamente', () => {
    const rango = rangoPorDefecto(new Date(2026, 0, 15));

    expect(rango.from.getMonth()).toBe(11);
    expect(rango.from.getFullYear()).toBe(2025);
  });
});

describe('detalle del producto', () => {
  it('consulta con número y tipo', async () => {
    const { repo, get } = construir({
      get: jest.fn(async () => ({ data: { SALDO: 100 } })),
    });

    await repo.obtenerDetalle('11042010013953', 'CA');

    expect(get).toHaveBeenCalledWith('/api/v1/products/details', {
      params: { productNumber: '11042010013953', productType: 'CA' },
    });
  });

  it('devuelve el objeto crudo, con los nombres del core', async () => {
    // Normalizarlo aquí obligaría a un modelo con veinte campos opcionales,
    // porque la forma cambia según el tipo de producto.
    const { repo } = construir({
      get: jest.fn(async () => ({ data: { SALDODISPONIBLE: 5000 } })),
    });

    expect(await repo.obtenerDetalle('1', 'CA')).toEqual({
      SALDODISPONIBLE: 5000,
    });
  });

  it('acepta la respuesta como cadena JSON', async () => {
    const { repo } = construir({
      get: jest.fn(async () => ({ data: JSON.stringify({ SALDO: 1 }) })),
    });

    expect(await repo.obtenerDetalle('1', 'CA')).toEqual({ SALDO: 1 });
  });

  it('saca el detalle del sobre Value con el que responde el backend', async () => {
    // Sin desenvolverlo, quien lee busca `SAL_DISPONIBLE` en el sobre, no lo
    // encuentra, y la conversión tolerante devuelve cero: **la pantalla queda
    // perfecta y con todos los saldos a cero**, sin un solo error a la vista.
    const { repo } = construir({
      get: jest.fn(async () => ({
        data: { Value: { SAL_DISPONIBLE: 128_450.12 } },
      })),
    });

    expect(await repo.obtenerDetalle('1', 'CA')).toEqual({
      SAL_DISPONIBLE: 128_450.12,
    });
  });

  it('toma el primer elemento cuando el sobre trae una lista', async () => {
    const { repo } = construir({
      get: jest.fn(async () => ({
        data: { Value: [{ SAL_DISPONIBLE: 1 }, { SAL_DISPONIBLE: 2 }] },
      })),
    });

    expect(await repo.obtenerDetalle('1', 'CA')).toEqual({ SAL_DISPONIBLE: 1 });
  });

  it('reconoce el sobre en minúscula, que es como lo serializa a veces el bus', async () => {
    const { repo } = construir({
      get: jest.fn(async () => ({ data: { value: { SAL_TOTAL: 9 } } })),
    });

    expect(await repo.obtenerDetalle('1', 'CA')).toEqual({ SAL_TOTAL: 9 });
  });

  it('una lista vacía dentro del sobre no revienta', async () => {
    const { repo } = construir({
      get: jest.fn(async () => ({ data: { Value: [] } })),
    });

    expect(await repo.obtenerDetalle('1', 'CA')).toEqual({});
  });

  it('una respuesta inesperada produce un objeto vacío, no una excepción', async () => {
    const { repo } = construir({ get: jest.fn(async () => ({ data: 42 })) });

    expect(await repo.obtenerDetalle('1', 'CA')).toEqual({});
  });
});

describe('movimientos por tipo de producto', () => {
  it('una cuenta usa el endpoint de cuentas', async () => {
    const { repo, get } = construir();

    await repo.obtenerMovimientos({
      numeroDeProducto: '11042010013953',
      tipoDeProducto: 'CA',
      rango: RANGO,
    });

    expect(get).toHaveBeenCalledWith(
      '/api/v1/account-management/account-transactions',
      {
        params: {
          accountNumber: '11042010013953',
          startDate: '01-05-2026',
          endDate: '31-05-2026',
        },
      },
    );
  });

  it('una cuenta corriente usa el mismo endpoint que la de ahorros', async () => {
    const { repo, get } = construir();

    await repo.obtenerMovimientos({
      numeroDeProducto: '1',
      tipoDeProducto: 'CC',
      rango: RANGO,
    });

    expect(get.mock.calls[0]?.[0]).toBe(
      '/api/v1/account-management/account-transactions',
    );
  });

  it('una tarjeta usa su endpoint y manda la moneda', async () => {
    // La moneda es obligatoria en tarjetas: una tarjeta lleva saldo en pesos y
    // en dólares a la vez, y sin ese dato el core no sabe cuál devolver.
    const { repo, get } = construir();

    await repo.obtenerMovimientos({
      numeroDeProducto: '4539',
      tipoDeProducto: 'TC',
      codigoMoneda: 840,
      rango: RANGO,
    });

    expect(get).toHaveBeenCalledWith(
      '/api/v1/credit-card-management/transactions',
      {
        params: {
          creditCardNumber: '4539',
          currencyCode: '840',
          startDate: '01-05-2026',
          endDate: '31-05-2026',
        },
      },
    );
  });

  it('una tarjeta sin moneda asume pesos', async () => {
    const { repo, get } = construir();

    await repo.obtenerMovimientos({
      numeroDeProducto: '4539',
      tipoDeProducto: 'TC',
      rango: RANGO,
    });

    expect(get.mock.calls[0]?.[1]?.params?.currencyCode).toBe('214');
  });

  it('un préstamo usa GET pese a que la ruta termine en /retrieve', async () => {
    // Lo confirmó la prueba de paridad contra el Swagger del backend. Usarlo
    // con POST compila igual y devuelve 405 cuando el cliente abre su préstamo.
    const { repo, get, post } = construir();

    await repo.obtenerMovimientos({
      numeroDeProducto: '293276',
      tipoDeProducto: 'PR',
      codigoMoneda: 214,
      rango: RANGO,
    });

    expect(post).not.toHaveBeenCalled();
    expect(get).toHaveBeenCalledWith(
      '/api/v1/loan-management/loan-transactions/retrieve',
      {
        params: {
          loanCode: '293276',
          currencyCode: '214',
          startDate: '01-05-2026',
          endDate: '31-05-2026',
        },
      },
    );
  });

  it('un certificado usa el endpoint de cuentas', async () => {
    const { repo, get } = construir();

    await repo.obtenerMovimientos({
      numeroDeProducto: '999',
      tipoDeProducto: 'CD',
      rango: RANGO,
    });

    expect(get.mock.calls[0]?.[0]).toBe(
      '/api/v1/account-management/account-transactions',
    );
  });
});

describe('período sin movimientos', () => {
  it('devuelve lista vacía en vez de propagar el error', async () => {
    // El core responde con error cuando no hay nada en el rango. Mostrar una
    // pantalla roja a quien simplemente no usó la cuenta ese mes sería un
    // defecto de producto.
    const { repo } = construir({
      get: jest.fn(async () => {
        throw {
          response: {
            status: 400,
            data: { message: 'No se encontraron movimientos' },
          },
        };
      }),
    });

    await expect(
      repo.obtenerMovimientos({
        numeroDeProducto: '1',
        tipoDeProducto: 'CA',
        rango: RANGO,
      }),
    ).resolves.toEqual([]);
  });

  it('un error real sí se propaga', async () => {
    const { repo } = construir({
      get: jest.fn(async () => {
        throw { response: { status: 500, data: 'Internal error' } };
      }),
    });

    await expect(
      repo.obtenerMovimientos({
        numeroDeProducto: '1',
        tipoDeProducto: 'CA',
        rango: RANGO,
      }),
    ).rejects.toBeDefined();
  });
});

describe('detalle de cuenta ya interpretado', () => {
  it('desenvuelve el sobre y lee los campos del core', async () => {
    const { repo, get } = construir({
      get: jest.fn(async () => ({
        data: {
          Value: [
            {
              TITULARES: 'Titular De Prueba',
              SAL_DISPONIBLE: 128_450.12,
              SAL_TOTAL: 130_000,
              LIMITE_SOBREGIRO: 250_000,
            },
          ],
        },
      })),
    });

    const cuenta = await repo.obtenerDetalleDeCuenta({
      numeroDeCuenta: '11042010013953',
      codigoMoneda: 214,
      tipoDeCuenta: 'CA',
    });

    expect(get).toHaveBeenCalledWith('/api/v1/products/details', {
      params: { productNumber: '11042010013953', productType: 'CA' },
    });
    expect({
      titular: cuenta.titular,
      disponible: cuenta.saldoDisponible,
      total: cuenta.saldoTotal,
      sobregiro: cuenta.limiteDeSobregiro,
      numero: cuenta.numeroDeCuenta,
      moneda: cuenta.codigoMoneda,
    }).toEqual({
      titular: 'Titular De Prueba',
      disponible: 128_450.12,
      total: 130_000,
      sobregiro: 250_000,
      numero: '11042010013953',
      moneda: 214,
    });
  });
});

describe('estado de cuenta de la tarjeta', () => {
  it('consulta el ciclo con mes y año de dos y cuatro dígitos', async () => {
    const { repo, post } = construir({
      post: jest.fn(async () => ({ data: { Value: { CurrentBalance: 100 } } })),
    });

    await repo.obtenerEstadoDeTarjeta({
      numeroDeTarjeta: '4023111122220668',
      codigoMoneda: 214,
      mes: 7,
      anio: 2026,
    });

    expect(post).toHaveBeenCalledWith(
      '/api/v1/credit-card-management/statement',
      {
        creditCardNumber: '4023111122220668',
        currencyCode: '214',
        statementMonth: '07',
        statementYear: '2026',
      },
    );
  });

  it('devuelve el ciclo ya interpretado, sacado del sobre', async () => {
    const { repo } = construir({
      post: jest.fn(async () => ({
        data: {
          Value: {
            ProductName: 'Visa Platinum',
            CurrentBalance: 48250.75,
            MinimumPayment: 2412.54,
          },
        },
      })),
    });

    const estado = await repo.obtenerEstadoDeTarjeta({
      numeroDeTarjeta: '4023111122220668',
      codigoMoneda: 214,
      mes: 7,
      anio: 2026,
    });

    expect(estado.nombreDelProducto).toBe('Visa Platinum');
    expect(estado.saldoAlCorte).toBe(48250.75);
    expect(estado.pagoMinimo).toBe(2412.54);
  });
});

describe('PDF del estado de cuenta', () => {
  it('pide el de la tarjeta con el ciclo y devuelve el base64', async () => {
    const { repo, post } = construir({
      post: jest.fn(async () => ({ data: { Value: 'JVBERi0xLjQK' } })),
    });

    const pdf = await repo.obtenerPdfDeEstadoDeTarjeta({
      numeroDeTarjeta: '4023111122220668',
      codigoMoneda: 840,
      mes: 12,
      anio: 2025,
    });

    expect(post).toHaveBeenCalledWith(
      '/api/v1/credit-card-management/statement/pdf',
      {
        creditCardNumber: '4023111122220668',
        currencyCode: '840',
        statementMonth: '12',
        statementYear: '2025',
      },
    );
    expect(pdf).toBe('JVBERi0xLjQK');
  });

  it('pide el de la cuenta con las fechas separadas por guiones', async () => {
    // Con barras el core responde «sin registros» y el PDF sale vacío: es el
    // mismo formato que hubo que corregir en la consulta de movimientos.
    const { repo, get } = construir({
      get: jest.fn(async () => ({
        data: { Value: { AccountStatementPdf: { StatementPdf: 'JVBERi0x' } } },
      })),
    });

    const pdf = await repo.obtenerPdfDeEstadoDeCuenta({
      numeroDeCuenta: '11042010013953',
      desde: new Date(2026, 7, 1),
      hasta: new Date(2026, 7, 31),
    });

    expect(get).toHaveBeenCalledWith(
      '/api/v1/account-management/account-statement-pdf',
      {
        params: {
          accountNumber: '11042010013953',
          startDate: '01-08-2026',
          endDate: '31-08-2026',
        },
      },
    );
    expect(pdf).toBe('JVBERi0x');
  });

  it('un ciclo sin estado devuelve indefinido en vez de un archivo vacío', async () => {
    const { repo } = construir({
      post: jest.fn(async () => ({ data: { Value: { StatementPdf: '' } } })),
    });

    await expect(
      repo.obtenerPdfDeEstadoDeTarjeta({
        numeroDeTarjeta: '4023111122220668',
        codigoMoneda: 214,
        mes: 1,
        anio: 2026,
      }),
    ).resolves.toBeUndefined();
  });
});
