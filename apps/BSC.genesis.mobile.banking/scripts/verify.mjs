#!/usr/bin/env node
/**
 * Comando orquestador de verificación.
 *
 * Un solo comando que falla con código distinto de cero ante cualquier
 * incumplimiento, para que el pipeline y el desarrollador comprueben lo mismo.
 * Definido en `docs/migration/07-test-strategy.md` §6.
 *
 * Los pasos marcados como `pendiente` todavía no tienen herramienta conectada.
 * Aparecen a propósito en la salida en vez de omitirse en silencio: una lista
 * que oculta lo que falta da una falsa sensación de cobertura, que es
 * exactamente lo que este comando existe para evitar.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';

const esWindows = process.platform === 'win32';

/**
 * @typedef {Object} Paso
 * @property {string} nombre
 * @property {string} [comando]
 * @property {string[]} [args]
 * @property {string} [cwd]
 * @property {string} [pendiente] Motivo por el que aún no se ejecuta.
 */

/** @type {Paso[]} */
const PASOS = [
  {
    nombre: 'Formato (Prettier)',
    comando: 'npx',
    args: [
      'prettier',
      '--check',
      'src/**/*.{ts,tsx}',
      'packages/**/src/**/*.ts',
    ],
  },
  {
    nombre: 'Lint (ESLint)',
    comando: 'npx',
    args: ['eslint', '.', '--ext', '.js,.jsx,.ts,.tsx'],
  },
  {
    nombre: 'Tipos de la app (tsc estricto)',
    comando: 'npx',
    args: ['tsc', '--noEmit'],
  },
  {
    nombre: 'Tipos del paquete compartido',
    comando: 'npx',
    args: ['tsc', '--noEmit'],
    cwd: 'packages/bsc-shared',
  },
  {
    nombre: 'Pruebas del paquete compartido (con umbrales)',
    comando: 'npx',
    args: ['jest', '--coverage'],
    cwd: 'packages/bsc-shared',
  },
  {
    nombre: 'Pruebas de la app',
    comando: 'npx',
    args: ['jest', '--passWithNoTests'],
  },
  {
    nombre: 'Configuración de release',
    comando: 'node',
    args: ['scripts/verify-config.mjs'],
  },

  {
    nombre: 'Escaneo de secretos (T-10)',
    comando: 'node',
    args: ['scripts/escanear-secretos.mjs'],
  },
  {
    /*
      `pnpm audit` viene con pnpm: no añade dependencia. Se pide solo el nivel
      alto y crítico, porque un umbral que grita por todo se acaba ignorando,
      que es la peor forma de tener un control.
    */
    nombre: 'Vulnerabilidades de dependencias (SCA)',
    comando: 'pnpm',
    args: ['audit', '--audit-level=high', '--prod'],
  },
  {
    nombre: 'Inventario de dependencias (SBOM)',
    comando: 'node',
    args: ['scripts/generar-sbom.mjs', '--verificar'],
  },

  {
    nombre: 'Compilación limpia de Android',
    pendiente:
      'no se encadena aquí: tarda minutos y no se puede correr junto a Jest en esta laptop. ' +
      'Se ejecuta aparte con `pnpm run build:android`',
  },
  { nombre: 'Compilación de iOS', pendiente: 'requiere macOS — ver P-13' },
  {
    nombre: 'Pruebas de contrato contra esquemas',
    pendiente:
      'los contratos se prueban hoy contra respuestas reales capturadas; validar contra el ' +
      'Swagger exige un validador de esquemas, que es dependencia nueva (P-07)',
  },
  /*
    Esto decía «requiere @testing-library/react-native», y llevaba tiempo sin
    ser cierto: `react-test-renderer` **ya está declarado** y con él están
    escritas las suites de componente que corren en el paso de pruebas de
    arriba. Lo que sigue bloqueado es otra cosa, y más pequeña: `fireEvent`,
    `waitFor` y las búsquedas por rótulo accesible, que son las que hacen falta
    para **pulsar** un control y comprobar qué pasa. Hoy las pruebas de
    componente montan el árbol y lo inspeccionan, que cubre la composición y la
    presentación pero no la interacción.

    Se deja listado a propósito: una lista que oculta lo que falta da una falsa
    sensación de cobertura, y era exactamente lo que pasaba aquí.
  */
  {
    nombre: 'Pruebas de componentes con interacción',
    pendiente:
      'las de composición y presentación ya corren con `react-test-renderer`, que está ' +
      'declarado; falta poder **pulsar** un control y esperar el efecto, y eso sí exige ' +
      '@testing-library/react-native — dependencia nueva (D-14)',
  },
  {
    nombre: 'Pruebas E2E (Detox)',
    pendiente: 'requiere Detox — dependencia nueva (P-07)',
  },
  {
    nombre: 'SAST',
    pendiente: 'requiere una herramienta del sector en el pipeline (P-16)',
  },
  { nombre: 'Licencias', pendiente: 'requiere política institucional (P-07)' },
];

const inicio = Date.now();
const resultados = [];

console.log('\n  Verificación de BSC.genesis.mobile.banking');
console.log(`  ${new Date().toISOString()}`);
console.log(`  node ${process.version} · ${process.platform}\n`);

for (const paso of PASOS) {
  if (paso.pendiente) {
    resultados.push({
      nombre: paso.nombre,
      estado: 'pendiente',
      detalle: paso.pendiente,
    });
    console.log(`  …  ${paso.nombre} — pendiente: ${paso.pendiente}`);
    continue;
  }

  if (paso.cwd && !existsSync(paso.cwd)) {
    resultados.push({
      nombre: paso.nombre,
      estado: 'omitido',
      detalle: `no existe ${paso.cwd}`,
    });
    console.log(`  ·  ${paso.nombre} — omitido (no existe ${paso.cwd})`);
    continue;
  }

  process.stdout.write(`  ▶  ${paso.nombre} … `);

  const resultado = spawnSync(paso.comando, paso.args ?? [], {
    cwd: paso.cwd,
    shell: esWindows,
    encoding: 'utf8',
  });

  const ok = resultado.status === 0;
  resultados.push({ nombre: paso.nombre, estado: ok ? 'ok' : 'fallo' });
  console.log(ok ? 'OK' : 'FALLÓ');

  if (!ok) {
    const salida = `${resultado.stdout ?? ''}${resultado.stderr ?? ''}`.trim();
    console.log(
      `\n${salida
        .split('\n')
        .map(l => `     ${l}`)
        .join('\n')}\n`,
    );
  }
}

const fallidos = resultados.filter(r => r.estado === 'fallo');
const pendientes = resultados.filter(r => r.estado === 'pendiente');
const segundos = ((Date.now() - inicio) / 1000).toFixed(1);

console.log('\n  ─────────────────────────────────────────────');
console.log(
  `  ${resultados.filter(r => r.estado === 'ok').length} en verde · ` +
    `${fallidos.length} fallidos · ${pendientes.length} pendientes · ${segundos}s`,
);

if (fallidos.length > 0) {
  console.log('\n  Fallaron:');
  for (const f of fallidos) console.log(`    · ${f.nombre}`);
  console.log('');
  process.exit(1);
}

console.log('\n  Todo lo conectado está en verde.');
console.log(
  '  ⚠️  La verificación NO está completa mientras queden pasos pendientes.\n',
);
process.exit(0);
