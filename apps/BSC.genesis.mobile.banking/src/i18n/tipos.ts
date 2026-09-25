/**
 * Los tipos de las claves de traducción.
 *
 * Con esto `t('auth:login.title')` se comprueba al compilar: una clave mal
 * escrita o que no existe en español es un error de `typecheck`, no un texto
 * crudo en la pantalla del cliente. Cada archivo nuevo de `src/locales/es` se
 * añade aquí.
 *
 * Es `.ts` y no `.d.ts` a propósito: con `skipLibCheck` TypeScript no revisa
 * los `.d.ts`, ni siquiera los del proyecto, y un error aquí dejaría las claves
 * sin comprobar sin avisar. Por lo mismo la app declara `i18next` como
 * dependencia de desarrollo: la ampliación tiene que apuntar al mismo módulo
 * que usa `@bsc/i18n`.
 */
import 'i18next';

import type auth from '../locales/es/auth.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: (typeof import('@bsc/i18n'))['comunEs'];
      auth: typeof auth;
    };
  }
}

export {};
