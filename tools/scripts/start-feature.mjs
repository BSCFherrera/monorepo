#!/usr/bin/env node
// Inicia el trabajo sobre un ticket de Jira en este monorepo, en dos pasos:
//   1. framework:new-change del framework IA-SDLC (BSC.genesis.ia.sdlc): crea el change
//      de OpenSpec (openspec/changes/<jiraId>-<slug>/, con jira-context.md) y la rama
//      <prefijo>/<JIRA-ID>-<slug>, con el prefijo de framework.config.json -> branchPrefixes.
//   2. Abre Claude Code en el monorepo con el playbook sdd ya disparado: "run sdd on <JIRA-ID>".
//
// Uso (desde la raíz del monorepo):
//   pnpm feature:start <jiraId> <ticketType> "<title>" [--dry-run]
//   pnpm feature:start GEN-123 story "Consultar saldo de cuentas"
//
//   ticketType   story | bug | task | spike | spec (las claves de branchPrefixes del framework)
//   --dry-run    valida todo y muestra los comandos, sin ejecutarlos
//
// El framework se busca en ../BSC.genesis.ia.sdlc (carpeta hermana del monorepo); otra
// ubicación se indica con la variable de entorno BSC_SDLC_PATH.
//
// Se ejecuta el mismo comando que `npm run framework:new-change` (node ./scripts/run-ps.mjs
// create-change.ps1) sin pasar por npm: en Windows npm es un .cmd que necesita shell, y la
// shell reinterpretaría las comillas y los caracteres especiales del título.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv, env, execPath, exit, platform, stderr, stdout } from 'node:process';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SDLC = resolve(env.BSC_SDLC_PATH ?? join(RAIZ, '..', 'BSC.genesis.ia.sdlc'));

const USO =
  'Uso: pnpm feature:start <jiraId> <ticketType> "<title>" [--dry-run]\n' +
  '  ej.: pnpm feature:start GEN-123 story "Consultar saldo de cuentas"\n';

function fallar(mensaje) {
  stderr.write(`\n  ✖ ${mensaje}\n\n`);
  exit(1);
}

function leerJson(ruta) {
  // framework.config.json lo escribe PowerShell y puede traer BOM.
  return JSON.parse(readFileSync(ruta, 'utf8').replace(/^\uFEFF/, ''));
}

function git(...args) {
  const r = spawnSync('git', args, { cwd: RAIZ, encoding: 'utf8' });
  if (r.error) fallar(`No se pudo ejecutar git: ${r.error.message}`);
  return { ok: r.status === 0, salida: (r.stdout ?? '').trim() };
}

