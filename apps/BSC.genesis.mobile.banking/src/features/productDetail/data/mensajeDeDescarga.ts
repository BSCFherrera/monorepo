import { TIMEOUT_MS } from '../../../core/network/apiClient';
import { mensajeDeError } from '../../../core/network/envelopes';

/**
 * Qué se le dice al cliente cuando la descarga de un estado de cuenta falla.
 *
 * **Por qué hace falta distinguir.** Un mes sin movimientos no responde: la
 * petición se queda colgada los treinta segundos completos del tiempo de
 * espera y después cae por agotamiento, de modo que el cliente ve medio minuto
 * de silencio y luego un «Intenta de nuevo» que le invita a repetir
 * exactamente lo mismo, con el mismo resultado. Se comprobó en el Pixel: en
 * este ambiente **la data llega hasta enero de 2026** y la hoja ofrece los
 * últimos seis meses, así que los seis se comportan así.
 *
 * No se puede arreglar el origen desde el canal (P-03), pero sí se puede
 * dejar de mentir sobre lo que pasó. Un tiempo de espera agotado no es «algo
 * salió mal»: es el banco sin responder, y conviene decirlo con esas palabras
 * y sin prometer que reintentar lo arregle.
 */
export function esTiempoDeEsperaAgotado(causa: unknown): boolean {
  const error = causa as
    | { code?: string; message?: string; response?: unknown }
    | undefined;
  if (error === undefined || error === null) return false;

  // Axios marca el agotamiento con `ECONNABORTED` y, en versiones recientes,
  // `ETIMEDOUT`. Se comprueban los dos y, como red de seguridad, el texto:
  // una respuesta del servidor siempre trae `response`, y esta nunca lo trae.
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return true;

  return (
    error.response === undefined &&
    typeof error.message === 'string' &&
    /timeout|timed out/i.test(error.message)
  );
}

/** Los segundos que el cliente estuvo esperando, para poder nombrarlos. */
export const SEGUNDOS_DE_ESPERA = Math.round(TIMEOUT_MS / 1000);

export function mensajeDeDescargaFallida(
  causa: unknown,
  etiquetaDelMes: string,
): string {
  if (esTiempoDeEsperaAgotado(causa)) {
    return (
      `El banco no respondió en ${SEGUNDOS_DE_ESPERA} segundos para ` +
      `${etiquetaDelMes}. Suele pasar con un mes sin movimientos; prueba con ` +
      `otro mes o vuelve más tarde.`
    );
  }

  return mensajeDeError(
    causa,
    'No pudimos descargar el estado de cuenta. Intenta de nuevo.',
  );
}
