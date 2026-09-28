/**
 * Lectura del catálogo de pnpm (`catalog:` en `pnpm-workspace.yaml`).
 *
 * El catálogo es la única fuente de versiones de las apps móviles y de las
 * libs que consumen: cada `package.json` escribe `"react-native": "catalog:"`
 * y pnpm resuelve la versión desde aquí. Lo usan el chequeo de dependencias
 * compartidas (`check-mobile-deps.mjs`) y el inventario de dependencias de
 * cada app (`scripts/generar-sbom.mjs`), que necesita el rango real y no la
 * palabra `catalog:`.
 *
 * Sin dependencias a propósito —ni un parser de YAML—: corre en cualquier
 * Node, antes incluso de `pnpm install`. Solo entiende lo que este repo usa:
 * la lista `packages:` y el catálogo por defecto `catalog:` como pares
 * `"nombre": "rango"`, uno por línea. Un catálogo con nombre (`catalogs:`) se
 * rechaza en vez de ignorarse en silencio.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export const SECCIONES = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

/** Sube desde `desde` hasta encontrar `pnpm-workspace.yaml`. */
export function raizDelWorkspace(desde = process.cwd()) {
  let actual = resolve(desde);
  for (;;) {
    if (existsSync(join(actual, 'pnpm-workspace.yaml'))) return actual;
    const padre = dirname(actual);
    if (padre === actual) {
      throw new Error(`No se encontró pnpm-workspace.yaml desde ${desde}`);
    }
    actual = padre;
  }
}

const sinComillas = texto => texto.trim().replace(/^["']|["']$/g, '');

/**
 * @returns {{ paquetes: string[], catalogo: Record<string, string> }}
 */
export function leerWorkspace(raiz = raizDelWorkspace()) {
  const lineas = readFileSync(join(raiz, 'pnpm-workspace.yaml'), 'utf8').split(/\r?\n/);

  /** @type {string[]} */
  const paquetes = [];
  /** @type {Record<string, string>} */
  const catalogo = {};
  let bloque = null;

  for (const linea of lineas) {
    const sinComentario = linea.replace(/\s+#.*$/, '').replace(/^\s*#.*$/, '');
    if (sinComentario.trim() === '') continue;

    if (/^\S/.test(sinComentario)) {
      bloque = sinComentario.replace(/:\s*$/, '').trim();
      if (bloque === 'catalogs') {
        throw new Error(
          'pnpm-workspace.yaml usa catálogos con nombre (`catalogs:`); ' +
            'tools/scripts/pnpm-catalog.mjs solo entiende el catálogo por defecto.',
        );
      }
      continue;
    }

    if (bloque === 'packages') {
      const elemento = sinComentario.match(/^\s+-\s+(.+)$/);
      if (elemento) paquetes.push(sinComillas(elemento[1]));
    } else if (bloque === 'catalog') {
      const par = sinComentario.match(/^\s+("[^"]+"|'[^']+'|[^\s:]+)\s*:\s*(.+)$/);
      if (!par) throw new Error(`Línea del catálogo no reconocida: «${linea.trim()}»`);
      catalogo[sinComillas(par[1])] = sinComillas(par[2]);
    }
  }

  return { paquetes, catalogo };
}

/**
 * Traduce un especificador de `package.json` al rango real.
 * `catalog:` y `catalog:default` salen del catálogo; lo demás se devuelve tal cual.
 */
export function rangoReal(nombre, especificador, catalogo) {
  if (especificador !== 'catalog:' && especificador !== 'catalog:default') return especificador;
  const rango = catalogo[nombre];
  if (rango === undefined) {
    throw new Error(`«${nombre}» usa catalog: pero no está en el catálogo de pnpm-workspace.yaml`);
  }
  return rango;
}

/**
 * Carpetas de los paquetes del workspace (sin la raíz), expandiendo los
 * patrones `carpeta/*` de `packages:`, que son los únicos que usa este repo.
 */
export function carpetasDePaquetes(raiz, patrones) {
  const carpetas = [];
  for (const patron of patrones) {
    if (!patron.endsWith('/*') || patron.slice(0, -2).includes('*')) {
      throw new Error(`Patrón de packages no soportado: «${patron}» (solo «carpeta/*»)`);
    }
    const base = join(raiz, patron.slice(0, -2));
    if (!existsSync(base)) continue;
    for (const entrada of readdirSync(base, { withFileTypes: true })) {
      if (entrada.isDirectory() && existsSync(join(base, entrada.name, 'package.json'))) {
        carpetas.push(join(base, entrada.name));
      }
    }
  }
  return carpetas;
}
