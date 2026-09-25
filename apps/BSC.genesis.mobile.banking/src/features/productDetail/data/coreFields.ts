import { formatDateShort, parseCoreDate, repairEncoding } from '@bsc/shared';

/**
 * Lectura tolerante de los campos que manda el core.
 *
 * Los cuatro detalles de producto —cuenta, tarjeta, préstamo y certificado—
 * comparten el mismo problema: el core nombra los campos en español y
 * mayúsculas (`SAL_DISPONIBLE`, `FEC_VENCIMIENTO`) y el bus a veces los entrega
 * ya traducidos al inglés, con la forma cambiando según el endpoint. Cada
 * contrato busca por los dos nombres, y estas funciones son lo que comparten.
 *
 * Portadas de los ayudantes privados de `product_detail_models.dart`.
 */

export type Crudo = Record<string, unknown>;

/** El primer nombre que traiga algo. El orden es el del original. */
export function campo(fuente: Crudo, ...nombres: string[]): unknown {
  for (const nombre of nombres) {
    const valor = fuente[nombre];
    if (valor !== undefined && valor !== null) return valor;
  }
  return undefined;
}

/** Convierte a objeto lo que venga, sin lanzar. */
export function comoObjeto(crudo: unknown): Crudo {
  return typeof crudo === 'object' && crudo !== null ? (crudo as Crudo) : {};
}

/**
 * Texto que no vale la pena mostrar si viene vacío.
 *
 * Repara de paso los acentos que el core estropea («120 d¿as»), para que
 * ninguna pantalla tenga que saber de ese problema.
 */
export function textoOpcional(valor: unknown): string | undefined {
  if (valor === undefined || valor === null) return undefined;
  const texto = repairEncoding(String(valor)).trim();
  return texto === '' ? undefined : texto;
}

/**
 * Fecha del core convertida a `dd/MM/yyyy`, o nada si no vino.
 *
 * El original devuelve cadena vacía cuando el campo falta, y la pantalla la
 * compara contra nulo para decidir si dibuja la fila: como la cadena vacía no
 * es nula, imprime una fila con la etiqueta y el valor en blanco. Aquí se
 * devuelve `undefined`, que es lo que esa comparación quería decir.
 */
export function fechaOpcional(valor: unknown): string | undefined {
  const texto = textoOpcional(valor);
  if (texto === undefined) return undefined;

  const fecha = parseCoreDate(texto);
  // Si no se reconoce, se devuelve tal cual: el cliente prefiere ver algo raro
  // a ver un hueco, y es el mismo criterio que sigue `formatDate`.
  return fecha === null ? texto : formatDateShort(fecha);
}

/**
 * Número que conserva la diferencia entre «cero» y «no vino».
 *
 * El core manda nulo para las tasas que no tiene, y un cero ahí se leería como
 * una tasa real del 0 %.
 */
export function numeroOpcional(valor: unknown): number | undefined {
  if (valor === undefined || valor === null) return undefined;
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : undefined;
  }
  if (typeof valor === 'string') {
    const numero = Number.parseFloat(valor.trim().replace(/,/g, ''));
    return Number.isNaN(numero) ? undefined : numero;
  }
  return undefined;
}

/**
 * Entero que tolera que el core mande el plazo ya redactado.
 *
 * `PLAZO` llega a veces como `"150 días"` en vez de como `150`, y la conversión
 * normal devolvería el valor por defecto. El original extrae los dígitos del
 * principio, y hay que hacer lo mismo o el plazo del certificado sale en cero.
 */
export function enteroInicial(valor: unknown, porDefecto = 0): number {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? Math.trunc(valor) : porDefecto;
  }
  if (typeof valor === 'string') {
    const inicio = /^\s*(\d+)/.exec(valor);
    if (inicio !== null) return Number(inicio[1]);
    const numero = Number(valor.trim().replace(/,/g, ''));
    return Number.isFinite(numero) ? Math.trunc(numero) : porDefecto;
  }
  return porDefecto;
}
