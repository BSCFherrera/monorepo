#!/usr/bin/env node
/**
 * Inventario de dependencias de la aplicación (SBOM, T-15).
 *
 *     node scripts/generar-sbom.mjs              # escribe docs/sbom.json
 *     node scripts/generar-sbom.mjs --verificar  # comprueba que está al día
 *
 * **Para qué sirve de verdad.** Cuando se publica una vulnerabilidad en un
 * paquete, la pregunta que hay que responder en minutos es «¿está en nuestra
 * aplicación, y en qué versión?». Sin un inventario, esa pregunta se responde
 * abriendo el proyecto y mirando, que es justo lo que no se puede hacer en
 * minutos ni de forma auditable.
 *
 * **Qué inventaría.** Solo las dependencias de producción: las de desarrollo no
 * viajan en el APK y meterlas en la lista la llena de ruido que después nadie
 * revisa. El detalle transitivo lo tiene `pnpm-lock.yaml` del monorepo, que se versiona;
 * esto es la vista que una persona puede leer.
 *
 * **Formato.** Un JSON propio y no CycloneDX, porque generar CycloneDX bien
 * exige una herramienta y la regla del proyecto es que cada dependencia se
 * justifica o se escala. Cuando el banco elija una herramienta para el pipeline
 * (P-16), esto se sustituye por ella; mientras tanto es mejor tener el
 * inventario que no tenerlo.
 *
 * `--verificar` falla si el archivo no coincide con `package.json`, para que el
 * comando de verificación detecte que alguien añadió una dependencia y no
 * regeneró el inventario.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const RAIZ = process.cwd();
const SALIDA = join(RAIZ, 'docs', 'sbom.json');

const paquete = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8'));
/**
 * El manifiesto del paquete tal como quedó instalado. Se lee de `node_modules`
 * y no del archivo de bloqueo: dentro del monorepo el bloqueo es el
 * `pnpm-lock.yaml` de la raíz, y pnpm enlaza cada dependencia directa en el
 * `node_modules` de la app, así que el manifiesto es la fuente fiable.
 */
function manifiestoInstalado(nombre) {
  const manifiesto = join(RAIZ, 'node_modules', nombre, 'package.json');
  if (!existsSync(manifiesto)) return null;

  try {
    return JSON.parse(readFileSync(manifiesto, 'utf8'));
  } catch {
    return null;
  }
}

/** La versión que quedó instalada, no el rango que pide `package.json`. */
function versionInstalada(nombre) {
  return manifiestoInstalado(nombre)?.version ?? null;
}

/** La licencia que el propio paquete declara. */
function licencia(nombre) {
  const leido = manifiestoInstalado(nombre);
  if (typeof leido?.license === 'string') return leido.license;
  if (typeof leido?.license?.type === 'string') return leido.license.type;
  return null;
}

const componentes = Object.entries(paquete.dependencies ?? {})
  .map(([nombre, rango]) => ({
    nombre,
    rango,
    version: versionInstalada(nombre),
    licencia: licencia(nombre),
  }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre));

const inventario = {
  aplicacion: paquete.name,
  version: paquete.version,
  /*
    Sin marca de tiempo a propósito: si la llevara, el archivo cambiaría en cada
    ejecución y `--verificar` fallaría siempre. Lo que importa es que la lista
    coincida con lo que se instala, no cuándo se generó.
  */
  nota: 'Solo dependencias de producción. El detalle transitivo está en pnpm-lock.yaml.',
  componentes,
};

const texto = `${JSON.stringify(inventario, null, 2)}\n`;

if (process.argv.includes('--verificar')) {
  if (!existsSync(SALIDA)) {
    console.error(
      '\n  El inventario de dependencias no existe.\n' +
        '  Generalo con: node scripts/generar-sbom.mjs\n',
    );
    process.exit(1);
  }

  if (readFileSync(SALIDA, 'utf8') !== texto) {
    console.error(
      '\n  El inventario de dependencias no está al día.\n' +
        '  Alguien cambió las dependencias sin regenerarlo.\n' +
        '  Regeneralo con: node scripts/generar-sbom.mjs\n',
    );
    process.exit(1);
  }

  console.log(
    `  Inventario al día · ${componentes.length} dependencias de producción`,
  );
  process.exit(0);
}

writeFileSync(SALIDA, texto, 'utf8');
console.log(
  `\n  Inventario escrito en docs/sbom.json · ${componentes.length} dependencias\n`,
);

const sinLicencia = componentes.filter(c => c.licencia === null);
if (sinLicencia.length > 0) {
  // No falla: la política de licencias es del banco (P-07). Pero se dice.
  console.log('  Sin licencia declarada:');
  for (const c of sinLicencia) console.log(`    · ${c.nombre}`);
  console.log('');
}
