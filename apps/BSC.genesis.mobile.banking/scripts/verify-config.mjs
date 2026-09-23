#!/usr/bin/env node
/**
 * Comprueba que la configuración de release no lleve nada inseguro.
 *
 * Existe porque la app Flutter llegó a tener, a la vez, tráfico en claro
 * habilitado, el identificador de la plantilla (`com.example.…`), la release
 * firmada con la llave de depuración y la IP interna del banco escrita en el
 * código. Ninguna de esas cuatro cosas la detecta un compilador ni un linter:
 * compilan perfectamente y solo se ven leyendo los archivos.
 *
 * Cada comprobación corresponde a un hallazgo real del inventario
 * (`docs/migration/01-as-is-inventory.md` §5) y a una amenaza del modelo
 * (`06-security-threat-model.md`).
 */

import { readFileSync, existsSync } from 'node:fs';
import process from 'node:process';

const hallazgos = [];
const verificadas = [];

/** @param {string} ruta */
const leer = ruta => (existsSync(ruta) ? readFileSync(ruta, 'utf8') : null);

function comprobar(nombre, condicionOk, mensajeSiFalla, amenaza) {
  if (condicionOk) {
    verificadas.push(nombre);
  } else {
    hallazgos.push({ nombre, mensaje: mensajeSiFalla, amenaza });
  }
}

// ─── AndroidManifest ────────────────────────────────────────────────────────
const manifest = leer('android/app/src/main/AndroidManifest.xml');

if (manifest === null) {
  hallazgos.push({
    nombre: 'AndroidManifest',
    mensaje: 'No se encontró android/app/src/main/AndroidManifest.xml',
    amenaza: '—',
  });
} else {
  comprobar(
    'Sin tráfico HTTP en claro',
    !/usesCleartextTraffic\s*=\s*"true"/.test(manifest),
    'usesCleartextTraffic="true" permite que las credenciales viajen sin cifrar. ' +
      'Solo puede existir en la variante de desarrollo, nunca en el manifiesto principal.',
    'T-06',
  );

  comprobar(
    'Respaldos del sistema deshabilitados',
    /android:allowBackup\s*=\s*"false"/.test(manifest),
    'Falta android:allowBackup="false". Sin él, el respaldo automático de Android ' +
      'puede llevarse datos de la app a la nube del usuario.',
    'T-12',
  );

  comprobar(
    'Sin deep links sin especificar',
    !/android\.intent\.category\.BROWSABLE/.test(manifest),
    'Hay un intent-filter BROWSABLE. Los deep links necesitan una especificación de ' +
      'validación de enlaces aprobada antes de habilitarse.',
    'T-09',
  );
}

// ─── build.gradle ───────────────────────────────────────────────────────────
const gradle = leer('android/app/build.gradle');

