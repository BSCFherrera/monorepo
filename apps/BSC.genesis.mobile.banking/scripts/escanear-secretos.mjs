#!/usr/bin/env node
/**
 * Escaneo de secretos del repositorio (T-10).
 *
 * **Por qué existe y por qué está escrito a mano.** La app Flutter traía una
 * dirección interna del banco escrita en el código como respaldo, y nadie se
 * enteró hasta que se leyó el archivo. Esa es exactamente la clase de cosa que
 * un escaneo automático atrapa el día que se escribe, no meses después.
 *
 * Se escribe aquí en vez de traer una herramienta porque la regla del proyecto
 * es que cada dependencia se justifica o se escala, y porque un escáner general
 * produce mucho ruido sobre un repositorio pequeño: afinado a lo que este
 * proyecto puede filtrar —direcciones internas, claves de API, cadenas de
 * conexión, llaves privadas, las credenciales de prueba— encuentra más y grita
 * menos.
 *
 * ⚠️ **No sustituye a un escáner del sector en el pipeline** (P-16). Esto cubre
 * el caso conocido; una herramienta madura cubre el desconocido. Queda anotado.
 *
 *     node scripts/escanear-secretos.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import process from 'node:process';

const RAIZ = process.cwd();

/**
 * Qué se revisa: la app y los paquetes compartidos del monorepo que viajan
 * dentro de ella. El sistema de diseño vivía en `src/design-system` y se
 * revisaba con la app; al extraerlo a `packages/` tiene que seguir revisándose,
 * o un secreto escrito en un componente dejaría de detectarse sin aviso.
 */
const RAICES = [
  RAIZ,
  join(RAIZ, '../../packages/ui-native'),
  join(RAIZ, '../../packages/design-tokens'),
  join(RAIZ, '../../packages/contracts'),
  join(RAIZ, '../../packages/utils'),
].filter(existsSync);

/** Carpetas que no se miran: no son código nuestro o son resultado de compilar. */
const CARPETAS_IGNORADAS = new Set([
  'node_modules',
  '.git',
  'build',
  'dist',
  'coverage',
  '.gradle',
  'Pods',
  'vendor',
]);

/**
 * Archivos que no se miran aunque tengan una extensión de las de abajo.
 *
 * Los de bloqueo los genera npm y sus números de versión —«10.1.2.3»— disparan
 * el patrón de dirección privada sin que haya nada que revisar. Las
 * dependencias las cubre `npm audit`, que es la herramienta adecuada para eso.
 */
const ARCHIVOS_IGNORADOS = new Set([
  'package-lock.json',
  'yarn.lock',
  'Podfile.lock',
]);

/** Extensiones que sí se miran. */
const EXTENSIONES = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.kt',
  '.java',
  '.swift',
  '.gradle',
  '.properties',
  '.json',
  '.xml',
  '.yml',
  '.yaml',
  '.env',
  '.sh',
  '.md',
]);

/**
 * Los patrones.
 *
 * Cada uno lleva su motivo: un hallazgo sin explicación se ignora, y un escáner
 * que se ignora no sirve de nada.
 */
const PATRONES = [
  {
    nombre: 'dirección IP privada',
    patron:
      /\b(?:10\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.)\d{1,3}\.\d{1,3}\b/gu,
    motivo:
      'la app Flutter traía una dirección interna del banco escrita en el código (T-10)',
  },
  {
    nombre: 'llave privada',
    patron: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/gu,
    motivo: 'una llave privada en el repositorio es una llave comprometida',
  },
  {
    nombre: 'cadena de conexión',
    patron: /(?:Server|Data Source)=[^;"'\s]+;.*(?:Password|Pwd)=/giu,
    motivo: 'expone el servidor y la contraseña de la base de datos',
  },
  {
    nombre: 'token con forma de JWT',
    patron: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/gu,
    motivo:
      'un token de sesión real deja entrar a quien lo lea mientras no caduque',
  },
  {
    nombre: 'clave de API asignada a una variable',
    patron:
      /\b(?:api[_-]?key|apikey|client[_-]?secret|access[_-]?key)\s*[:=]\s*['"][A-Za-z0-9_\-/+]{16,}['"]/giu,
    motivo: 'una clave en el código viaja a cualquiera que reciba el paquete',
  },
  {
    nombre: 'contraseña asignada a una variable',
    patron: /\b(?:password|contrasena|pwd)\s*[:=]\s*['"][^'"\s]{6,}['"]/giu,
    motivo:
      'incluye las credenciales de prueba, que tampoco deben estar en el repositorio',
  },
];

/**
 * Lo que se permite, con su razón.
 *
 * Una lista de excepciones es un riesgo en sí misma, así que cada entrada dice
 * por qué es segura y se comprueba la línea entera, no solo el archivo.
 */
const PERMITIDOS = [
  {
    // Las pruebas usan credenciales que no abren nada.
    coincide: (ruta, linea) =>
      /__tests__|\.test\.|\.spec\./u.test(ruta) &&
      /(?:ejemplo|example|prueba|falsa|sintétic)/iu.test(linea),
    motivo: 'valor sintético dentro de una prueba, marcado como tal',
  },
  {
    // El escáner se nombra a sí mismo al describir lo que busca.
    coincide: ruta => ruta.endsWith('escanear-secretos.mjs'),
    motivo: 'el propio escáner',
  },
  {
    /*
      Los trazos vectoriales son series de números y alguna se lee como una
      dirección. No son texto escrito por nadie: salen de exportar el logotipo.
    */
    coincide: ruta => ruta.includes('packages/ui-native/src/assets/'),
    motivo: 'datos de trazado vectorial, no texto escrito a mano',
  },
];

function* archivos(directorio) {
  for (const entrada of readdirSync(directorio)) {
    if (CARPETAS_IGNORADAS.has(entrada)) continue;

    const completo = join(directorio, entrada);
    const info = statSync(completo);

    if (info.isDirectory()) yield* archivos(completo);
    else if (
      !ARCHIVOS_IGNORADOS.has(entrada) &&
      EXTENSIONES.has(extname(entrada))
    ) {
      yield completo;
    }
  }
}

const hallazgos = [];
let revisados = 0;

for (const archivo of RAICES.flatMap(raiz => [...archivos(raiz)])) {
  revisados += 1;
  const ruta = relative(RAIZ, archivo).replace(/\\/gu, '/');

  let contenido;
  try {
    contenido = readFileSync(archivo, 'utf8');
  } catch {
    continue; // Binario o sin permiso: no es código que podamos revisar.
  }

  const lineas = contenido.split('\n');

  for (const { nombre, patron, motivo } of PATRONES) {
    for (let i = 0; i < lineas.length; i += 1) {
      const linea = lineas[i];
      patron.lastIndex = 0;
      if (!patron.test(linea)) continue;

      const permitido = PERMITIDOS.find(p => p.coincide(ruta, linea));
      if (permitido) continue;

      hallazgos.push({ ruta, linea: i + 1, nombre, motivo });
    }
  }
}

console.log(`\n  Escaneo de secretos · ${revisados} archivos revisados\n`);

if (hallazgos.length === 0) {
  console.log('  Sin hallazgos.\n');
  process.exit(0);
}

for (const h of hallazgos) {
  // Se imprime **dónde** está, nunca el valor: un informe que copia el secreto
  // lo multiplica, y estos informes acaban en la salida de un pipeline.
  console.log(`  ✗ ${h.ruta}:${h.linea} — ${h.nombre}`);
  console.log(`      ${h.motivo}\n`);
}

console.log(`  ${hallazgos.length} hallazgo(s).\n`);
process.exit(1);
