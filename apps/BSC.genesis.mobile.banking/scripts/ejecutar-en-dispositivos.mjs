#!/usr/bin/env node
/**
 * Levanta la app en el emulador de Android y en el simulador de iOS, en modo debug.
 *
 *   pnpm banking:run                     Android + iOS (iOS solo en macOS)
 *   pnpm banking:run --android           solo Android
 *   pnpm banking:run --ios               solo iOS
 *   pnpm banking:run --reset-cache       arranca Metro con la caché vacía
 *   pnpm banking:run --avd <nombre>      emulador de Android a arrancar si no hay ninguno
 *   pnpm banking:run --simulator <nombre> simulador de iOS a arrancar si no hay ninguno
 *   pnpm banking:run --stop              detiene el Metro que arrancó este script
 *
 * Pasos:
 *   0. Comprueba que node_modules corresponde a pnpm-lock.yaml (si no, pide `pnpm install`).
 *   1. Metro: si ya responde en :8081 lo reutiliza; si no, lo arranca en segundo plano
 *      (`nx run <app>:start`) y deja el registro en la carpeta temporal del sistema.
 *   2. Android: si `adb` no ve ningún dispositivo, arranca un emulador y espera a que
 *      termine de iniciar. En los emuladores fija `metro.host=localhost` (ver
 *      conexionConMetro), abre el túnel `adb reverse` y comprueba que Metro responde
 *      desde el dispositivo. Después, `nx run <app>:android`; al terminar lo comprueba
 *      de nuevo (reabre la app si hubo que volver a fijarlo) y confirma en el registro
 *      de la app que cargó el JS antes de dar Android por bueno.
 *   3. iOS: si no hay ningún simulador encendido, arranca uno (un iPhone por defecto).
 *      Después, `nx run <app>:ios --no-packager --udid <simulador>`.
 *
 * Metro queda corriendo al terminar, para recargar con los cambios. Se detiene con
 * `--stop`, o cerrando el proceso si lo arrancaste tú.
 */

import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

const PROYECTO = 'BSC.genesis.mobile.banking';
const RAIZ_REPO = new URL('../../..', import.meta.url);
const PUERTO_METRO = 8081;
const esWindows = process.platform === 'win32';
const esMac = process.platform === 'darwin';

const CARPETA_TEMPORAL = join(tmpdir(), 'bsc-mobile-banking');
const ARCHIVO_PID_METRO = join(CARPETA_TEMPORAL, 'metro.pid');
const REGISTRO_METRO = join(CARPETA_TEMPORAL, 'metro.log');

const USO = `Uso: pnpm banking:run [--android] [--ios] [--reset-cache] [--avd <nombre>] [--simulator <nombre>] [--stop]\n`;

function fallar(mensaje) {
  process.stderr.write(`\n  ✖ ${mensaje}\n\n`);
  process.exit(1);
}

function paso(texto) {
  process.stdout.write(`\n▸ ${texto}\n`);
}

function info(texto) {
  process.stdout.write(`  ${texto}\n`);
}

const esperar = ms => new Promise(listo => setTimeout(listo, ms));

// ─── Argumentos ─────────────────────────────────────────────────────────────

function leerArgumentos(args) {
  const opciones = {
    android: false,
    ios: false,
    resetCache: false,
    stop: false,
    avd: undefined,
    simulador: undefined,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--') continue;
    else if (a === '--help' || a === '-h') {
      process.stdout.write(USO);
      process.exit(0);
    } else if (a === '--android') opciones.android = true;
    else if (a === '--ios') opciones.ios = true;
    else if (a === '--reset-cache') opciones.resetCache = true;
    else if (a === '--stop') opciones.stop = true;
    else if (a === '--avd' || a === '--simulator') {
      const valor = args[++i];
      if (!valor || valor.startsWith('--'))
        fallar(`${a} necesita un nombre.\n\n${USO}`);
      if (a === '--avd') opciones.avd = valor;
      else opciones.simulador = valor;
    } else fallar(`Opción desconocida: ${a}\n\n${USO}`);
  }
  // Sin --android ni --ios: las dos plataformas que permite el sistema.
  if (!opciones.android && !opciones.ios) {
    opciones.android = true;
    opciones.ios = esMac;
  }
  if (opciones.ios && !esMac) fallar('iOS solo se puede compilar en macOS.');
  return opciones;
}

