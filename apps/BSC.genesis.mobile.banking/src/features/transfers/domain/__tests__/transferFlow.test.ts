import { huellaDeTransferencia } from '../../data/transferFingerprint';
import { TransferRepository } from '../../data/transferRepository';
import type { Beneficiario } from '../../../beneficiaries/data/beneficiaryContracts';
import type { Producto } from '../../../dashboard/data/productContracts';
import {
  SIN_COMISIONES,
  SIN_VALIDAR,
  TipoDeTransferencia,
} from '../../data/transferContracts';
import {
  cuentaDeDestino,
  documentoParaComisiones,
  hayDestino,
  monedaDelDestino,
  monedaDelOrigen,
  montoAAcreditar,
  montoADebitar,
  necesitaConversion,
  nombreDelDestino,
  ordenDeLaTransferencia,
  puedeContinuar,
  tipoDeProductoOrigen,
  totalDebitado,
  type DatosDelAsistente,
} from '../transferFlow';

const cuenta = (sobre: Partial<Producto> = {}): Producto =>
  ({
    categoria: 'CA',
    identificacion: '11042010013953',
    codigoMoneda: 214,
    estado: 'A',
    saldoActual: 100_000,
    saldoDisponible: 100_000,
    numeroEnmascarado: undefined,
    saldoPesos: 0,
    saldoDolares: 0,
    disponiblePesos: 0,
    disponibleDolares: 0,
    pagoMinimoPesos: 0,
    pagoMinimoDolares: 0,
    ...sobre,
  } as Producto);

const beneficiario = (sobre: Partial<Beneficiario> = {}): Beneficiario => ({
  id: 'b-001',
  tipo: 1,
  alias: 'Mamá',
  nombre: 'ROSA MARIA GUZMAN',
  numeroDeCuenta: '11042010077431',
  tipoDeCuenta: 'Savings',
  codigoMoneda: '214',
  banco: undefined,
  documentoTipo: 1,
  documentoNumero: '00100000001',
  ...sobre,
});

const base = (sobre: Partial<DatosDelAsistente> = {}): DatosDelAsistente => ({
  tipo: TipoDeTransferencia.Terceros,
  origen: cuenta(),
  destinoPropio: null,
  beneficiario: beneficiario(),
  validacion: SIN_VALIDAR,
  monto: 1000,
  comentario: '',
  cotizacion: null,
  comisiones: SIN_COMISIONES,
  ...sobre,
});

describe('destino', () => {
  it('en los flujos con beneficiario sale del beneficiario', () => {
    const datos = base();

    expect(hayDestino(datos)).toBe(true);
    expect(cuentaDeDestino(datos)).toBe('11042010077431');
    expect(nombreDelDestino(datos)).toBe('Mamá');
  });

  it('en los flujos sin beneficiario sale de la validación de cuenta', () => {
    const datos = base({
      tipo: TipoDeTransferencia.Expresa,
      beneficiario: null,
      validacion: {
        cliente: {
          nombreCompleto: 'CARMEN SOSA',
          documentoTipo: 'NationalId',
          documentoNumero: '00100000003',
          email: undefined,
          primerNombre: 'CARMEN',
          primerApellido: 'SOSA',
        },
        producto: {
          numero: '11042010099887',
          tipo: 'CA',
          moneda: '214',
          primerNombre: 'CARMEN',
          primerApellido: 'SOSA',
        },
      },
    });

    expect(cuentaDeDestino(datos)).toBe('11042010099887');
    expect(nombreDelDestino(datos)).toBe('CARMEN SOSA');
  });

  it('sin destino no se puede continuar aunque haya monto', () => {
    const datos = base({ beneficiario: null });

    expect(hayDestino(datos)).toBe(false);
    expect(puedeContinuar(datos)).toBe(false);
  });

  it('un monto en cero tampoco deja continuar', () => {
    expect(puedeContinuar(base({ monto: 0 }))).toBe(false);
    expect(puedeContinuar(base())).toBe(true);
  });
});