// Mismo slug que ConvertTo-Slug (scripts/change-common.ps1 del framework): se quitan
// las tildes y la eñe (descomposición NFD sin marcas), minúsculas, y todo lo que no
// sea [a-z0-9] → "-". Si difiere, la rama que se verifica no sería la que se crea.
function slugDe(titulo) {
  return titulo
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ─── Argumentos ─────────────────────────────────────────────────────────────

const args = argv.slice(2).filter((a) => a !== '--');
if (args.includes('--help') || args.includes('-h')) {
  stdout.write(USO);
  exit(0);
}
const dryRun = args.includes('--dry-run');
const posicionales = args.filter((a) => a !== '--dry-run');
const desconocidos = posicionales.filter((a) => a.startsWith('--'));
if (desconocidos.length > 0) fallar(`Opción desconocida: ${desconocidos.join(', ')}\n\n${USO}`);
if (posicionales.length !== 3)
  fallar(`Se esperan 3 argumentos: jiraId, ticketType y title.\n\n${USO}`);

const [jiraIdCrudo, tipoCrudo, tituloCrudo] = posicionales;
const jiraId = jiraIdCrudo.trim().toUpperCase();
const tipo = tipoCrudo.trim().toLowerCase();
const titulo = tituloCrudo.trim();

const runPs = join(SDLC, 'scripts', 'run-ps.mjs');
if (!existsSync(runPs)) {
  fallar(
    `No se encontró el framework IA-SDLC en ${SDLC}.\n` +
      '    Clónalo junto al monorepo o indica su ruta con BSC_SDLC_PATH.',
  );
}

const config = leerJson(join(RAIZ, 'framework.config.json'));
const claveProyecto = config.jira?.projectKey;
const ramaBase = config.repository?.defaultBranch ?? 'develop';
// Los prefijos de rama los aplica create-change.ps1 con la configuración del
// framework, no con la del monorepo: se validan contra esa.
const prefijos = leerJson(join(SDLC, 'framework.config.json')).branchPrefixes ?? {};

if (!/^[A-Z][A-Z0-9]+-[0-9]+$/.test(jiraId)) {
  fallar(`jiraId inválido: "${jiraIdCrudo}". Formato esperado: ${claveProyecto ?? 'PROJ'}-123.`);
}
if (claveProyecto && !jiraId.startsWith(`${claveProyecto}-`)) {
  fallar(
    `El ticket ${jiraId} no es del proyecto de Jira ${claveProyecto} (framework.config.json).`,
  );
}
if (!Object.hasOwn(prefijos, tipo)) {
  fallar(`ticketType inválido: "${tipoCrudo}". Valores: ${Object.keys(prefijos).join(', ')}.`);
}
const slug = slugDe(titulo);
if (slug === '') fallar('El título no puede estar vacío ni tener solo símbolos.');

const nombreChange = `${jiraId.toLowerCase()}-${slug}`;
const rama = `${prefijos[tipo]}/${jiraId}-${slug}`;

// ─── Verificaciones previas (antes de tocar nada) ───────────────────────────

const ramaActual = git('branch', '--show-current').salida;
if (ramaActual !== ramaBase) {
  fallar(
    `Estás en la rama "${ramaActual}". Cambia a ${ramaBase} (y actualízala) antes de iniciar un ticket.`,
  );
}
if (git('status', '--porcelain').salida !== '') {
  fallar(
    'Hay cambios sin confirmar. Confírmalos o guárdalos (git stash) antes de iniciar un ticket.',
  );
}
if (git('rev-parse', '--verify', '--quiet', `refs/heads/${rama}`).ok) {
  fallar(`La rama ${rama} ya existe.`);
}
if (existsSync(join(RAIZ, 'openspec', 'changes', nombreChange))) {
  fallar(`El change openspec/changes/${nombreChange} ya existe.`);
}

// En Windows, Claude Code instalado con npm es un .cmd: sin shell no arranca.
const claudeConShell = platform === 'win32';
const claude = spawnSync('claude', ['--version'], { encoding: 'utf8', shell: claudeConShell });
if (claude.error || claude.status !== 0) {
  fallar(
    'No se encontró Claude Code (`claude`) en PATH. Instálalo e inicia sesión antes de continuar.',
  );
}

const argsNewChange = [
  runPs,
  'create-change.ps1',
  '-JiraId',
  jiraId,
  '-Type',
  tipo,
  '-Title',
  titulo,
  '-CreateBranch',
  '-TargetPath',
  RAIZ,
];
const promptSdd = `run sdd on ${jiraId}`;

stdout.write(
  `\n  Ticket   ${jiraId} (${tipo}) — ${titulo}\n` +
    `  Change   openspec/changes/${nombreChange}\n` +
    `  Rama     ${rama}  (desde ${ramaBase})\n` +
    `  Claude   ${claude.stdout.trim()}\n\n`,
);

if (dryRun) {
  stdout.write(
    '  --dry-run: no se ejecuta nada. Comandos:\n' +
      `    1. (en ${SDLC})\n` +
      `       npm run framework:new-change -- -JiraId ${jiraId} -Type ${tipo} -Title "${titulo}" -CreateBranch -TargetPath "${RAIZ}"\n` +
      `    2. (en ${RAIZ})\n` +
      `       claude "${promptSdd}"\n\n`,
  );
  exit(0);
}

// ─── 1. framework:new-change ────────────────────────────────────────────────

stdout.write('  1/2  framework:new-change\n\n');
const paso1 = spawnSync(execPath, argsNewChange, { cwd: SDLC, stdio: 'inherit' });
if (paso1.error) fallar(`No se pudo ejecutar framework:new-change: ${paso1.error.message}`);
if (paso1.status !== 0) fallar(`framework:new-change terminó con código ${paso1.status}.`);

// create-change.ps1 no revisa el resultado de `git checkout -b`: se confirma aquí.
const ramaNueva = git('branch', '--show-current').salida;
if (ramaNueva !== rama) {
  fallar(
    `Se esperaba la rama ${rama} y la actual es "${ramaNueva}". Revisa la salida de framework:new-change.`,
  );
}
if (!existsSync(join(RAIZ, 'openspec', 'changes', nombreChange))) {
  fallar(`No se creó openspec/changes/${nombreChange}. Revisa la salida de framework:new-change.`);
}

// ─── 2. run sdd ─────────────────────────────────────────────────────────────

stdout.write(
  `\n  2/2  claude "${promptSdd}"\n` +
    '       El playbook sdd se detiene para tu aprobación después de business-spec,\n' +
    '       test-plan, tech-spec y plan: responde dentro de la sesión de Claude.\n\n',
);
// jiraId ya está validado ([A-Z0-9-]), así que el prompt es seguro también con shell.
const paso2 = spawnSync('claude', [claudeConShell ? `"${promptSdd}"` : promptSdd], {
  cwd: RAIZ,
  stdio: 'inherit',
  shell: claudeConShell,
});
if (paso2.error) fallar(`No se pudo abrir Claude Code: ${paso2.error.message}`);
exit(paso2.status ?? 1);
