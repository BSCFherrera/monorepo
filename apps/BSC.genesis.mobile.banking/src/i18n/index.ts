/**
 * Las traducciones de la app.
 *
 * Importar este módulo las deja listas (lo hacen `App.tsx`, la vista previa web
 * y `jest.setup.js`, antes de cualquier pantalla). Cada funcionalidad tiene su
 * archivo en `src/locales/<idioma>/<funcionalidad>.json`; al añadir uno hay que
 * registrarlo en `RECURSOS`, y la prueba `traducciones.test.ts` avisa si se
 * olvida.
 *
 * Hoy solo hay español. Para añadir inglés: `en` en `IDIOMAS` de `@bsc/i18n`,
 * los archivos en `src/locales/en/` y su entrada aquí. Ver
 * `libs/shared-i18n/README.md`.
 */
import { iniciarTraducciones, type Idioma, type Recursos } from '@bsc/i18n';

import auth from '../locales/es/auth.json';

export const RECURSOS: Partial<Record<Idioma, Recursos>> = {
  es: { auth },
};

iniciarTraducciones(RECURSOS);

export { almacenDeIdioma } from './almacenDeIdioma';
