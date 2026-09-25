import { type Recursos } from './instancia';

/** Cada texto de un árbol de traducciones, con su clave: `auth:login.titulo`. */
function textosDe(recursos: Recursos): Array<[clave: string, texto: unknown]> {
  const pares: Array<[string, unknown]> = [];
  const recorrer = (valor: unknown, ruta: string): void => {
    if (valor !== null && typeof valor === 'object') {
      for (const [k, v] of Object.entries(valor)) recorrer(v, ruta.endsWith(':') ? ruta + k : `${ruta}.${k}`);
    } else {
      pares.push([ruta, valor]);
    }
  };
  for (const [espacio, textos] of Object.entries(recursos)) recorrer(textos, `${espacio}:`);
  return pares;
}

/** Todas las claves de un árbol de textos, ordenadas: `auth:login.titulo`. */
export function clavesDe(recursos: Recursos): string[] {
  return textosDe(recursos)
    .map(([clave]) => clave)
    .sort();
}

/**
 * Qué le falta y qué le sobra a una traducción respecto del español.
 *
 * Es la prueba que evita que llegue al cliente una pantalla con un texto sin
 * traducir. Con un solo idioma no compara nada todavía; cuando exista el
 * inglés, cada clave nueva en español sin su traducción rompe la prueba.
 */
export function compararTraducciones(
  origen: Recursos,
  traduccion: Recursos,
): { faltan: string[]; sobran: string[] } {
  const a = new Set(clavesDe(origen));
  const b = new Set(clavesDe(traduccion));
  return {
    faltan: [...a].filter(k => !b.has(k)),
    sobran: [...b].filter(k => !a.has(k)),
  };
}

/** Claves cuyo texto está vacío: una traducción a medias que se ve en blanco. */
export function textosVacios(recursos: Recursos): string[] {
  return textosDe(recursos)
    .filter(([, texto]) => typeof texto !== 'string' || texto.trim() === '')
    .map(([clave]) => clave);
}
