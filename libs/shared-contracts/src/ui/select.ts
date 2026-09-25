/** Una opción de una lista de selección. */

export interface SelectOption<T> {
  key: string;
  label: string;
  /** Segunda línea: el código SWIFT de un banco, por ejemplo. */
  detail?: string | undefined;
  value: T;
}
