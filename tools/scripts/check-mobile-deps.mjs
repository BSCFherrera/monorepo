#!/usr/bin/env node
/**
 * Dependencias compartidas de las apps móviles.
 *
 *     pnpm deps:check   # falla si algo se sale de la regla
 *     pnpm deps:sync    # corrige lo que se puede corregir solo y vuelve a comprobar
 *
 * Las apps React Native del monorepo deben ser compatibles entre sí: mismas
 * dependencias y en la misma versión. La versión la fija el catálogo de pnpm
 * (`pnpm-workspace.yaml`); este chequeo vigila lo que pnpm no vigila:
 *
 *  1. Ningún paquete de `apps/**` o `libs/**` escribe una versión de terceros:
 *     usa `"catalog:"` (o `workspace:` para los paquetes propios). Una versión
 *     escrita a mano es justo cómo dos apps terminan con dos React Natives.
 *  2. Todo `catalog:` apunta a una entrada que existe.
 *  3. Todas las apps React Native (`apps/<nombre>` con `react-native` en
 *     `dependencies`) declaran **el mismo conjunto** de dependencias de
 *     terceros, sección por sección. Importa sobre todo para los módulos
 *     nativos: la CLI de React Native solo enlaza las dependencias directas de
 *     cada app, así que una que falte compila pero falla en tiempo de ejecución.
 *     Los paquetes propios (`workspace:`) quedan fuera: cada app puede tener
 *     los suyos, como `@bsc/shared`.
 *
 * `--fix` cambia a `catalog:` las versiones escritas a mano que ya tienen
 * entrada en el catálogo y añade a cada app las dependencias que le faltan
 * respecto de las demás. Lo que no tiene entrada en el catálogo no lo inventa:
 * hay que añadirlo a `pnpm-workspace.yaml` y después correr `pnpm install`.
 *
 * Ver docs/mobile/dependencias-compartidas.md.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import process from 'node:process';

import {
  SECCIONES,
  carpetasDePaquetes,
  leerWorkspace,
  raizDelWorkspace,
} from './pnpm-catalog.mjs';

/** Secciones que se exigen iguales entre apps; `peerDependencies` no aplica a una app. */
const SECCIONES_DE_APP = ['dependencies', 'devDependencies'];

const corregir = process.argv.includes('--fix');
const raiz = raizDelWorkspace();
const { paquetes: patrones, catalogo } = leerWorkspace(raiz);

const esPropio = especificador => especificador.startsWith('workspace:');
const esCatalogo = especificador =>
  especificador === 'catalog:' || especificador === 'catalog:default';

const paquetes = carpetasDePaquetes(raiz, patrones).map(carpeta => {
  const archivo = join(carpeta, 'package.json');
  const texto = readFileSync(archivo, 'utf8');
  return {
    ruta: relative(raiz, carpeta).split(sep).join('/'),
    archivo,
    saltoDeLinea: texto.includes('\r\n') ? '\r\n' : '\n',
    manifiesto: JSON.parse(texto),
    modificado: false,
  };
});

const apps = paquetes.filter(
  p => /^apps\/[^/]+$/.test(p.ruta) && p.manifiesto.dependencies?.['react-native'] !== undefined,
);

/** @type {string[]} */
const errores = [];
/** @type {string[]} */
const avisos = [];
/** @type {string[]} */
const correcciones = [];

// 1 y 2 — versiones de terceros siempre desde el catálogo.
for (const paquete of paquetes) {
  for (const seccion of SECCIONES) {
    for (const [nombre, especificador] of Object.entries(paquete.manifiesto[seccion] ?? {})) {
      if (esPropio(especificador)) continue;

      if (esCatalogo(especificador)) {
        if (catalogo[nombre] === undefined) {
          errores.push(
            `${paquete.ruta}: ${seccion}.${nombre} usa catalog: pero no está en el catálogo ` +
              `de pnpm-workspace.yaml.`,
          );
        }
        continue;
      }

      if (corregir && catalogo[nombre] !== undefined) {
        paquete.manifiesto[seccion][nombre] = 'catalog:';
        paquete.modificado = true;
        correcciones.push(
          `${paquete.ruta}: ${seccion}.${nombre} «${especificador}» → catalog: ` +
            `(${catalogo[nombre]})`,
        );
        continue;
      }

      errores.push(
        `${paquete.ruta}: ${seccion}.${nombre} escribe «${especificador}» en vez de catalog:` +
          (catalogo[nombre] === undefined
            ? ' — añade la entrada al catálogo de pnpm-workspace.yaml.'
            : ` — el catálogo fija ${catalogo[nombre]}; corre pnpm deps:sync.`),
      );
    }
  }
}