describe('monedas y conversión', () => {
  it('mismas monedas no necesitan conversión', () => {
    const datos = base();

    expect(monedaDelOrigen(datos)).toBe(214);
    expect(monedaDelDestino(datos)).toBe(214);
    expect(necesitaConversion(datos)).toBe(false);
    expect(montoADebitar(datos)).toBe(1000);
  });

  it('de pesos a dólares sí, y el débito sale de la cotización', () => {
    const datos = base({
      beneficiario: beneficiario({ codigoMoneda: '840' }),
      cotizacion: { montoConvertido: 59_500, tasa: '59.50' },
    });

    expect(necesitaConversion(datos)).toBe(true);
    expect(montoAAcreditar(datos)).toBe(1000);
    expect(montoADebitar(datos)).toBe(59_500);
  });

  it('sin cotización el débito cae al monto, no a cero', () => {
    // Cero haría creer que la transferencia es gratis.
    const datos = base({ beneficiario: beneficiario({ codigoMoneda: '840' }) });

    expect(montoADebitar(datos)).toBe(1000);
  });

  it('el total debitado suma comisión e impuesto sobre el monto convertido', () => {
    const datos = base({
      beneficiario: beneficiario({ codigoMoneda: '840' }),
      cotizacion: { montoConvertido: 59_500, tasa: '59.50' },
      comisiones: { comision: 25, impuesto: 89.25 },
    });

    expect(totalDebitado(datos)).toBe(59_614.25);
  });
});

describe('documento para el resumen de comisiones', () => {
  it('sale del beneficiario en los flujos con beneficiario', () => {
    expect(documentoParaComisiones(base())).toEqual({
      tipo: 1,
      numero: '00100000001',
    });
  });

  it('una internacional manda siempre el tipo 4', () => {
    // Es lo que hace el original, sin mirar el documento del beneficiario.
    expect(
      documentoParaComisiones(
        base({
          tipo: TipoDeTransferencia.Internacional,
          beneficiario: beneficiario({ tipo: 3, documentoTipo: 1 }),
        }),
      ).tipo,
    ).toBe(4);
  });

  it('un número que es todo ceros se manda vacío', () => {
    // El core lo trata como ausente de todas formas.
    expect(
      documentoParaComisiones(
        base({
          beneficiario: beneficiario({ documentoNumero: '00000000000' }),
        }),
      ).numero,
    ).toBe('');
  });
});

describe('ordenDeLaTransferencia', () => {
  it('con beneficiario manda su identificador y ningún subtipo', () => {
    const orden = ordenDeLaTransferencia(base());

    expect(orden.beneficiarioId).toBe('b-001');
    expect(orden.subtipo).toBeNull();
    expect(orden.clienteDestino).toBeUndefined();
    expect(orden.cuentaOrigen).toBe('11042010013953');
    expect(orden.tipoDeProductoOrigen).toBe('CA');
  });

  it('entre cuentas propias manda subtipo 1 y el producto destino', () => {
    const datos = base({
      tipo: TipoDeTransferencia.CuentasPropias,
      beneficiario: null,
      validacion: {
        cliente: {
          nombreCompleto: 'TITULAR PRUEBA',
          documentoTipo: 'NationalId',
          documentoNumero: '00100000003',
          email: 'x@example.com',
          primerNombre: 'TITULAR',
          primerApellido: 'PRUEBA',
        },
        producto: {
          numero: '11042010099887',
          tipo: 'CA',
          moneda: '214',
          primerNombre: 'TITULAR',
          primerApellido: 'PRUEBA',
        },
      },
    });

    const orden = ordenDeLaTransferencia(datos);

    expect(orden.subtipo).toBe(1);
    expect(orden.beneficiarioId).toBeUndefined();
    expect(orden.productoDestino).toMatchObject({
      number: '11042010099887',
      currency: '214',
      currencyDescription: 'Dominican Peso',
    });
    expect(orden.clienteDestino).toMatchObject({
      identificationType: '1',
      relationship: 'TITULAR',
    });
  });

  it('una expresa manda subtipo 2', () => {
    expect(
      ordenDeLaTransferencia(
        base({ tipo: TipoDeTransferencia.Expresa, beneficiario: null }),
      ).subtipo,
    ).toBe(2);
  });

  it('una cuenta corriente de origen se declara como CC', () => {
    expect(
      tipoDeProductoOrigen(base({ origen: cuenta({ categoria: 'CC' }) })),
    ).toBe('CC');
  });

  it('el monto de la orden NO lleva el impuesto: lo cobra el core aparte', () => {
    /*
      **Esta prueba cambió de sentido tras medirlo en cuentas reales**, y el
      cambio vale más que la prueba. Se había fijado que la orden llevara el
      total —monto más comisión e impuesto—, siguiendo al portal. Una
      transferencia de RD$ 100.00 en el Pixel demostró que eso es un error de
      dinero: al destino le llegaron 100.15 y del origen salieron 100.30.

      La razón es que **el core calcula el impuesto de forma intrínseca y lo
      cobra en un movimiento aparte**, así que interpreta lo que recibe como el
      monto a transferir. Mandarle el total infla lo que el beneficiario cobra
      y hace que el impuesto se calcule encima de esa cifra inflada. En una
      transferencia a un tercero eso significa mandarle más dinero del que el
      cliente escribió.

      La regla del banco es: **se envía el monto, y el impuesto solo se
      muestra**. Es lo que hacía la app Flutter, que en este punto tenía razón.
    */
    const datos = base({
      monto: 1000,
      comisiones: { comision: 25, impuesto: 89.25 },
    });

    expect(ordenDeLaTransferencia(datos).monto).toBe(1000);
    expect(ordenDeLaTransferencia(datos).monto).not.toBe(totalDebitado(datos));
  });

  it('el total debitado sigue existiendo, pero para enseñarlo, no para enviarlo', () => {
    /*
      Las dos mitades de la regla, juntas en una prueba para que nadie
      «simplifique» eliminando una: el cliente tiene que ver cuánto va a salir
      de su cuenta de verdad —1.114,25—, y al core se le manda 1.000.
    */
    const datos = base({
      monto: 1000,
      comisiones: { comision: 25, impuesto: 89.25 },
    });

    expect(totalDebitado(datos)).toBe(1_114.25);
    expect(ordenDeLaTransferencia(datos).monto).toBe(1000);
  });

  it('sin comisión ni impuesto la orden lleva el monto, como siempre', () => {
    // El caso corriente: la mayoría de las transferencias no cobran nada, y
    // ahí las dos cifras coinciden.
    expect(ordenDeLaTransferencia(base({ monto: 1000 })).monto).toBe(1000);
  });

  it('en una transferencia cruzada viaja lo convertido, sin los cargos', () => {
    /*
      El cliente pide enviar US$ 1.000 y de su cuenta en pesos salen 59.500 de
      conversión; la comisión y el impuesto se le enseñan aparte y **no entran
      en la orden**, porque el core los aplica él. Lo que viaja es lo que el
      beneficiario debe recibir.
    */
    const datos = base({
      beneficiario: beneficiario({ codigoMoneda: '840' }),
      cotizacion: { montoConvertido: 59_500, tasa: '59.50' },
      comisiones: { comision: 25, impuesto: 89.25 },
    });

    expect(ordenDeLaTransferencia(datos).monto).toBe(59_500);
    expect(totalDebitado(datos)).toBe(59_614.25);
  });

  it('un comentario vacío no viaja', () => {
    // El backend lo trataría como un comentario escrito en blanco.
    expect(ordenDeLaTransferencia(base()).comentario).toBeUndefined();
    expect(
      ordenDeLaTransferencia(base({ comentario: 'Renta' })).comentario,
    ).toBe('Renta');
  });
});