// ─── Utilidades de procesos ─────────────────────────────────────────────────

function ejecutar(comando, args, opciones = {}) {
  return spawnSync(comando, args, { encoding: 'utf8', ...opciones });
}

/** Lanza una tarea de Nx del proyecto con la salida en la terminal. */
function tareaNx(objetivo, args) {
  // En Windows pnpm es un .cmd y necesita shell; los argumentos son fijos o validados.
  return spawnSync('pnpm', ['nx', 'run', `${PROYECTO}:${objetivo}`, ...args], {
    cwd: RAIZ_REPO,
    stdio: 'inherit',
    shell: esWindows,
  });
}

// ─── 0. Dependencias ────────────────────────────────────────────────────────

/**
 * pnpm guarda en node_modules/.pnpm/lock.yaml una copia del lockfile con el que
 * instaló. Si no coincide con pnpm-lock.yaml (p. ej. tras cambiar de rama), Metro
 * compila contra paquetes que ya no son los del código y la app falla al abrir.
 */
function verificarDependencias() {
  const instalado = new URL('node_modules/.pnpm/lock.yaml', RAIZ_REPO);
  const esperado = new URL('pnpm-lock.yaml', RAIZ_REPO);
  if (
    !existsSync(instalado) ||
    !readFileSync(instalado).equals(readFileSync(esperado))
  ) {
    fallar(
      'Las dependencias instaladas no coinciden con pnpm-lock.yaml (¿cambiaste de rama?).\n' +
        '    Ejecuta: pnpm install',
    );
  }
}

// ─── 1. Metro ───────────────────────────────────────────────────────────────

async function metroResponde() {
  try {
    const r = await fetch(`http://localhost:${PUERTO_METRO}/status`, {
      signal: AbortSignal.timeout(1500),
    });
    return (await r.text()).includes('packager-status:running');
  } catch {
    return false;
  }
}

async function asegurarMetro(resetCache) {
  paso('Metro');
  if (await metroResponde()) {
    info(`Ya está corriendo en :${PUERTO_METRO}; se reutiliza.`);
    if (resetCache)
      info(
        '--reset-cache no aplica a un Metro que ya estaba corriendo (usa --stop primero).',
      );
    return;
  }
  mkdirSync(CARPETA_TEMPORAL, { recursive: true });
  const registro = openSync(REGISTRO_METRO, 'w');
  const hijo = spawn(
    'pnpm',
    [
      'nx',
      'run',
      `${PROYECTO}:start`,
      ...(resetCache ? ['--reset-cache'] : []),
    ],
    {
      cwd: RAIZ_REPO,
      detached: true,
      stdio: ['ignore', registro, registro],
      shell: esWindows,
      windowsHide: true,
    },
  );
  hijo.unref();
  writeFileSync(ARCHIVO_PID_METRO, String(hijo.pid));
  info(`Arrancando en segundo plano (registro: ${REGISTRO_METRO})…`);
  for (let s = 0; s < 120; s++) {
    if (await metroResponde()) {
      info('Listo.');
      return;
    }
    await esperar(1000);
  }
  fallar(`Metro no respondió en 2 minutos. Revisa ${REGISTRO_METRO}.`);
}

