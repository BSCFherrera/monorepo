/**
 * Genera el icono de la aplicación y el logotipo del arranque a partir del
 * logotipo de marca (D-25).
 *
 * **Por qué existe este archivo y no se pegaron los PNG a mano.** El icono no
 * es una imagen: son tres capas vectoriales para Android 8 en adelante, diez
 * PNG por densidad para Android 7, uno para la ficha de la tienda y otro para
 * iOS. Todos tienen que salir del **mismo** dibujo, y ese dibujo es el isotipo
 * que vive dentro de `libs/shared-ui-native/src/assets/logo-bsc.svg`. Con un generador,
 * el día que el banco entregue una versión nueva del logotipo se sustituye ese
 * SVG, se ejecuta `npm run iconos` y las piezas vuelven a cuadrar entre sí. A
 * mano, alguna se quedaría atrás y nadie lo notaría hasta ver el teléfono.
 *
 * **Qué es el isotipo.** El archivo de marca trae el logotipo completo: el
 * símbolo —el rombo azul y verde— y el texto «BANCO SANTA CRUZ» al lado. El
 * texto no sirve en un icono, porque a 48 puntos de pantalla es una mancha y
 * porque la máscara de Android recorta los bordes. El isotipo es el símbolo
 * solo, y es lo que este archivo recorta del original de forma reproducible, en
 * vez de a ojo en un editor.
 *
 * No usa ninguna dependencia: lee el SVG, interpreta las rutas, las rasteriza
 * con sus propios medios y escribe los PNG con `node:zlib`. Añadir una librería
 * de imágenes al proyecto por trece archivos que se regeneran una vez al año no
 * se sostiene.
 *
 *     node scripts/generar-iconos.mjs
 */

import { deflateSync } from 'node:zlib';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

// ───────────────────────────────────────────────────────────────────────────
// 1. Lectura del SVG de marca
// ───────────────────────────────────────────────────────────────────────────

/**
 * El grupo que contiene el texto del logotipo.
 *
 * El archivo de marca no etiqueta sus partes, así que la única forma de separar
 * el símbolo del texto es por su posición en el documento: todo lo que cuelga
 * de este grupo son las letras. Se identifica por su desplazamiento, que es
 * único en el archivo.
 */
const GRUPO_DEL_TEXTO = 'translate(378.356 66.531)';

/**
 * Recorre el SVG llevando la cuenta de los desplazamientos de los grupos.
 *
 * Todas las transformaciones del archivo son traslaciones puras —no hay
 * rotaciones ni escalas—, así que basta con ir sumando. Cada ruta sale con su
 * desplazamiento ya acumulado y una marca que dice si pertenece al texto.
 */
function leerRutas(svg) {
  const rutas = [];
  const pila = [{ x: 0, y: 0, esTexto: false }];
  const etiquetas = /<g\b([^>]*)>|<\/g>|<path\b([^>]*)>/g;

  let etiqueta;
  while ((etiqueta = etiquetas.exec(svg)) !== null) {
    const [texto, atributosDeGrupo, atributosDeRuta] = etiqueta;

    if (texto === '</g>') {
      pila.pop();
      continue;
    }

    if (atributosDeGrupo !== undefined) {
      const actual = pila[pila.length - 1];
      const t = desplazamiento(atributosDeGrupo);
      pila.push({
        x: actual.x + t.x,
        y: actual.y + t.y,
        esTexto: actual.esTexto || atributosDeGrupo.includes(GRUPO_DEL_TEXTO),
      });
      continue;
    }

    const actual = pila[pila.length - 1];
    const t = desplazamiento(atributosDeRuta);
    rutas.push({
      d: atributo(atributosDeRuta, 'd') ?? '',
      relleno: atributo(atributosDeRuta, 'fill') ?? 'none',
      trazo: atributo(atributosDeRuta, 'stroke') ?? 'none',
      anchoDeTrazo: Number(atributo(atributosDeRuta, 'stroke-width') ?? '0'),
      dx: actual.x + t.x,
      dy: actual.y + t.y,
      esTexto: actual.esTexto,
    });
  }

  return rutas;
}

function atributo(atributos, nombre) {
  const encontrado = new RegExp(`\\b${nombre}="([^"]*)"`).exec(atributos);
  return encontrado === null ? undefined : encontrado[1];
}

function desplazamiento(atributos) {
  const transformacion = atributo(atributos, 'transform');
  if (transformacion === undefined) return { x: 0, y: 0 };

  const encontrado = /translate\(\s*([-\d.]+)[\s,]+([-\d.]+)\s*\)/.exec(
    transformacion,
  );
  if (encontrado === null) return { x: 0, y: 0 };

  return { x: Number(encontrado[1]), y: Number(encontrado[2]) };
}

// ───────────────────────────────────────────────────────────────────────────
// 2. Interpretación de las rutas
// ───────────────────────────────────────────────────────────────────────────

/**
 * Convierte el atributo `d` de una ruta en órdenes absolutas.
 *
 * El formato de SVG admite órdenes relativas, abreviadas (`H`, `V`, `S`, `T`) y
 * números pegados unos a otros —«3.494.057» son dos números, no uno—. Aquí se
 * normaliza todo a tres órdenes absolutas: mover, línea y curva cúbica; los
 * arcos se convierten a cúbicas al vuelo. Con eso basta para dibujar y medir.
 *
 * No cubre las banderas de arco escritas sin separador («0011.5»), que el
 * archivo de marca no usa: todas sus rutas separan por coma.
 */
