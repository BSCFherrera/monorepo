import type { BannerTone, IconName } from '@bsc/contracts';

/**
 * El aviso que la pantalla de Seguridad enseña tras una acción.
 *
 * **Existe por un defecto, y el defecto explica la forma.** La pantalla
 * guardaba el aviso como una cadena suelta y pintaba la banda con el tono, el
 * icono y el título escritos a mano en el JSX. Todo lo que pasaba por ahí
 * salía en rojo bajo «No se pudo completar», así que el mensaje que anuncia el
 * enrolamiento conseguido —el momento más importante de esta pantalla— se le
 * presentaba al cliente como un fallo. Se vio en el Pixel al cerrar V-01.
 *
 * Guardar el tono junto al texto hace que **el que escribe el mensaje decida
 * cómo se lee**, que es quien sabe si le fue bien. Y al ser una función pura
 * queda cubierta por pruebas: dentro del componente no lo estaría, porque las
 * pruebas de componente exigen una dependencia nueva que hoy está bloqueada
 * por D-14.
 */

export type TonoDelAviso = 'exito' | 'error';

export interface AvisoDeSeguridad {
  tono: TonoDelAviso;
  texto: string;
}

export interface AvisoPresentado {
  tono: BannerTone;
  icono: IconName;
  titulo: string;
  subtitulo: string;
}

export function avisoDeExito(texto: string): AvisoDeSeguridad {
  return { tono: 'exito', texto };
}

export function avisoDeError(texto: string): AvisoDeSeguridad {
  return { tono: 'error', texto };
}

/**
 * Traduce el aviso a lo que la banda necesita.
 *
 * El icono cambia con el tono y no solo el color: un cliente que no distingue
 * el verde del rojo necesita otra señal, y la banda es la única confirmación
 * que recibe de que su teléfono quedó registrado.
 */
export function presentarAviso(aviso: AvisoDeSeguridad): AvisoPresentado {
  return aviso.tono === 'exito'
    ? {
        tono: 'success',
        icono: 'check-circle',
        titulo: 'Listo',
        subtitulo: aviso.texto,
      }
    : {
        tono: 'danger',
        icono: 'error',
        titulo: 'No se pudo completar',
        subtitulo: aviso.texto,
      };
}