function detenerMetro() {
  paso('Detener Metro');
  if (!existsSync(ARCHIVO_PID_METRO)) {
    info('No hay un Metro arrancado por este script.');
    return;
  }
  const pid = Number(readFileSync(ARCHIVO_PID_METRO, 'utf8'));
  try {
    if (esWindows) ejecutar('taskkill', ['/PID', String(pid), '/T', '/F']);
    // Arrancó con `detached`: es líder de su grupo, así que se detiene el grupo entero.
    else process.kill(-pid, 'SIGTERM');
    info(`Detenido (PID ${pid}).`);
  } catch {
    info(`El proceso ${pid} ya no existía.`);
  }
  rmSync(ARCHIVO_PID_METRO, { force: true });
}

// ─── 2. Android ─────────────────────────────────────────────────────────────

function sdkAndroid() {
  const candidatos = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    esWindows ? join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk') : null,
    esMac
      ? join(homedir(), 'Library', 'Android', 'sdk')
      : join(homedir(), 'Android', 'Sdk'),
  ];
  return candidatos.find(ruta => ruta && existsSync(ruta));
}

function herramienta(sdk, carpeta, nombre) {
  return join(sdk, carpeta, esWindows ? `${nombre}.exe` : nombre);
}

function dispositivosAndroid(adb) {
  return ejecutar(adb, ['devices'])
    .stdout.split('\n')
    .map(linea => linea.trim().split(/\s+/))
    .filter(([serie, estado]) => serie && estado === 'device')
    .map(([serie]) => serie);
}

async function asegurarEmulador(avdPedido) {
  const sdk = sdkAndroid();
  if (!sdk) fallar('No se encontró el SDK de Android. Define ANDROID_HOME.');
  const adb = herramienta(sdk, 'platform-tools', 'adb');
  const emulador = herramienta(sdk, 'emulator', 'emulator');

  const conectados = dispositivosAndroid(adb);
  if (conectados.length > 0) {
    info(`Dispositivo conectado: ${conectados.join(', ')}.`);
    return adb;
  }
  const avds = ejecutar(emulador, ['-list-avds'])
    .stdout.split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  if (avds.length === 0)
    fallar(
      'No hay emuladores (AVD) creados. Crea uno en Android Studio › Device Manager.',
    );
  const avd = avdPedido ?? avds[0];
  if (!avds.includes(avd))
    fallar(`No existe el emulador "${avd}". Disponibles: ${avds.join(', ')}.`);

  info(`Arrancando el emulador ${avd}…`);
  spawn(emulador, ['-avd', avd], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  }).unref();
  ejecutar(adb, ['wait-for-device'], { timeout: 180_000 });
  for (let s = 0; s < 180; s++) {
    if (
      ejecutar(adb, [
        'shell',
        'getprop',
        'sys.boot_completed',
      ]).stdout.trim() === '1'
    ) {
      info('Emulador listo.');
      return adb;
    }
    await esperar(1000);
  }
  fallar(`El emulador ${avd} no terminó de iniciar en 3 minutos.`);
}

/**
 * La compilación de depuración solo permite tráfico en claro hacia `localhost`
 * (src/debug/res/xml/configuracion_de_red.xml), así que la app tiene que llegar
 * a Metro por `localhost:8081` y el túnel `adb reverse`.
 *
 * En un emulador, React Native no usa `localhost` sino el alias `10.0.2.2`,
 * que esa política bloquea («CLEARTEXT communication to 10.0.2.2 not
 * permitted»): la app abre con «Unable to load script». Antes de ese alias
 * React Native mira la propiedad del sistema `metro.host`, así que se fija en
 * `localhost`. Solo `root` puede fijarla y se pierde al reiniciar el emulador,
 * por eso se repite en cada ejecución.
 *
 * Al final se comprueba desde dentro del dispositivo que Metro responde.
 *
 * @returns {{fallidos: {serie: string, motivo: string}[], cambiados: string[]}}
 *   los dispositivos que no llegan a Metro y aquellos en los que hubo que fijar
 *   `metro.host` (la app que ya estuviera abierta ahí no lo ha leído).
 */