function interpretarRuta(d) {
  const piezas = d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g);
  if (piezas === null) return [];

  const ordenes = [];
  let i = 0;
  let orden = '';
  let x = 0;
  let y = 0;
  let inicioX = 0;
  let inicioY = 0;
  // Último punto de control, que es lo que necesitan las curvas abreviadas para
  // reflejarse.
  let controlX = 0;
  let controlY = 0;

  const numero = () => Number(piezas[i++]);

  while (i < piezas.length) {
    if (/[a-zA-Z]/.test(piezas[i])) orden = piezas[i++];
    // Una orden que se repite sin volver a nombrarse. Tras un mover, los pares
    // siguientes son líneas; para el resto la orden simplemente continúa.
    else if (orden === 'M') orden = 'L';
    else if (orden === 'm') orden = 'l';

    const relativo = orden === orden.toLowerCase();
    const bx = relativo ? x : 0;
    const by = relativo ? y : 0;

    switch (orden.toUpperCase()) {
      case 'M': {
        x = bx + numero();
        y = by + numero();
        inicioX = x;
        inicioY = y;
        controlX = x;
        controlY = y;
        ordenes.push(['M', x, y]);
        break;
      }
      case 'L': {
        x = bx + numero();
        y = by + numero();
        controlX = x;
        controlY = y;
        ordenes.push(['L', x, y]);
        break;
      }
      case 'H': {
        x = bx + numero();
        controlX = x;
        controlY = y;
        ordenes.push(['L', x, y]);
        break;
      }
      case 'V': {
        y = by + numero();
        controlX = x;
        controlY = y;
        ordenes.push(['L', x, y]);
        break;
      }
      case 'C': {
        const x1 = bx + numero();
        const y1 = by + numero();
        const x2 = bx + numero();
        const y2 = by + numero();
        x = bx + numero();
        y = by + numero();
        controlX = x2;
        controlY = y2;
        ordenes.push(['C', x1, y1, x2, y2, x, y]);
        break;
      }
      case 'S': {
        const x1 = 2 * x - controlX;
        const y1 = 2 * y - controlY;
        const x2 = bx + numero();
        const y2 = by + numero();
        x = bx + numero();
        y = by + numero();
        controlX = x2;
        controlY = y2;
        ordenes.push(['C', x1, y1, x2, y2, x, y]);
        break;
      }
      case 'Q': {
        const qx = bx + numero();
        const qy = by + numero();
        const fx = bx + numero();
        const fy = by + numero();
        ordenes.push(cuadraticaACubica(x, y, qx, qy, fx, fy));
        controlX = qx;
        controlY = qy;
        x = fx;
        y = fy;
        break;
      }
      case 'T': {
        const qx = 2 * x - controlX;
        const qy = 2 * y - controlY;
        const fx = bx + numero();
        const fy = by + numero();
        ordenes.push(cuadraticaACubica(x, y, qx, qy, fx, fy));
        controlX = qx;
        controlY = qy;
        x = fx;
        y = fy;
        break;
      }
      case 'A': {
        const rx = numero();
        const ry = numero();
        const giro = numero();
        const arcoGrande = numero();
        const sentido = numero();
        const fx = bx + numero();
        const fy = by + numero();
        const curvas = arcoACubicas(
          x,
          y,
          rx,
          ry,
          giro,
          arcoGrande,
          sentido,
          fx,
          fy,
        );
        for (const curva of curvas) ordenes.push(curva);
        controlX = fx;
        controlY = fy;
        x = fx;
        y = fy;
        break;
      }
      case 'Z': {
        ordenes.push(['Z']);
        x = inicioX;
        y = inicioY;
        controlX = x;
        controlY = y;
        break;
      }
      default:
        throw new Error(`Orden de ruta no soportada: ${orden}`);
    }
  }

  return ordenes;
}

function cuadraticaACubica(x0, y0, qx, qy, x, y) {
  return [
    'C',
    x0 + (2 / 3) * (qx - x0),
    y0 + (2 / 3) * (qy - y0),
    x + (2 / 3) * (qx - x),
    y + (2 / 3) * (qy - y),
    x,
    y,
  ];
}

/**
 * Convierte un arco elíptico en curvas cúbicas.
 *
 * El arco de SVG se describe por sus extremos —«llega hasta aquí curvándote
 * así»—, que es cómodo de escribir pero imposible de dibujar directamente. Se
 * pasa a la forma de centro, que da el ángulo inicial y el barrido, se parte en
 * tramos de como mucho noventa grados y cada tramo se aproxima con una cúbica.
 * Es el procedimiento del anexo B de la especificación de SVG.
 *
 * Hacerlo aquí tiene una ventaja práctica: el resto del archivo —medir,
 * escalar, rasterizar— solo necesita saber de líneas y cúbicas.
 */
