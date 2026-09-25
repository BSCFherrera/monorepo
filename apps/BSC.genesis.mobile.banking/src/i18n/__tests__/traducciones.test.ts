import * as fs from 'fs';
import * as path from 'path';

import {
  IDIOMAS,
  IDIOMA_POR_DEFECTO,
  clavesDe,
  compararTraducciones,
  t,
  textosVacios,
  type Idioma,
  type Recursos,
} from '@bsc/i18n';

import { RECURSOS } from '..';

/**
 * Que ningún texto llegue al cliente sin traducir.
 *
 * Hoy solo hay español, así que la comparación entre idiomas no tiene con qué
 * comparar todavía. Queda escrita para el día en que exista `en`: a partir de
 * ahí, una clave nueva en español sin su traducción rompe esta prueba.
 */
const CARPETA = path.join(__dirname, '../../locales');
const origen = RECURSOS[IDIOMA_POR_DEFECTO] as Recursos;

describe('traducciones', () => {
  it('cada archivo de src/locales/es está registrado en RECURSOS', () => {
    const archivos = fs
      .readdirSync(path.join(CARPETA, IDIOMA_POR_DEFECTO))
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace(/\.json$/, ''))
      .sort();
    // Un archivo sin registrar no se carga: sus textos saldrían como claves.
    expect(Object.keys(origen).sort()).toEqual(archivos);
  });

  it('ningún texto en español está vacío', () => {
    expect(textosVacios(origen)).toEqual([]);
  });

  it('los textos se resuelven: la app no muestra claves', () => {
    expect(t('auth:login.title')).toBe('Bienvenido');
    expect(t('auth:login.switchAccount', { name: 'Ana' })).toBe('¿No eres Ana? Cambiar cuenta');
  });

  const otros = (Object.keys(IDIOMAS) as Idioma[]).filter(i => i !== IDIOMA_POR_DEFECTO);

  it.each(otros.length > 0 ? otros : ['(ninguno todavía)'])(
    '%s tiene las mismas claves que el español',
    idioma => {
      if (!(idioma in IDIOMAS)) return;
      const traduccion = RECURSOS[idioma as Idioma] ?? {};
      expect(compararTraducciones(origen, traduccion)).toEqual({ faltan: [], sobran: [] });
      expect(textosVacios(traduccion)).toEqual([]);
    },
  );

  it.each(otros.length > 0 ? otros : ['(ninguno todavía)'])(
    '%s usa las mismas variables {{…}} que el español',
    idioma => {
      if (!(idioma in IDIOMAS)) return;
      const traduccion = RECURSOS[idioma as Idioma] ?? {};
      const variables = (texto: string): string[] =>
        [...texto.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map(m => m[1] ?? '').sort();
      for (const clave of clavesDe(origen)) {
        const [espacio, ruta] = clave.split(':') as [string, string];
        const leer = (r: Recursos): string =>
          String(ruta.split('.').reduce<unknown>((v, k) => (v as Record<string, unknown>)?.[k], r[espacio]) ?? '');
        // «¿No eres {{name}}?» sin {{name}} en la traducción perdería el nombre.
        expect({ clave, variables: variables(leer(traduccion)) }).toEqual({
          clave,
          variables: variables(leer(origen)),
        });
      }
    },
  );
});