function conexionConMetro(adb) {
  const fallidos = [];
  const cambiados = [];
  for (const serie of dispositivosAndroid(adb)) {
    const enSerie = (...args) => ejecutar(adb, ['-s', serie, ...args]);
    if (serie.startsWith('emulator-')) {
      if (
        enSerie('shell', 'getprop', 'metro.host').stdout.trim() !== 'localhost'
      ) {
        // `adb root` reinicia adbd: hay que esperar a que el dispositivo vuelva.
        enSerie('root');
        enSerie('wait-for-device');
        if (
          enSerie('shell', 'setprop', 'metro.host', 'localhost').status !== 0
        ) {
          fallidos.push({
            serie,
            motivo:
              'no se pudo fijar metro.host (la imagen del emulador no permite `adb root`; ' +
              'usa una imagen «Google APIs», no «Google Play»)',
          });
          continue;
        }
        cambiados.push(serie);
      }
    }
    enSerie('reverse', `tcp:${PUERTO_METRO}`, `tcp:${PUERTO_METRO}`);
    // La espera mantiene abierta la entrada de `nc`: si se cierra, `nc` corta la
    // conexión antes de que llegue la respuesta y la prueba falla aunque el túnel funcione.
    const prueba = enSerie(
      'shell',
      `(printf 'GET /status HTTP/1.0\\r\\n\\r\\n'; sleep 2) | nc -w 5 127.0.0.1 ${PUERTO_METRO}`,
    );
    if (!(prueba.stdout ?? '').includes('packager-status:running')) {
      fallidos.push({ serie, motivo: 'no llega a Metro por `adb reverse`' });
    }
  }
  return { fallidos, cambiados };
}

/** El applicationId, leído del build.gradle para no repetirlo aquí. */
function paqueteAndroid() {
  const gradle = readFileSync(
    new URL('../android/app/build.gradle', import.meta.url),
    'utf8',
  );
  const m = gradle.match(/applicationId\s+"([^"]+)"/);
  if (!m) fallar('No se encontró applicationId en android/app/build.gradle.');
  return m[1];
}

function relanzarApp(adb, serie, paquete) {
  ejecutar(adb, ['-s', serie, 'shell', 'am', 'force-stop', paquete]);
  ejecutar(adb, ['-s', serie, 'logcat', '-c']);
  ejecutar(adb, [
    '-s',
    serie,
    'shell',
    'monkey',
    '-p',
    paquete,
    '-c',
    'android.intent.category.LAUNCHER',
    '1',
  ]);
}

/**
 * Confirma en el registro de la propia app que cargó el JS: React Native escribe
 * `Running "<componente>"` al arrancar y «Unable to load script» si no llega a Metro.
 * Sin esto, una compilación correcta no dice nada de si la app abrió.
 *
 * @returns {Promise<{serie: string, motivo: string}[]>}
 */
async function verificarCarga(adb, paquete) {
  const fallidos = [];
  for (const serie of dispositivosAndroid(adb)) {
    let motivo = 'no confirmó la carga del JS en 60 s';
    for (let s = 0; s < 60; s++) {
      const pid = ejecutar(adb, [
        '-s',
        serie,
        'shell',
        'pidof',
        paquete,
      ]).stdout.trim();
      if (pid) {
        const registro = ejecutar(adb, [
          '-s',
          serie,
          'logcat',
          '-d',
          `--pid=${pid}`,
        ]).stdout;
        if (registro.includes('ReactNativeJS: Running "')) {
          motivo = '';
          break;
        }
        if (registro.includes('Unable to load script')) {
          motivo = registro.includes('CLEARTEXT')
            ? 'la app buscó Metro fuera de localhost (CLEARTEXT bloqueado)'
            : 'la app no pudo cargar el JS («Unable to load script»)';
          break;
        }
      }
      await esperar(1000);
    }
    if (motivo) fallidos.push({ serie, motivo });
  }
  return fallidos;
}