describe('la huella describe la orden que se va a enviar', () => {
  /*
    `cuerpoDe` no toca la red: es la traducción de la orden a la petición. Se
    construye el repositorio con un cliente vacío porque aquí no se usa, y así
    la prueba recorre exactamente el mismo camino que la pantalla.
  */
  const repositorio = new TransferRepository({} as never);

  it('cambiar el monto en el asistente cambia la huella', () => {
    // Es la propiedad que hace que una autorización de RD$ 100 no sirva para
    // mover RD$ 100.000.
    const unaCosa = huellaDeTransferencia(
      repositorio.cuerpoDe(ordenDeLaTransferencia(base({ monto: 100 }))),
      '80191',
    );
    const otraCosa = huellaDeTransferencia(
      repositorio.cuerpoDe(ordenDeLaTransferencia(base({ monto: 100_000 }))),
      '80191',
    );

    expect(unaCosa).not.toBe(otraCosa);
  });

  it('en una transferencia cruzada se firma la moneda de origen', () => {
    // Regresión de la incompatibilidad con el backend: el original firma la
    // del destino y el backend recalcula con la del origen.
    const cuerpo = repositorio.cuerpoDe(
      ordenDeLaTransferencia(
        base({
          beneficiario: beneficiario({ codigoMoneda: '840' }),
          cotizacion: { montoConvertido: 59_500, tasa: '59.50' },
        }),
      ),
    );

    expect(cuerpo.sourceTransactionCurrency).toBe(214);
    expect(cuerpo.targetTransactionCurrency).toBe(840);
  });

  it('la huella del repositorio es la del cuerpo, no la de la pantalla', () => {
    const orden = ordenDeLaTransferencia(base());

    expect(repositorio.huellaDe(orden, '80191')).toBe(
      huellaDeTransferencia(repositorio.cuerpoDe(orden), '80191'),
    );
  });
});
