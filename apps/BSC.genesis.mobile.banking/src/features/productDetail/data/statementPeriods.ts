import { parseCoreDate } from '@bsc/shared';

/**
 * Los meses cerrados de los que se puede pedir un estado de cuenta.
 *
 * Portado de `StatementPeriod.generate` en `account_statement.dart`, que a su
 * vez reproduce el `EstadoCuentaList` del portal web.
 *
 * Tres reglas del original, y las tres se notan si se rompen:
 *
 *  - **El mes en curso no se lista.** Su ciclo no ha cerrado y el core devuelve
 *    un PDF vacío: el cliente descargaría un archivo en blanco sin entender por
 *    qué. Se empieza siempre por el mes anterior.
 *  - **No se listan meses anteriores a la apertura del producto**, por lo mismo.
 *  - Cuando el producto se abrió a mitad de mes, ese primer período **arranca el
 *    día de apertura**, no el día uno, porque es lo que el estado va a cubrir.
 */

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

/** El nombre del mes, de 1 a 12, como lo escribe el original. */
export function nombreDelMes(mes: number): string {
  return MESES[mes - 1] ?? '';
}

export interface MesConEstadoDeCuenta {
  /** «Agosto 2026». */
  etiqueta: string;
  /** «01/08/2026 - 31/08/2026». */
  rango: string;
  /** De 1 a 12, que es como lo pide el core. */
  mes: number;
  anio: number;
  desde: Date;
  hasta: Date;
}

function conDosDigitos(valor: number): string {
  return String(valor).padStart(2, '0');
}

/** `dd/MM/yyyy`, el formato que el original enseña en la lista. */
function comoDiaMesAnio(fecha: Date): string {
  return `${conDosDigitos(fecha.getDate())}/${conDosDigitos(
    fecha.getMonth() + 1,
  )}/${fecha.getFullYear()}`;
}

export function mesesConEstadoDeCuenta(opciones?: {
  hoy?: Date;
  /** Fecha de apertura del producto, si se conoce. */
  apertura?: Date | undefined;
  cuantos?: number;
}): MesConEstadoDeCuenta[] {
  const hoy = opciones?.hoy ?? new Date();
  const cuantos = opciones?.cuantos ?? 6;
  const apertura = opciones?.apertura;

  const meses: MesConEstadoDeCuenta[] = [];

  for (let atras = 1; atras <= cuantos; atras += 1) {
    // El constructor de `Date` normaliza los meses negativos, así que el paso
    // de enero a diciembre del año anterior sale solo.
    const referencia = new Date(hoy.getFullYear(), hoy.getMonth() - atras, 1);
    const primerDia = new Date(
      referencia.getFullYear(),
      referencia.getMonth(),
      1,
    );
    // El día cero del mes siguiente es el último del mes en curso: así no hay
    // que saberse cuáles tienen treinta días ni qué febreros son bisiestos.
    const ultimoDia = new Date(
      referencia.getFullYear(),
      referencia.getMonth() + 1,
      0,
    );

    // El mes entero es anterior al producto.
    if (apertura !== undefined && ultimoDia < apertura) continue;

    // Abierto a mitad de mes. El original compara con «antes del último día» y
    // deja fuera al producto abierto justo ese día, cuyo rango pasaría a
    // declarar un mes completo que el cliente no tuvo.
    const desde =
      apertura !== undefined && apertura > primerDia && apertura <= ultimoDia
        ? apertura
        : primerDia;

    meses.push({
      etiqueta: `${nombreDelMes(
        referencia.getMonth() + 1,
      )} ${referencia.getFullYear()}`,
      rango: `${comoDiaMesAnio(desde)} - ${comoDiaMesAnio(ultimoDia)}`,
      mes: referencia.getMonth() + 1,
      anio: referencia.getFullYear(),
      desde,
      hasta: ultimoDia,
    });
  }

  return meses;
}

/**
 * Con qué ciclo abre la hoja de estado de cuenta.
 *
 * **La tarjeta informa su propia fecha de corte**, y abrir por ese ciclo es
 * mejor que suponer «el mes pasado»: una tarjeta que corta el día 25 tiene su
 * último estado cerrado en un mes distinto al que diría el calendario. Cuando
 * el core no manda la fecha —o manda algo que no se entiende— se retrocede un
 * mes, que es lo que hace el original.
 */
export function cicloDelCorte(
  fechaDeCorte: string | undefined,
  hoy: Date = new Date(),
): { mes: number; anio: number } {
  if (fechaDeCorte !== undefined && fechaDeCorte !== '') {
    const corte = parseCoreDate(fechaDeCorte);
    if (corte !== null) {
      return { mes: corte.getMonth() + 1, anio: corte.getFullYear() };
    }
  }

  const anterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  return { mes: anterior.getMonth() + 1, anio: anterior.getFullYear() };
}