// ─── 3. iOS ─────────────────────────────────────────────────────────────────

function simuladores() {
  const r = ejecutar('xcrun', [
    'simctl',
    'list',
    'devices',
    'available',
    '--json',
  ]);
  if (r.status !== 0)
    fallar(
      'No se pudo listar los simuladores (`xcrun simctl`). ¿Está instalado Xcode?',
    );
  return Object.values(JSON.parse(r.stdout).devices).flat();
}

function asegurarSimulador(nombrePedido) {
  if (!existsSync(new URL('../ios/Pods', import.meta.url))) {
    fallar(
      `Faltan los pods de iOS. Ejecuta: cd apps/${PROYECTO}/ios && pod install`,
    );
  }
  const lista = simuladores();
  const encendido = lista.find(
    s => s.state === 'Booted' && (!nombrePedido || s.name === nombrePedido),
  );
  if (encendido) {
    info(`Simulador encendido: ${encendido.name} (${encendido.udid}).`);
    return encendido.udid;
  }
  const elegido = nombrePedido
    ? lista.find(s => s.name === nombrePedido)
    : lista.find(s => s.name.startsWith('iPhone'));
  if (!elegido) {
    fallar(
      nombrePedido
        ? `No existe el simulador "${nombrePedido}".`
        : 'No hay simuladores de iPhone disponibles.',
    );
  }
  info(`Arrancando el simulador ${elegido.name}…`);
  const arranque = ejecutar('xcrun', ['simctl', 'boot', elegido.udid]);
  if (arranque.status !== 0)
    fallar(`No se pudo arrancar el simulador: ${arranque.stderr.trim()}`);
  ejecutar('open', ['-a', 'Simulator']);
  return elegido.udid;
}

// ─── Principal ──────────────────────────────────────────────────────────────

const opciones = leerArgumentos(process.argv.slice(2));

if (opciones.stop) {
  detenerMetro();
  process.exit(0);
}

verificarDependencias();
await asegurarMetro(opciones.resetCache);

const resultados = [];

if (opciones.android) {
  paso('Android');
  const adb = await asegurarEmulador(opciones.avd);
  const paquete = paqueteAndroid();
  const antes = conexionConMetro(adb);
  // El objetivo `android` ya pasa --no-packager y --active-arch-only (project.json).
  const r = tareaNx('android', []);
  let fallidos = antes.fallidos;
  if (r.status === 0 && fallidos.length === 0) {
    // Un emulador que arrancó de una instantánea puede descartarla y reiniciar en
    // frío durante la compilación: `metro.host` se pierde y la app abre contra
    // 10.0.2.2. Se comprueba de nuevo y, si hubo que fijarlo, se reabre la app.
    const despues = conexionConMetro(adb);
    for (const serie of despues.cambiados) relanzarApp(adb, serie, paquete);
    fallidos = [...despues.fallidos, ...(await verificarCarga(adb, paquete))];
  }
  if (r.status !== 0)
    resultados.push(['Android — la compilación falló', false]);
  else if (fallidos.length > 0) {
    const detalle = fallidos.map(f => `${f.serie}: ${f.motivo}`).join('; ');
    resultados.push([`Android — ${detalle}`, false]);
  } else resultados.push(['Android', true]);
}

if (opciones.ios) {
  paso('iOS');
  const udid = asegurarSimulador(opciones.simulador);
  const r = tareaNx('ios', ['--no-packager', '--udid', udid]);
  resultados.push(['iOS', r.status === 0]);
}

paso('Resultado');
for (const [plataforma, ok] of resultados)
  info(`${ok ? '✔' : '✖'} ${plataforma}`);
info(
  `Metro sigue corriendo en :${PUERTO_METRO}. Para detenerlo: pnpm banking:run --stop`,
);
process.exit(resultados.every(([, ok]) => ok) ? 0 : 1);