function arcoACubicas(x0, y0, rx, ry, giroEnGrados, arcoGrande, sentido, x, y) {
  if (rx === 0 || ry === 0) return [['L', x, y]];

  const giro = (giroEnGrados * Math.PI) / 180;
  const cos = Math.cos(giro);
  const sen = Math.sin(giro);

  const dx = (x0 - x) / 2;
  const dy = (y0 - y) / 2;
  const x1 = cos * dx + sen * dy;
  const y1 = -sen * dx + cos * dy;

  let radioX = Math.abs(rx);
  let radioY = Math.abs(ry);

  // Radios demasiado pequeños para unir los dos extremos: la especificación
  // manda agrandarlos, no descartar el arco.
  const exceso = (x1 * x1) / (radioX * radioX) + (y1 * y1) / (radioY * radioY);
  if (exceso > 1) {
    radioX *= Math.sqrt(exceso);
    radioY *= Math.sqrt(exceso);
  }

  const numerador =
    radioX * radioX * radioY * radioY -
    radioX * radioX * y1 * y1 -
    radioY * radioY * x1 * x1;
  const denominador = radioX * radioX * y1 * y1 + radioY * radioY * x1 * x1;
  const factor =
    (arcoGrande !== sentido ? 1 : -1) *
    Math.sqrt(Math.max(0, numerador / denominador));

  const cx1 = (factor * radioX * y1) / radioY;
  const cy1 = (-factor * radioY * x1) / radioX;
  const cx = cos * cx1 - sen * cy1 + (x0 + x) / 2;
  const cy = sen * cx1 + cos * cy1 + (y0 + y) / 2;

  const angulo = (ux, uy, vx, vy) => {
    const signo = ux * vy - uy * vx < 0 ? -1 : 1;
    const coseno =
      (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
    return signo * Math.acos(Math.min(1, Math.max(-1, coseno)));
  };

  const inicio = angulo(1, 0, (x1 - cx1) / radioX, (y1 - cy1) / radioY);
  let barrido = angulo(
    (x1 - cx1) / radioX,
    (y1 - cy1) / radioY,
    (-x1 - cx1) / radioX,
    (-y1 - cy1) / radioY,
  );
  if (sentido === 0 && barrido > 0) barrido -= 2 * Math.PI;
  if (sentido === 1 && barrido < 0) barrido += 2 * Math.PI;

  const tramos = Math.ceil(Math.abs(barrido) / (Math.PI / 2));
  const paso = barrido / tramos;
  // Longitud de los tirantes que hace que la cúbica pase por el arco: la
  // aproximación clásica de un arco de circunferencia con una curva de Bézier.
  const tirante = (4 / 3) * Math.tan(paso / 4);

  const punto = a => {
    const px = radioX * Math.cos(a);
    const py = radioY * Math.sin(a);
    return {
      x: cos * px - sen * py + cx,
      y: sen * px + cos * py + cy,
      dx: -radioX * Math.sin(a),
      dy: radioY * Math.cos(a),
    };
  };

  const curvas = [];
  let a = inicio;

  for (let t = 0; t < tramos; t += 1) {
    const desde = punto(a);
    const hasta = punto(a + paso);
    const tirar = (p, ddx, ddy) => ({
      x: p.x + tirante * (cos * ddx - sen * ddy),
      y: p.y + tirante * (sen * ddx + cos * ddy),
    });
    const c1 = tirar(desde, desde.dx, desde.dy);
    const c2 = tirar(hasta, -hasta.dx, -hasta.dy);
    curvas.push(['C', c1.x, c1.y, c2.x, c2.y, hasta.x, hasta.y]);
    a += paso;
  }

  return curvas;
}

// ───────────────────────────────────────────────────────────────────────────
// 3. Transformar, medir y aplanar
// ───────────────────────────────────────────────────────────────────────────

/** Aplica desplazamiento y escala uniforme a una lista de órdenes. */
function transformar(ordenes, escala, tx, ty) {
  return ordenes.map(orden => {
    if (orden[0] === 'Z') return orden;
    const salida = [orden[0]];
    for (let i = 1; i < orden.length; i += 2) {
      salida.push(orden[i] * escala + tx, orden[i + 1] * escala + ty);
    }
    return salida;
  });
}

/**
 * Convierte las órdenes en polilíneas cerradas.
 *
 * El número de tramos de cada curva se decide con el tamaño que la curva va a
 * tener en pantalla: a 432 píxeles hacen falta muchos más que a 48, y fijar una
 * cifra para todos significa o facetas visibles en el grande o trabajo tirado
 * en el pequeño.
 */
function aplanar(ordenes) {
  const contornos = [];
  let actual = null;
  let x = 0;
  let y = 0;

  const abrir = (px, py) => {
    actual = [{ x: px, y: py }];
    contornos.push(actual);
  };

  for (const orden of ordenes) {
    switch (orden[0]) {
      case 'M':
        x = orden[1];
        y = orden[2];
        abrir(x, y);
        break;
      case 'L':
        if (actual === null) abrir(x, y);
        x = orden[1];
        y = orden[2];
        actual.push({ x, y });
        break;
      case 'C': {
        if (actual === null) abrir(x, y);
        const [, x1, y1, x2, y2, fx, fy] = orden;
        const largo =
          Math.hypot(x1 - x, y1 - y) +
          Math.hypot(x2 - x1, y2 - y1) +
          Math.hypot(fx - x2, fy - y2);
        const tramos = Math.min(64, Math.max(3, Math.ceil(largo / 1.5)));
        for (let t = 1; t <= tramos; t += 1) {
          const u = t / tramos;
          const v = 1 - u;
          actual.push({
            x: v * v * v * x + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * fx,
            y: v * v * v * y + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * fy,
          });
        }
        x = fx;
        y = fy;
        break;
      }
      case 'Z':
        if (actual !== null && actual.length > 0) {
          x = actual[0].x;
          y = actual[0].y;
        }
        actual = null;
        break;
      default:
        break;
    }
  }

  return contornos.filter(contorno => contorno.length >= 3);
}

function medir(contornos) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const contorno of contornos) {
    for (const punto of contorno) {
      if (punto.x < minX) minX = punto.x;
      if (punto.y < minY) minY = punto.y;
      if (punto.x > maxX) maxX = punto.x;
      if (punto.y > maxY) maxY = punto.y;
    }
  }

  return { minX, minY, maxX, maxY, ancho: maxX - minX, alto: maxY - minY };
}