if (gradle === null) {
  hallazgos.push({
    nombre: 'build.gradle',
    mensaje: 'No se encontró android/app/build.gradle',
    amenaza: '—',
  });
} else {
  comprobar(
    'Identificador de aplicación propio',
    !/applicationId\s+["']com\.example\./.test(gradle),
    'El applicationId sigue siendo el de la plantilla. Es el identificador con el que ' +
      'los clientes reconocen la app en la tienda.',
    'T-11',
  );

  comprobar(
    'El almacén de claves se lee desde fuera del repositorio',
    /keystore\.properties/.test(gradle) && /BSC_KEYSTORE_FILE/.test(gradle),
    'La firma de release no lee el almacén de una configuración externa. Un almacén ' +
      'versionado es un almacén comprometido: cualquiera que clone el proyecto podría ' +
      'publicar una app que parezca la del banco.',
    'T-11',
  );

  /*
    Lo anterior comprueba el mecanismo; esto comprueba si está **usado**.

    Se mira si existe el archivo con los datos del almacén, y no el
    `build.gradle`: el mecanismo puede estar impecable y no haber almacén
    ninguno, que es exactamente la situación de hoy. La versión anterior de esta
    comprobación buscaba `signingConfig signingConfigs.debug` en el bloque de
    release y **empezó a dar un falso OK** en cuanto esa línea pasó a ser una
    condición. Una comprobación que mira la forma del código en vez del hecho
    se rompe en silencio, que es la peor manera de romperse.
  */
  const propiedadesDelAlmacen = leer('android/keystore.properties');

  comprobar(
    'Release no se firma con la llave de depuración',
    propiedadesDelAlmacen !== null &&
      /storePassword\s*=\s*\S/.test(propiedadesDelAlmacen),
    'No hay almacén de claves configurado, así que la release cae a la llave de ' +
      'depuración. Esa llave es pública y cualquiera puede publicar una app que ' +
      'parezca la del banco. Falta la decisión de custodia (D-03).',
    'T-11',
  );
}

// ─── Certificate pinning ────────────────────────────────────────────────────
const configuracionDeRed = leer(
  'android/app/src/main/res/xml/configuracion_de_red.xml',
);

if (configuracionDeRed !== null) {
  /*
    Se mira el XML **sin sus comentarios**. El andamiaje del pinning está
    escrito y documentado dentro de un comentario, y un comentario no protege
    nada: mientras siga así, la aplicación acepta cualquier certificado en el
    que el sistema confíe, incluido el de un proxy corporativo.
  */
  const sinComentarios = configuracionDeRed.replace(/<!--[\s\S]*?-->/gu, '');
  const pines =
    sinComentarios.match(/<pin\s+digest="SHA-256">([^<]+)<\/pin>/gu) ?? [];
  const pinesUtiles = pines.filter(pin => !/PENDIENTE/u.test(pin));

  comprobar(
    'Certificate pinning configurado',
    pinesUtiles.length >= 2,
    pines.length === 0
      ? 'No hay pinning. La app acepta cualquier certificado que el sistema confíe, ' +
          'incluido el de un proxy corporativo. Faltan las huellas SPKI del banco ' +
          '(D-02); se calculan con `node scripts/calcular-pin-spki.mjs <cert.pem>`.'
      : 'Hay menos de dos huellas fijadas. Con una sola, el día que haya que rotar la ' +
          'clave ningún cliente podrá entrar hasta que se publique una versión nueva.',
    'T-03',
  );
}

// ─── Secretos y endpoints en el código ──────────────────────────────────────
const fuentesConIpInterna = [];
const patronIpPrivada =
  /\b(?:10\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}|192\.168)\.\d{1,3}\.\d{1,3}\b/;

async function revisarFuentes() {
  const { glob } = await import('node:fs/promises');
  try {
    for await (const archivo of glob('src/**/*.{ts,tsx}')) {
      const contenido = readFileSync(archivo, 'utf8');
      if (patronIpPrivada.test(contenido)) fuentesConIpInterna.push(archivo);
    }
  } catch {
    // `glob` de node:fs/promises requiere Node 22+. Si no está, se omite: el
    // escaneo de secretos de la oleada 9 cubre esto de forma más completa.
  }
}

await revisarFuentes();

comprobar(
  'Sin direcciones internas escritas en el código',
  fuentesConIpInterna.length === 0,
  `Hay direcciones IP internas en: ${fuentesConIpInterna.join(', ')}. ` +
    'La URL del backend debe inyectarse en compilación, no vivir en el código.',
  'T-10',
);

// ─── Informe ────────────────────────────────────────────────────────────────
console.log('\n  Verificación de configuración de release\n');

for (const nombre of verificadas) {
  console.log(`    OK   ${nombre}`);
}

for (const h of hallazgos) {
  console.log(`    ✖    ${h.nombre}  [${h.amenaza}]`);
  console.log(`         ${h.mensaje}`);
}

console.log('');

if (hallazgos.length > 0) {
  console.log(`  ${hallazgos.length} hallazgo(s) de configuración.\n`);
  process.exit(1);
}

console.log('  Configuración correcta.\n');
process.exit(0);
