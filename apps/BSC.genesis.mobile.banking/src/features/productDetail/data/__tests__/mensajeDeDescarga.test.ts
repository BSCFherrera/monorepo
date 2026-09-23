import {
  esTiempoDeEsperaAgotado,
  mensajeDeDescargaFallida,
  SEGUNDOS_DE_ESPERA,
} from '../mensajeDeDescarga';

/**
 * Regresión: **el mes sin datos dejaba treinta segundos de silencio y después
 * un mensaje que no decía nada**.
 *
 * Se vio en el Pixel al cerrar V-10. El estado de cuenta de un mes sin
 * movimientos no responde, la petición cae por tiempo de espera agotado y el
 * cliente leía «No pudimos descargar el estado de cuenta. Intenta de nuevo.»,
 * que le invita a repetir lo mismo con el mismo resultado. En este ambiente la
 * data llega hasta enero de 2026 y la hoja ofrece los últimos seis meses, así
 * que los seis se comportan igual.
 *
 * El origen no se arregla desde el canal (P-03). Lo que sí se puede es dejar
 * de llamar «algo salió mal» a un banco que no contestó.
 */

/** Un error de Axios por tiempo de espera: no trae `response`. */
const porTiempo = (code: string): unknown => ({
  code,
  message: `timeout of ${SEGUNDOS_DE_ESPERA * 1000}ms exceeded`,
  isAxiosError: true,
});

/** Un rechazo del servidor: sí trae `response`. */
const delServidor = (mensaje: string): unknown => ({
  response: { data: { Message: mensaje } },
  message: 'Request failed with status code 400',
});

describe('esTiempoDeEsperaAgotado', () => {
  it('reconoce el código de Axios', () => {
    expect(esTiempoDeEsperaAgotado(porTiempo('ECONNABORTED'))).toBe(true);
    expect(esTiempoDeEsperaAgotado(porTiempo('ETIMEDOUT'))).toBe(true);
  });

  it('lo reconoce también sin código, por el texto y la falta de respuesta', () => {
    expect(esTiempoDeEsperaAgotado({ message: 'timeout exceeded' })).toBe(true);
  });

  it('no confunde un rechazo del servidor con un tiempo agotado', () => {
    // Este sí llegó: el servidor contestó. Decirle al cliente que el banco no
    // respondió sería mentirle en la otra dirección.
    expect(esTiempoDeEsperaAgotado(delServidor('Cuenta no válida'))).toBe(
      false,
    );
  });

  it('aguanta un fallo que no es un error de red', () => {
    expect(esTiempoDeEsperaAgotado(undefined)).toBe(false);
    expect(esTiempoDeEsperaAgotado(null)).toBe(false);
    expect(esTiempoDeEsperaAgotado(new Error('vaya'))).toBe(false);
  });
});

describe('mensajeDeDescargaFallida', () => {
  it('nombra la espera, el mes y la causa probable', () => {
    const mensaje = mensajeDeDescargaFallida(
      porTiempo('ECONNABORTED'),
      'Enero 2026',
    );

    expect(mensaje).toContain(`${SEGUNDOS_DE_ESPERA} segundos`);
    expect(mensaje).toContain('Enero 2026');
    expect(mensaje).toContain('sin movimientos');
    // Y no le promete que repetir lo arregle.
    expect(mensaje).not.toContain('Intenta de nuevo');
  });

  it('conserva el mensaje del servidor cuando el servidor habló', () => {
    expect(
      mensajeDeDescargaFallida(delServidor('Cuenta no válida'), 'Enero 2026'),
    ).toBe('Cuenta no válida');
  });

  it('cae al mensaje genérico solo cuando no hay nada mejor', () => {
    expect(mensajeDeDescargaFallida(new Error('vaya'), 'Enero 2026')).toBe(
      'No pudimos descargar el estado de cuenta. Intenta de nuevo.',
    );
  });
});