/** Escribe las órdenes como el `pathData` que entiende Android. */
function aPathData(ordenes) {
  const n = v => {
    const redondeado = Math.round(v * 1000) / 1000;
    return String(redondeado);
  };

  return ordenes
    .map(orden => {
      if (orden[0] === 'Z') return 'Z';
      const valores = [];
      for (let i = 1; i < orden.length; i += 2) {
        valores.push(`${n(orden[i])},${n(orden[i + 1])}`);
      }
      return `${orden[0]}${valores.join(' ')}`;
    })
    .join(' ');
}

// ───────────────────────────────────────────────────────────────────────────
// 4. Rasterizador
// ───────────────────────────────────────────────────────────────────────────

/** Muestras verticales por píxel. En horizontal la cobertura es exacta. */
const MUESTRAS = 5;

/**
 * Calcula qué fracción de cada píxel cubre un conjunto de contornos.
 *
 * Es un relleno por barrido: para cada línea de muestreo se buscan los cruces
 * con las aristas, se ordenan y se recorren acumulando el número de vueltas
 * —«nonzero»— o alternando —«evenOdd»—, que son las dos reglas de relleno de
 * SVG. Dentro de cada tramo, en horizontal, la cobertura se reparte de forma
 * exacta entre los píxeles de los extremos, que es lo que evita los bordes
 * dentados sin multiplicar el muestreo.
 */
function cubrir(contornos, ancho, alto, evenOdd = false) {
  const cobertura = new Float32Array(ancho * alto);
  const aristas = [];

  for (const contorno of contornos) {
    for (let i = 0; i < contorno.length; i += 1) {
      const a = contorno[i];
      const b = contorno[(i + 1) % contorno.length];
      if (a.y !== b.y) aristas.push({ a, b });
    }
  }

  const peso = 1 / MUESTRAS;

  for (let fila = 0; fila < alto * MUESTRAS; fila += 1) {
    const y = (fila + 0.5) / MUESTRAS;
    const cruces = [];

    for (const { a, b } of aristas) {
      const arriba = Math.min(a.y, b.y);
      const abajo = Math.max(a.y, b.y);
      if (y < arriba || y >= abajo) continue;
      const t = (y - a.y) / (b.y - a.y);
      cruces.push({ x: a.x + t * (b.x - a.x), sentido: b.y > a.y ? 1 : -1 });
    }

    if (cruces.length === 0) continue;
    cruces.sort((p, q) => p.x - q.x);

    const base = Math.floor(y) * ancho;
    let vueltas = 0;

    for (let i = 0; i < cruces.length - 1; i += 1) {
      vueltas += evenOdd ? 1 : cruces[i].sentido;
      const dentro = evenOdd ? vueltas % 2 !== 0 : vueltas !== 0;
      if (!dentro) continue;
      pintarTramo(cobertura, base, ancho, cruces[i].x, cruces[i + 1].x, peso);
    }
  }

  return cobertura;
}

/** Reparte la cobertura de un tramo horizontal entre los píxeles que toca. */
function pintarTramo(cobertura, base, ancho, desde, hasta, peso) {
  const x0 = Math.max(0, desde);
  const x1 = Math.min(ancho, hasta);
  if (x1 <= x0) return;

  const primero = Math.floor(x0);
  const ultimo = Math.min(ancho - 1, Math.ceil(x1) - 1);

  for (let px = primero; px <= ultimo; px += 1) {
    const solape = Math.min(x1, px + 1) - Math.max(x0, px);
    if (solape > 0) cobertura[base + px] += solape * peso;
  }
}

/** Mezcla un color sobre el lienzo según la cobertura calculada. */
function componer(lienzo, cobertura, color) {
  const [r, g, b, a = 255] = color;

  for (let i = 0; i < cobertura.length; i += 1) {
    const alfa = Math.min(1, cobertura[i]) * (a / 255);
    if (alfa <= 0) continue;
    const p = i * 4;
    lienzo[p] = lienzo[p] * (1 - alfa) + r * alfa;
    lienzo[p + 1] = lienzo[p + 1] * (1 - alfa) + g * alfa;
    lienzo[p + 2] = lienzo[p + 2] * (1 - alfa) + b * alfa;
    lienzo[p + 3] = lienzo[p + 3] * (1 - alfa) + 255 * alfa;
  }
}

/**
 * Convierte una polilínea en los contornos de su trazo.
 *
 * El rasterizador solo sabe rellenar, así que un trazo se dibuja como el
 * relleno de su propia silueta: un rectángulo por tramo y un polígono redondo
 * en cada vértice, que hace las veces de unión redondeada. Todos se orientan en
 * el mismo sentido para que la regla «nonzero» los una en vez de restarlos, que
 * es lo que dejaría agujeros justo en los cruces.
 */
