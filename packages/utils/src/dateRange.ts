/**
 * Rangos de fechas para consultar movimientos y comprobantes.
 *
 * Portado de `bsc_date_range_sheet.dart`, donde los atajos viven dentro de la
 * hoja. Aquí la aritmética se separa del componente porque es la parte que
 * puede equivocarse en silencio: un rango mal calculado no rompe la pantalla,
 * solo devuelve los movimientos de otro período.
 *
 * **Todo se construye con el constructor local de `Date`**, nunca con
 * `new Date('2026-05-27')`. Esa forma interpreta la cadena como medianoche UTC
 * y en República Dominicana (UTC-4) devuelve el día anterior; ya nos costó un
 * defecto en `formatters.ts`.
 */

import type {
  DateRange,
  DraftDateRange,
  PeriodPreset,
  PresetDays,
} from '@bsc/contracts';

export const PERIOD_PRESETS: readonly {
  key: PeriodPreset;
  label: string;
}[] = [
  { key: 'last30Days', label: '30 días' },
  { key: 'last60Days', label: '60 días' },
  { key: 'last90Days', label: '90 días' },
  { key: 'thisMonth', label: 'Este mes' },
  { key: 'lastMonth', label: 'Mes pasado' },
  { key: 'thisYear', label: 'Este año' },
];

const ATAJO_POR_DIAS: Record<PresetDays, PeriodPreset> = {
  30: 'last30Days',
  60: 'last60Days',
  90: 'last90Days',
};

/** Rango de una de las tres píldoras fijas. */
export function lastDaysRange(
  dias: PresetDays,
  hoy: Date = new Date(),
): DateRange {
  return presetRange(ATAJO_POR_DIAS[dias], hoy);
}

/** Descarta la hora y deja el día en hora local. */
export function startOfDay(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

/**
 * Resta días con `setDate`, que reajusta mes y año solo.
 *
 * Restar milisegundos parece equivalente y no lo es: en un cambio de horario de
 * verano el día tiene 23 o 25 horas y el resultado se corre un día.
 */
export function subtractDays(fecha: Date, dias: number): Date {
  const resultado = startOfDay(fecha);
  resultado.setDate(resultado.getDate() - dias);
  return resultado;
}

/**
 * Rango de un atajo.
 *
 * «30 días» son **treinta días contando hoy**, así que el desde es hoy menos
 * veintinueve. Es lo que la hoja del original calcula y lo que su propio
 * comentario dice que quiere; la píldora de la lista de movimientos, en cambio,
 * restaba treinta días completos y producía un rango de treinta y uno. Ver
 * `BscDateRangeSheet.tsx` para por qué se unificó en este criterio.
 */
export function presetRange(
  atajo: PeriodPreset,
  hoy: Date = new Date(),
): DateRange {
  const dia = startOfDay(hoy);
  const ano = dia.getFullYear();
  const mes = dia.getMonth();

  switch (atajo) {
    case 'last30Days':
      return { from: subtractDays(dia, 29), to: dia };
    case 'last60Days':
      return { from: subtractDays(dia, 59), to: dia };
    case 'last90Days':
      return { from: subtractDays(dia, 89), to: dia };
    case 'thisMonth':
      return { from: new Date(ano, mes, 1), to: dia };
    case 'lastMonth':
      // El día cero de este mes es el último del anterior, y así el mes de
      // veintiocho, veintinueve, treinta o treinta y uno sale solo.
      return { from: new Date(ano, mes - 1, 1), to: new Date(ano, mes, 0) };
    case 'thisYear':
      return { from: new Date(ano, 0, 1), to: dia };
  }
}

/** Dos rangos son el mismo si coinciden sus dos extremos al día. */
export function isSameRange(a: DateRange, b: DateRange): boolean {
  return (
    startOfDay(a.from).getTime() === startOfDay(b.from).getTime() &&
    startOfDay(a.to).getTime() === startOfDay(b.to).getTime()
  );
}

/**
 * Qué atajo describe este rango, si alguno.
 *
 * Sirve para que la hoja abra con la píldora correcta resaltada cuando el rango
 * vigente es justamente el de un atajo, en vez de mostrar seis apagadas.
 */
export function matchingPreset(
  rango: DateRange,
  hoy: Date = new Date(),
): PeriodPreset | null {
  for (const { key: clave } of PERIOD_PRESETS) {
    if (isSameRange(presetRange(clave, hoy), rango)) return clave;
  }
  return null;
}

/**
 * Hasta dónde hacia atrás se deja consultar: **un año**.
 *
 * Es el techo que fija el original en `transaction_list_section.dart`, y el
 * motivo por el que la app Flutter sí podía consultar más de noventa días. El
 * backend no impone ningún límite —reenvía las fechas al core tal cual— así que
 * el tope es una decisión del cliente y vive aquí, en un solo sitio.
 */
export function earliestSelectableDate(hoy: Date = new Date()): Date {
  const dia = startOfDay(hoy);
  return new Date(dia.getFullYear() - 1, dia.getMonth(), dia.getDate());
}

/** Días que tiene el mes. */
export function daysInMonth(ano: number, mes: number): number {
  return new Date(ano, mes + 1, 0).getDate();
}

/**
 * Cuántas celdas vacías van antes del día uno, con la semana empezando en
 * lunes.
 *
 * `getDay()` cuenta desde el domingo y el original ordena desde el lunes, que
 * es como se leen los calendarios en República Dominicana.
 */
export function leadingBlankDays(ano: number, mes: number): number {
  return (new Date(ano, mes, 1).getDay() + 6) % 7;
}

/**
 * La rejilla del mes: filas de siete, con `null` donde no hay día.
 *
 * Se calcula aparte del componente para poder probar los meses que empiezan en
 * domingo, los de veintiocho días y los bisiestos sin montar la interfaz.
 */
export function monthGrid(ano: number, mes: number): (number | null)[][] {
  const huecos = leadingBlankDays(ano, mes);
  const dias = daysInMonth(ano, mes);
  const filas = Math.ceil((huecos + dias) / 7);

  return Array.from({ length: filas }, (_vacio, fila) =>
    Array.from({ length: 7 }, (_celda, columna) => {
      const numero = fila * 7 + columna - huecos + 1;
      return numero >= 1 && numero <= dias ? numero : null;
    }),
  );
}

/**
 * Aplica el toque de un día al rango que se está componiendo.
 *
 * Reproduce la regla del original: el primer toque abre un rango nuevo, el
 * segundo lo cierra, y tocar un día anterior al extremo abierto **reabre** en
 * vez de producir un rango al revés. Es lógica pura para poder probar la
 * secuencia de toques sin tocar la pantalla.
 */
export function applyDayTap(
  actual: DraftDateRange,
  dia: Date,
): DraftDateRange {
  const tocado = startOfDay(dia);

  if (actual.to !== null) return { from: tocado, to: null };
  if (tocado.getTime() < startOfDay(actual.from).getTime()) {
    return { from: tocado, to: null };
  }
  return { from: actual.from, to: tocado };
}
