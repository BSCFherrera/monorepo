#!/usr/bin/env node
/**
 * Compara dos capturas del mismo teléfono, píxel a píxel.
 *
 *     node scripts/comparar-capturas.mjs <flutter.png> <react-native.png> [etiqueta]
 *
 * **Por qué existe.** Comparar a ojo dos pantallas que se parecen mucho es
 * justo donde se cuela un desplazamiento de cuatro puntos o un peso de fuente
 * distinto. Y la app Flutter y el porte se parecen tanto que mirarlas seguidas
 * no basta.
 *
 * **Qué número mirar.** No el porcentaje total: dos motores de dibujado
 * distintos nunca coinciden en el antialiasing de las letras. Lo que importa
 * son **las bandas**: un tramo seguido de filas donde más del 6 % del ancho
 * difiere ya no es ruido de fuentes, es una fila movida, un texto distinto o un
 * espaciado que no coincide. Cero bandas y un porcentaje bajo es paridad.
 *
 * ⚠️ **Antes de creerse el resultado, hay que comprobar qué aplicación estaba
 * en primer plano al capturar.** Un resultado de 0,00 % no es una buena noticia:
 * es la señal de que se comparó una aplicación consigo misma. Pasó en la sesión
 * del 2026-09-17 —`adb install -r` mata la app que se está instalando y el foco
 * vuelve a la anterior— y las cuatro pantallas dieron paridad perfecta hasta que
 * el propio número delató el error. Conviene capturar así:
 *
 *     adb shell dumpsys window | grep -o "mCurrentFocus=Window{[^}]*}"
 *
 * y confirmar el paquete —`com.bsc.mobile` o `com.example.bsc_mobile_app`—
 * antes de cada tanda.
 *
 * La captura de la app Flutter de depuración lleva un borde de unos pocos
 * píxeles alrededor de la pantalla, así que se recorta un margen de los lados.
 */
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

/**
 * Decodificador PNG mínimo.
 *
 * Escrito a mano y no con una dependencia porque solo tiene que leer capturas
 * de `adb shell screencap`, que siempre son RGBA de 8 bits sin entrelazar, y
 * porque una herramienta de verificación que arrastra dependencias es una
 * herramienta que deja de ejecutarse el día que una de ellas se rompe.
 */
function leerPng(ruta) {
  const b = readFileSync(ruta);
  let pos = 8;
  let ancho = 0;
  let alto = 0;
  let prof = 0;
  let tipo = 0;
  const trozos = [];

  while (pos < b.length) {
    const len = b.readUInt32BE(pos);
    const nombre = b.toString('ascii', pos + 4, pos + 8);
    if (nombre === 'IHDR') {
      ancho = b.readUInt32BE(pos + 8);
      alto = b.readUInt32BE(pos + 12);
      prof = b[pos + 16];
      tipo = b[pos + 17];
    }
    if (nombre === 'IDAT') trozos.push(b.subarray(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }

  const canales = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[tipo];
  const bpp = canales * (prof / 8);
  const crudo = inflateSync(Buffer.concat(trozos));
  const linea = ancho * bpp;
  const datos = Buffer.alloc(alto * linea);
  let p = 0;

  // Deshace los filtros por fila que define la norma PNG.
  for (let y = 0; y < alto; y++) {
    const filtro = crudo[p++];
    const dentro = crudo.subarray(p, p + linea);
    p += linea;

    const anterior =
      y > 0 ? datos.subarray((y - 1) * linea, y * linea) : Buffer.alloc(linea);
    const actual = datos.subarray(y * linea, (y + 1) * linea);

    for (let x = 0; x < linea; x++) {
      const a = x >= bpp ? actual[x - bpp] : 0;
      const arriba = anterior[x];
      const diagonal = x >= bpp ? anterior[x - bpp] : 0;
      let v = dentro[x];

      if (filtro === 1) v += a;
      else if (filtro === 2) v += arriba;
      else if (filtro === 3) v += (a + arriba) >> 1;
      else if (filtro === 4) {
        const estimado = a + arriba - diagonal;
        const da = Math.abs(estimado - a);
        const db = Math.abs(estimado - arriba);
        const dc = Math.abs(estimado - diagonal);
        v += da <= db && da <= dc ? a : db <= dc ? arriba : diagonal;
      }

      actual[x] = v & 255;
    }
  }

  return { ancho, alto, bpp, datos };
}

const [, , rutaA, rutaB, etiqueta = 'comparación'] = process.argv;

if (rutaA === undefined || rutaB === undefined) {
  console.error(
    'uso: node scripts/comparar-capturas.mjs <a.png> <b.png> [etiqueta]',
  );
  process.exit(2);
}

const a = leerPng(rutaA);
const b = leerPng(rutaB);

if (a.ancho !== b.ancho || a.alto !== b.alto) {
  console.error(`${etiqueta}: las capturas no miden lo mismo`);
  process.exit(1);
}

/** El borde de depuración de la app Flutter. */
const MARGEN = 12;
/** La barra de estado lleva la hora, que cambia entre capturas. */
const DESDE = 130;
const HASTA = a.alto - 40;

let distintos = 0;
let total = 0;
const filas = new Array(a.alto).fill(0);

for (let y = DESDE; y < HASTA; y++) {
  for (let x = MARGEN; x < a.ancho - MARGEN; x++) {
    const i = (y * a.ancho + x) * a.bpp;
    const d =
      Math.abs(a.datos[i] - b.datos[i]) +
      Math.abs(a.datos[i + 1] - b.datos[i + 1]) +
      Math.abs(a.datos[i + 2] - b.datos[i + 2]);

    total += 1;
    if (d > 24) {
      distintos += 1;
      filas[y] += 1;
    }
  }
}

const anchoUtil = a.ancho - 2 * MARGEN;
const bandas = [];
let inicio = null;

for (let y = DESDE; y < HASTA; y++) {
  const fuerte = filas[y] > anchoUtil * 0.06;
  if (fuerte && inicio === null) inicio = y;
  if (!fuerte && inicio !== null) {
    if (y - inicio >= 3) bandas.push([inicio, y - 1]);
    inicio = null;
  }
}
if (inicio !== null) bandas.push([inicio, HASTA - 1]);

const porcentaje = ((100 * distintos) / total).toFixed(2);

console.log(
  `${etiqueta.padEnd(26)} distintos ${porcentaje.padStart(5)}%  bandas: ` +
    (bandas.length === 0
      ? 'ninguna'
      : bandas.map(([i, f]) => `y ${i}-${f} (${f - i + 1}px)`).join(', ')),
);

if (Number(porcentaje) === 0) {
  console.log(
    '  ⚠️  0,00 % suele significar que se comparó una aplicación consigo misma.\n' +
      '     Comprueba el primer plano con `adb shell dumpsys window | grep mCurrentFocus`.',
  );
}

// Las bandas son lo que hay que mirar; el porcentaje solo acompaña.
process.exit(bandas.length === 0 ? 0 : 1);