function contornosDeTrazo(contornos, grosor) {
  const mitad = grosor / 2;
  const piezas = [];

  const orientar = poligono => {
    let area = 0;
    for (let i = 0; i < poligono.length; i += 1) {
      const a = poligono[i];
      const b = poligono[(i + 1) % poligono.length];
      area += a.x * b.y - b.x * a.y;
    }
    return area < 0 ? poligono.slice().reverse() : poligono;
  };

  for (const contorno of contornos) {
    for (let i = 0; i < contorno.length; i += 1) {
      const a = contorno[i];
      const b = contorno[(i + 1) % contorno.length];
      const largo = Math.hypot(b.x - a.x, b.y - a.y);

      if (largo > 1e-6) {
        const nx = (-(b.y - a.y) / largo) * mitad;
        const ny = ((b.x - a.x) / largo) * mitad;
        piezas.push(
          orientar([
            { x: a.x + nx, y: a.y + ny },
            { x: b.x + nx, y: b.y + ny },
            { x: b.x - nx, y: b.y - ny },
            { x: a.x - nx, y: a.y - ny },
          ]),
        );
      }

      const disco = [];
      for (let k = 0; k < 10; k += 1) {
        const t = (k / 10) * 2 * Math.PI;
        disco.push({ x: a.x + mitad * Math.cos(t), y: a.y + mitad * Math.sin(t) });
      }
      piezas.push(orientar(disco));
    }
  }

  return piezas;
}

/** Polígono de un rectángulo con las esquinas redondeadas. */
function rectanguloRedondeado(x, y, ancho, alto, radio) {
  const puntos = [];
  const esquinas = [
    { cx: x + ancho - radio, cy: y + radio, desde: -Math.PI / 2 },
    { cx: x + ancho - radio, cy: y + alto - radio, desde: 0 },
    { cx: x + radio, cy: y + alto - radio, desde: Math.PI / 2 },
    { cx: x + radio, cy: y + radio, desde: Math.PI },
  ];

  for (const { cx, cy, desde } of esquinas) {
    for (let k = 0; k <= 24; k += 1) {
      const t = desde + (k / 24) * (Math.PI / 2);
      puntos.push({ x: cx + radio * Math.cos(t), y: cy + radio * Math.sin(t) });
    }
  }

  return puntos;
}

/** Polígono de un círculo. */
function circulo(cx, cy, radio) {
  const puntos = [];
  for (let k = 0; k < 256; k += 1) {
    const t = (k / 256) * 2 * Math.PI;
    puntos.push({ x: cx + radio * Math.cos(t), y: cy + radio * Math.sin(t) });
  }
  return puntos;
}

// ───────────────────────────────────────────────────────────────────────────
// 5. Escritura de PNG
// ───────────────────────────────────────────────────────────────────────────

const tablaCrc = (() => {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    tabla[n] = c >>> 0;
  }
  return tabla;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = tablaCrc[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function trozo(tipo, datos) {
  const cabecera = Buffer.alloc(4);
  cabecera.writeUInt32BE(datos.length, 0);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const comprobacion = Buffer.alloc(4);
  comprobacion.writeUInt32BE(crc32(cuerpo), 0);
  return Buffer.concat([cabecera, cuerpo, comprobacion]);
}

/**
 * Escribe el lienzo como PNG.
 *
 * `conAlfa` decide entre color verdadero con transparencia y sin ella. El
 * icono de la App Store **no puede llevar canal alfa** —Apple rechaza el envío—
 * y la ficha de Google Play tampoco lo quiere, así que esa distinción no es un
 * lujo.
 */
function escribirPng(ruta, ancho, alto, lienzo, conAlfa = true) {
  const canales = conAlfa ? 4 : 3;
  const crudo = Buffer.alloc(alto * (1 + ancho * canales));

  for (let y = 0; y < alto; y += 1) {
    const inicio = y * (1 + ancho * canales);
    crudo[inicio] = 0; // filtro «ninguno»
    for (let x = 0; x < ancho; x += 1) {
      const origen = (y * ancho + x) * 4;
      const destino = inicio + 1 + x * canales;
      crudo[destino] = Math.round(lienzo[origen]);
      crudo[destino + 1] = Math.round(lienzo[origen + 1]);
      crudo[destino + 2] = Math.round(lienzo[origen + 2]);
      if (conAlfa) crudo[destino + 3] = Math.round(lienzo[origen + 3]);
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8; // ocho bits por canal
  ihdr[9] = conAlfa ? 6 : 2;

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', ihdr),
    trozo('IDAT', deflateSync(crudo, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ]);

  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, png);
  return png.length;
}

function color(texto) {
  const rgb = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(texto);
  if (rgb !== null) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), 255];
  }

  const hex = texto.replace('#', '');
  const ancho = hex.length === 3 ? 1 : 2;
  const leer = i => {
    const trozoHex = hex.substr(i * ancho, ancho);
    return parseInt(ancho === 1 ? trozoHex + trozoHex : trozoHex, 16);
  };
  return [leer(0), leer(1), leer(2), 255];
}

function aHex(rgb) {
  return `#FF${rgb
    .slice(0, 3)
    .map(v => v.toString(16).padStart(2, '0').toUpperCase())
    .join('')}`;
}

