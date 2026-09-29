/**
 * Categorías de documento de identidad soportadas en el flujo de registro.
 * Fuente única de verdad: se usa tanto para el request de verificación de cliente
 * (`ChooseDocumentScreen`) como para decisiones posteriores del flujo que dependen del tipo de
 * documento (ej. exigir prueba de vida de Autentikar solo para cédula dominicana).
 */
export const DOCUMENT_CATEGORY = {
  CEDULA: 'cedula',
  PASSPORT: 'pasaporte',
} as const;
