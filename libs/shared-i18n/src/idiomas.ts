/**
 * Los idiomas de la aplicación.
 *
 * **Hoy solo existe el español**, y es el idioma de origen: todo texto se
 * escribe primero en `locales/es` y los demás se traducen desde ahí. Añadir un
 * idioma es añadir su entrada aquí y sus archivos en `locales/<idioma>`; el
 * selector de idioma lista lo que haya en este objeto, así que no hay que
 * tocar ninguna pantalla.
 *
 * `nombre` va escrito en el propio idioma («English», no «Inglés»): es como se
 * reconoce el cliente que no entiende el idioma actual de la app.
 */
export const IDIOMAS = {
  es: { nombre: 'Español' },
} as const;

export type Idioma = keyof typeof IDIOMAS;

export const IDIOMA_POR_DEFECTO: Idioma = 'es';

export function esIdioma(valor: unknown): valor is Idioma {
  return typeof valor === 'string' && Object.prototype.hasOwnProperty.call(IDIOMAS, valor);
}