// ───────────────────────────────────────────────────────────────────────────
// 6. Composición del icono
// ───────────────────────────────────────────────────────────────────────────

/**
 * El fondo del icono es **blanco**.
 *
 * El isotipo lleva el azul y el verde de la marca, y sobre el azul corporativo
 * la mitad del símbolo desaparecería. El blanco es además el fondo sobre el que
 * el banco entregó el asset. Vive en `values/ic_launcher_background.xml` como
 * recurso propio, así que cambiarlo no obliga a tocar el dibujo.
 */
const FONDO_DEL_ICONO = [255, 255, 255, 255];

/**
 * El tamaño del símbolo, y por qué se mide por su círculo y no por su caja.
 *
 * El isotipo de BSC es **casi circular**: su círculo envolvente mide 99.40
 * unidades y su caja 99.09 de alto, así que la caja no dice nada que el círculo
 * no diga, y el que importa es el círculo — porque la máscara del lanzador
 * también lo es. Medir por el círculo envolvente, y no por la caja, es lo que
 * hace que la regla siga valiendo si algún día el símbolo cambia de forma.
 *
 * Los dos valores van en dp del lienzo de 108 dp del icono adaptativo.
 *
 * **En el lanzador: 52.** De los 108 dp de cada capa solo los 72 centrales
 * están garantizados: el resto se lo lleva la máscara del fabricante —círculo
 * en un Pixel, cuadrado redondeado en un Samsung— y el efecto de profundidad al
 * deslizar. Material marca dentro de esos 72 dp sus **líneas maestras**: 66 dp
 * para un dibujo circular y 57 dp para uno cuadrado, y son **topes, no
 * objetivos**. A 65 dp —donde estuvo hasta el 2026-09-18— el símbolo cumplía el
 * tope y aun así llenaba la máscara de borde a borde: no se recortaba, pero no
 * respiraba, y en la pantalla de inicio se leía como un icono demasiado grande
 * al lado de los demás. A 52 dp ocupa el 72 % del diámetro visible, que es
 * donde se mueven los iconos de marca del sector.
 *
 * **En las tiendas: 62.** La ficha de Google Play y el icono de iOS son
 * cuadrados y **nadie les aplica una máscara circular**: como mucho les redondea
 * las esquinas. Ahí el margen del lanzador sobra y el mismo 52 haría que el
 * símbolo se viera perdido en medio del cuadro.
 */
const DIAMETRO_EN_EL_LANZADOR = 52;
const DIAMETRO_EN_LAS_TIENDAS = 62;

const LADO = 108;
const ZONA_SEGURA = 72;

