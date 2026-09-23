/** Rangos de fechas: el tipo que viaja entre pantallas, repositorios y el backend. */

export interface DateRange {
  from: Date;
  to: Date;
}

/** Rango a medio componer en el selector: el extremo final aún puede faltar. */
export interface DraftDateRange {
  from: Date;
  to: Date | null;
}

/** Los seis atajos de la hoja del original, en su mismo orden. */
export type PeriodPreset =
  | 'last30Days'
  | 'last60Days'
  | 'last90Days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear';

/** Los tres atajos que además tienen píldora propia en la lista de movimientos. */
export type PresetDays = 30 | 60 | 90;