// 3 — todas las apps React Native declaran las mismas dependencias de terceros.
const deTerceros = (manifiesto, seccion) =>
  Object.entries(manifiesto[seccion] ?? {})
    .filter(([, especificador]) => !esPropio(especificador))
    .map(([nombre]) => nombre);

for (const seccion of SECCIONES_DE_APP) {
  const union = new Set(apps.flatMap(app => deTerceros(app.manifiesto, seccion)));

  for (const app of apps) {
    const propias = new Set(deTerceros(app.manifiesto, seccion));
    const faltan = [...union].filter(nombre => !propias.has(nombre)).sort();
    if (faltan.length === 0) continue;

    const otra = seccion === 'dependencies' ? 'devDependencies' : 'dependencies';
    const enOtraSeccion = faltan.filter(nombre => app.manifiesto[otra]?.[nombre] !== undefined);
    if (enOtraSeccion.length > 0) {
      errores.push(
        `${app.ruta}: ${enOtraSeccion.join(', ')} está en ${otra} y las demás apps lo tienen ` +
          `en ${seccion}; muévelo a mano (no se corrige solo).`,
      );
    }

    const pendientes = faltan.filter(nombre => !enOtraSeccion.includes(nombre));
    // Sin entrada en el catálogo no se copia: se esparciría un error a otra app.
    // Ya se reporta en la regla 2 para la app que la declara.
    const agregables = pendientes.filter(nombre => catalogo[nombre] !== undefined);
    if (agregables.length === 0) continue;

    if (corregir) {
      const seccionActual = { ...(app.manifiesto[seccion] ?? {}) };
      for (const nombre of agregables) seccionActual[nombre] = 'catalog:';
      app.manifiesto[seccion] = Object.fromEntries(
        Object.entries(seccionActual).sort(([a], [b]) => a.localeCompare(b)),
      );
      app.modificado = true;
      correcciones.push(`${app.ruta}: añadidas a ${seccion}: ${agregables.join(', ')}`);
    } else {
      errores.push(
        `${app.ruta}: le faltan en ${seccion} (las declara otra app móvil): ` +
          `${agregables.join(', ')} — corre pnpm deps:sync.`,
      );
    }
  }
}

// Entradas del catálogo que nadie usa: no rompen nada, pero confunden.
const usadas = new Set(
  paquetes.flatMap(p =>
    SECCIONES.flatMap(seccion =>
      Object.entries(p.manifiesto[seccion] ?? {})
        .filter(([, especificador]) => esCatalogo(especificador))
        .map(([nombre]) => nombre),
    ),
  ),
);
for (const nombre of Object.keys(catalogo)) {
  if (!usadas.has(nombre)) avisos.push(`El catálogo tiene «${nombre}» y ningún paquete lo usa.`);
}

for (const paquete of paquetes.filter(p => p.modificado)) {
  const texto = `${JSON.stringify(paquete.manifiesto, null, 2)}\n`;
  writeFileSync(paquete.archivo, texto.replace(/\n/g, paquete.saltoDeLinea), 'utf8');
}

console.log(
  `\n  Apps React Native: ${apps.map(a => a.ruta).join(', ') || 'ninguna'}` +
    `\n  Paquetes revisados: ${paquetes.length} · entradas del catálogo: ${Object.keys(catalogo).length}\n`,
);
for (const linea of correcciones) console.log(`  ✔ ${linea}`);
for (const linea of avisos) console.log(`  ⚠ ${linea}`);
for (const linea of errores) console.error(`  ✖ ${linea}`);

if (correcciones.length > 0) {
  console.log('\n  Se modificaron package.json: corre `pnpm install` para actualizar el lockfile.');
}

if (errores.length > 0) {
  console.error(`\n  ${errores.length} problema(s) con las dependencias compartidas.\n`);
  process.exit(1);
}

console.log('  Dependencias compartidas al día.\n');