function main() {
  const svg = readFileSync(
    join(raiz, '../../libs/shared-ui-native/src/assets/logo-bsc.svg'),
    'utf8',
  );

  const rutas = leerRutas(svg).map(ruta => ({
    ...ruta,
    ordenes: transformar(interpretarRuta(ruta.d), 1, ruta.dx, ruta.dy),
  }));

  const isotipo = rutas.filter(ruta => !ruta.esTexto);
  const rellenos = isotipo.filter(ruta => ruta.relleno !== 'none');
  const trazos = isotipo.filter(ruta => ruta.trazo !== 'none');

  if (rellenos.length === 0) {
    throw new Error('No se encontró el isotipo dentro del logotipo de marca');
  }

  // El cuadro del símbolo, medido sobre el dibujo real y no sobre el lienzo del
  // archivo, que es mucho más ancho porque incluye el texto.
  const contornosDelSimbolo = rellenos.flatMap(ruta => aplanar(ruta.ordenes));
  const caja = medir(contornosDelSimbolo);

  // El radio del círculo que envuelve al símbolo, tomado desde el centro de su
  // caja — que es el punto por el que después se centra en el lienzo, de modo
  // que las dos medidas hablan del mismo centro.
  const centroX = (caja.minX + caja.maxX) / 2;
  const centroY = (caja.minY + caja.maxY) / 2;
  let radioDelSimbolo = 0;
  for (const contorno of contornosDelSimbolo) {
    for (const punto of contorno) {
      radioDelSimbolo = Math.max(
        radioDelSimbolo,
        Math.hypot(punto.x - centroX, punto.y - centroY),
      );
    }
  }

  /**
   * Centra el símbolo en un cuadrado de lado `lado` con el diámetro pedido.
   *
   * `diametro` va en dp del lienzo de 108, así que en un lienzo más pequeño
   * —los PNG por densidad— se reescala en la misma proporción y el icono se ve
   * igual en las cinco densidades.
   */
  const encajar = (lado, diametro) => {
    const escala = ((diametro / LADO) * lado) / (radioDelSimbolo * 2);
    return {
      escala,
      tx: (lado - caja.ancho * escala) / 2 - caja.minX * escala,
      ty: (lado - caja.alto * escala) / 2 - caja.minY * escala,
    };
  };

  const escritos = [];
  const anotar = ruta => escritos.push(ruta.replace(raiz, '').replace(/\\/g, '/'));

  // ─── Capas vectoriales del icono adaptativo ─────────────────────────────

  /*
    El dibujo va dentro del grupo desplazado 18 dp —el origen de la zona
    segura—, así que se encaja en el lienzo completo de 108 y se le resta ese
    desplazamiento. Encajarlo directamente en los 72 daría un símbolo mayor del
    pedido, porque el diámetro está expresado en dp del lienzo de 108.
  */
  const enElLienzo = encajar(LADO, DIAMETRO_EN_EL_LANZADOR);
  const margen = (LADO - ZONA_SEGURA) / 2;
  const dentro = {
    escala: enElLienzo.escala,
    tx: enElLienzo.tx - margen,
    ty: enElLienzo.ty - margen,
  };
  const colocado = ruta =>
    transformar(ruta.ordenes, dentro.escala, dentro.tx, dentro.ty);

  const capasDeFrente = [
    ...rellenos.map(
      ruta =>
        `    <path\n        android:fillColor="${aHex(color(ruta.relleno))}"\n        android:pathData="${aPathData(colocado(ruta))}" />`,
    ),
    ...trazos.map(
      ruta =>
        `    <path\n        android:strokeColor="#FFFFFFFF"\n        android:strokeWidth="${
          Math.round(ruta.anchoDeTrazo * dentro.escala * 1000) / 1000
        }"\n        android:pathData="${aPathData(colocado(ruta))}" />`,
    ),
  ];

  const rutaFrente = join(
    raiz,
    'android/app/src/main/res/drawable/ic_launcher_foreground.xml',
  );
  writeFileSync(
    rutaFrente,
    vector(
      CABECERA_FRENTE,
      `  <group android:translateX="18" android:translateY="18">\n${capasDeFrente.join('\n')}\n  </group>`,
    ),
  );
  anotar(rutaFrente);

  // La silueta de Android 13 es **una sola ruta con regla par-impar**: las
  // piezas del símbolo se solapan un poco entre sí, y con esa regla los
  // solapes se convierten en huecos. Es lo que reproduce las separaciones
  // blancas del logotipo en una capa que solo admite un tono.
  const silueta = rellenos.map(ruta => aPathData(colocado(ruta))).join(' ');
  const rutaMonocroma = join(
    raiz,
    'android/app/src/main/res/drawable/ic_launcher_monochrome.xml',
  );
  writeFileSync(
    rutaMonocroma,
    vector(
      CABECERA_MONOCROMA,
      `  <group android:translateX="18" android:translateY="18">\n    <path\n        android:fillColor="#FF000000"\n        android:fillType="evenOdd"\n        android:pathData="${silueta}" />\n  </group>`,
    ),
  );
  anotar(rutaMonocroma);

  writeFileSync(
    join(raiz, 'android/app/src/main/res/values/ic_launcher_background.xml'),
    COLOR_DE_FONDO,
  );
  anotar(join(raiz, 'android/app/src/main/res/values/ic_launcher_background.xml'));

  // ─── El logotipo completo, en blanco, para el arranque ──────────────────

  const completo = rutas
    .filter(ruta => ruta.relleno !== 'none')
    .map(
      ruta =>
        `    <path\n        android:fillColor="#FFFFFFFF"\n        android:pathData="${aPathData(ruta.ordenes)}" />`,
    )
    .join('\n');

  const rutaLogo = join(
    raiz,
    'android/app/src/main/res/drawable/logo_bsc_blanco.xml',
  );
  writeFileSync(rutaLogo, logotipoBlanco(completo));
  anotar(rutaLogo);

  // ─── Los PNG ────────────────────────────────────────────────────────────

  /**
   * Dibuja el icono ya compuesto, con su forma recortada.
   *
   * Android 7 y anteriores no saben de capas: reciben una imagen y la pintan
   * tal cual, así que el recorte —cuadrado redondeado o círculo— tiene que
   * venir hecho. De ahí que estos PNG no sean el mismo dibujo que la capa de
   * frente.
   */
  const componerIcono = (lado, forma, diametro = DIAMETRO_EN_EL_LANZADOR) => {
    const lienzo = new Float32Array(lado * lado * 4);
    const mascara =
      forma === 'circulo'
        ? [circulo(lado / 2, lado / 2, lado / 2)]
        : forma === 'cuadrado'
        ? [rectanguloRedondeado(0, 0, lado, lado, 0)]
        : [rectanguloRedondeado(0, 0, lado, lado, lado * 0.19)];

    componer(lienzo, cubrir(mascara, lado, lado), FONDO_DEL_ICONO);

    const caben = encajar(lado, diametro);
    const situar = ruta =>
      aplanar(transformar(ruta.ordenes, caben.escala, caben.tx, caben.ty));

    for (const ruta of rellenos) {
      componer(lienzo, cubrir(situar(ruta), lado, lado), color(ruta.relleno));
    }
    for (const ruta of trazos) {
      const trazo = contornosDeTrazo(
        situar(ruta),
        Math.max(0.75, ruta.anchoDeTrazo * caben.escala),
      );
      componer(lienzo, cubrir(trazo, lado, lado), [255, 255, 255, 255]);
    }

    return lienzo;
  };

  const densidades = [
    ['mdpi', 48],
    ['hdpi', 72],
    ['xhdpi', 96],
    ['xxhdpi', 144],
    ['xxxhdpi', 192],
  ];

  for (const [densidad, lado] of densidades) {
    const carpeta = join(raiz, `android/app/src/main/res/mipmap-${densidad}`);
    const cuadrado = join(carpeta, 'ic_launcher.png');
    const redondo = join(carpeta, 'ic_launcher_round.png');
    escribirPng(cuadrado, lado, lado, componerIcono(lado, 'redondeado'));
    escribirPng(redondo, lado, lado, componerIcono(lado, 'circulo'));
    anotar(cuadrado);
    anotar(redondo);
  }

  // La ficha de Google Play no sale del paquete: se sube aparte, a 512 y sin
  // transparencia. Se guarda junto al proyecto de Android por la misma razón
  // que el resto — para que salga del mismo dibujo.
  const play = join(raiz, 'android/app/src/main/ic_launcher-playstore.png');
  escribirPng(play, 512, 512, componerIcono(512, 'cuadrado', DIAMETRO_EN_LAS_TIENDAS), false);
  anotar(play);

  // iOS compone el redondeo por su cuenta y rechaza el canal alfa.
  const ios = join(
    raiz,
    'ios/BSCMobileAppRN/Images.xcassets/AppIcon.appiconset/AppIcon-1024.png',
  );
  escribirPng(ios, 1024, 1024, componerIcono(1024, 'cuadrado', DIAMETRO_EN_LAS_TIENDAS), false);
  anotar(ios);

  writeFileSync(
    join(
      raiz,
      'ios/BSCMobileAppRN/Images.xcassets/AppIcon.appiconset/Contents.json',
    ),
    CONTENIDO_DE_IOS,
  );
  anotar(
    join(
      raiz,
      'ios/BSCMobileAppRN/Images.xcassets/AppIcon.appiconset/Contents.json',
    ),
  );

  console.log(
    `Isotipo recortado del logotipo de marca: ${caja.ancho.toFixed(2)} × ${caja.alto.toFixed(2)} unidades, ` +
      `círculo envolvente ${(radioDelSimbolo * 2).toFixed(2)}.`,
  );
  console.log(
    `  diámetro en el lanzador ${DIAMETRO_EN_EL_LANZADOR} dp de 108 ` +
      `(${((DIAMETRO_EN_EL_LANZADOR / ZONA_SEGURA) * 100).toFixed(0)} % del área visible); en las tiendas ${DIAMETRO_EN_LAS_TIENDAS} dp.`,
  );
  for (const ruta of escritos) console.log(`  escrito ${ruta}`);
}

