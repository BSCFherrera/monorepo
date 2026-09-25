import { extraerPdfEnBase64, nombreDelArchivoDeEstado } from '../statementPdf';

/**
 * El PDF del estado de cuenta llega dentro del sobre `Result<T>` del backend, y
 * el original conoce cuatro formas distintas de encontrarlo. Portadas de
 * `_extractBase64Pdf` en `product_detail_remote_datasource.dart`.
 */

const BASE64 = 'JVBERi0xLjQKJeLjz9MK';

describe('extraer el PDF del sobre del backend', () => {
  it('lo encuentra cuando el sobre lleva la cadena directamente', () => {
    expect(extraerPdfEnBase64({ Value: BASE64 })).toBe(BASE64);
    expect(extraerPdfEnBase64({ value: BASE64 })).toBe(BASE64);
  });

  it('lo encuentra anidado bajo AccountStatementPdf', () => {
    expect(
      extraerPdfEnBase64({
        Value: { AccountStatementPdf: { StatementPdf: BASE64 } },
      }),
    ).toBe(BASE64);

    expect(
      extraerPdfEnBase64({
        value: { accountStatementPdf: { statementPdf: BASE64 } },
      }),
    ).toBe(BASE64);
  });

  it('lo encuentra como campo directo del contenido', () => {
    expect(extraerPdfEnBase64({ Value: { StatementPdf: BASE64 } })).toBe(
      BASE64,
    );
    expect(extraerPdfEnBase64({ Value: { statementPdf: BASE64 } })).toBe(
      BASE64,
    );
    expect(extraerPdfEnBase64({ Value: { pdf: BASE64 } })).toBe(BASE64);
  });

  it('acepta la respuesta entregada como cadena, con o sin sobre', () => {
    expect(extraerPdfEnBase64(BASE64)).toBe(BASE64);
    expect(extraerPdfEnBase64(JSON.stringify({ Value: BASE64 }))).toBe(BASE64);
  });

  it('quita el prefijo de URI de datos si el bus lo agrega', () => {
    expect(
      extraerPdfEnBase64({ Value: `data:application/pdf;base64,${BASE64}` }),
    ).toBe(BASE64);
  });

  it('quita los saltos de línea con que algunos servicios parten el base64', () => {
    expect(extraerPdfEnBase64({ Value: 'JVBERi0x\r\nLjQKJeLj\nz9MK' })).toBe(
      BASE64,
    );
  });

  it('devuelve indefinido cuando no hay PDF, en vez de una cadena vacía', () => {
    // Una cadena vacía se guardaría como un archivo de cero bytes y el cliente
    // abriría un PDF roto sin ningún aviso.
    expect(extraerPdfEnBase64({ Value: { StatementPdf: '' } })).toBeUndefined();
    expect(extraerPdfEnBase64({ Value: {} })).toBeUndefined();
    expect(extraerPdfEnBase64({})).toBeUndefined();
    expect(extraerPdfEnBase64(null)).toBeUndefined();
    expect(extraerPdfEnBase64(undefined)).toBeUndefined();
    expect(extraerPdfEnBase64(42)).toBeUndefined();
  });

  it('un cuerpo que no es JSON válido no revienta la descarga', () => {
    expect(extraerPdfEnBase64('<html>error del bus</html>')).toBeUndefined();
  });
});

describe('nombre del archivo', () => {
  it('nombra el estado de una cuenta con mes y año', () => {
    expect(
      nombreDelArchivoDeEstado({
        tipo: 'cuenta',
        numeroDeProducto: '00112233445',
        mes: 8,
        anio: 2026,
      }),
    ).toBe('EstadoCuenta_3445_08_2026.pdf');
  });

  it('nombra el estado de una tarjeta con su propia raíz', () => {
    expect(
      nombreDelArchivoDeEstado({
        tipo: 'tarjeta',
        numeroDeProducto: '4023111122220668',
        mes: 12,
        anio: 2025,
      }),
    ).toBe('EstadoTarjeta_0668_12_2025.pdf');
  });

  it('nunca escribe el número completo del producto en el nombre', () => {
    // El original escribe el número entero, y ese nombre acaba en la hoja de
    // compartir y en el almacenamiento del teléfono. Aquí van cuatro dígitos.
    const nombre = nombreDelArchivoDeEstado({
      tipo: 'tarjeta',
      numeroDeProducto: '4023111122220668',
      mes: 1,
      anio: 2026,
    });

    expect(nombre).not.toContain('4023111122220668');
    expect(nombre).toBe('EstadoTarjeta_0668_01_2026.pdf');
  });

  it('un número corto se usa tal cual, sin rellenar', () => {
    expect(
      nombreDelArchivoDeEstado({
        tipo: 'cuenta',
        numeroDeProducto: '77',
        mes: 3,
        anio: 2026,
      }),
    ).toBe('EstadoCuenta_77_03_2026.pdf');
  });

  it('descarta cualquier carácter que no sirva en un nombre de archivo', () => {
    expect(
      nombreDelArchivoDeEstado({
        tipo: 'cuenta',
        numeroDeProducto: '001/22 33',
        mes: 3,
        anio: 2026,
      }),
    ).toBe('EstadoCuenta_2233_03_2026.pdf');
  });
});