// ───────────────────────────────────────────────────────────────────────────
// 7. Plantillas
// ───────────────────────────────────────────────────────────────────────────

const CABECERA_FRENTE = `<!--
  Capa de frente del icono adaptativo: el isotipo de Banco Santa Cruz.

  **Generado.** No se edita a mano: sale de \`scripts/generar-iconos.mjs\`, que
  recorta el símbolo del logotipo de marca
  (\`libs/shared-ui-native/src/assets/logo-bsc.svg\`) y lo encaja en la zona segura. Si
  el banco entrega un logotipo nuevo, se sustituye ese SVG y se ejecuta
  \`npm run iconos\`.

  De los 108 dp de la capa solo los 72 centrales están garantizados: el
  desplazamiento de 18 sitúa el origen del dibujo justo donde empieza esa zona.
-->`;

const CABECERA_MONOCROMA = `<!--
  Silueta monocroma del icono, la tercera capa que pide Android 13.

  El sistema la recolorea con la paleta del fondo de pantalla cuando el cliente
  enciende los iconos temáticos. Sin ella, la aplicación del banco se queda como
  la única ajena del cajón.

  **Generado.** Ver \`scripts/generar-iconos.mjs\`.

  Una capa monocroma solo admite un tono, así que las separaciones blancas del
  logotipo no se pueden pintar: se consiguen con la regla de relleno par-impar,
  que convierte en hueco cada zona donde dos piezas del símbolo se solapan.
-->`;

function vector(cabecera, cuerpo) {
  return `<?xml version="1.0" encoding="utf-8"?>
${cabecera}
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
${cuerpo}
</vector>
`;
}

function logotipoBlanco(cuerpo) {
  return `<?xml version="1.0" encoding="utf-8"?>
<!--
  El logotipo completo de Banco Santa Cruz, teñido de blanco.

  Lo usa el fondo de la pantalla de arranque, que se pinta antes de que exista
  React Native: ahí no hay componentes, solo recursos de Android, así que el
  logotipo tiene que existir también como vector nativo. Es el mismo dibujo que
  \`BscLogo\` pinta dentro de la aplicación, de modo que al entregar el relevo no
  se vea saltar.

  **Generado.** Ver \`scripts/generar-iconos.mjs\`.
-->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="256.341dp"
    android:height="100.461dp"
    android:viewportWidth="256.341"
    android:viewportHeight="100.461">
${cuerpo}
</vector>
`;
}

const COLOR_DE_FONDO = `<?xml version="1.0" encoding="utf-8"?>
<!--
  El color de fondo del icono adaptativo.

  Es **blanco**, y no el azul institucional, porque el isotipo lleva el azul y
  el verde de la marca: sobre el azul corporativo la mitad del símbolo
  desaparecería. Es además el fondo sobre el que el banco entregó el asset.

  Está aquí como recurso propio y no escrito dentro del XML del icono para que
  el banco pueda cambiarlo sin tocar la composición de las capas.
-->
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
`;

const CONTENIDO_DE_IOS = `{
  "images" : [
    {
      "filename" : "AppIcon-1024.png",
      "idiom" : "universal",
      "platform" : "ios",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "bsc",
    "version" : 1
  }
}
`;

main();
