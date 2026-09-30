#!/usr/bin/env node
/**
 * Generates `src/tokens/generated/figma.ts` from the DTCG snapshot in `figma/`.
 *
 *   node scripts/generate-from-figma.cjs          write the file
 *   node scripts/generate-from-figma.cjs --check  exit 1 if the file is stale
 *
 * The snapshot is the Figma library's variables, read-only, one JSON file per
 * collection and mode (see `figma/README.md`). This script only reshapes it
 * into TypeScript: names become camelCase property paths
 * (`action/primary-pressed` → `action.primaryPressed`), aliases become
 * references to `figmaPalette`, dimensions become plain numbers.
 *
 * No dependencies on purpose: it runs anywhere Node runs, including the
 * design-system token tests, which uses `generate()` as the drift check.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const FIGMA_DIR = path.join(ROOT, 'figma');
const OUT_FILE = path.join(ROOT, 'src', 'tokens', 'generated', 'figma.ts');

// ─── Helpers ───────────────────────────────────────────────────────────────

const readJson = (dir, file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));

const isToken = (node) => node !== null && typeof node === 'object' && '$type' in node;

const camel = (segment) => segment.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

/** Object key as it should appear in TS source. */
function key(segment) {
  const k = camel(segment);
  if (/^\d+$/.test(k)) return k;
  if (/^[A-Za-z_$][\w$]*$/.test(k)) return k;
  return `'${k}'`;
}

/** Property access for a path under `figmaPalette`, e.g. brand.neutral[50]. */
function access(root, segments) {
  return (
    root +
    segments
      .map((s) => {
        const k = camel(s);
        return /^[A-Za-z_$][\w$]*$/.test(k) ? `.${k}` : `[${/^\d+$/.test(k) ? k : `'${k}'`}]`;
      })
      .join('')
  );
}

const px = (dimension) => {
  if (dimension.unit !== 'px') throw new Error(`Only px dimensions are supported, got ${dimension.unit}`);
  return dimension.value;
};

/** Walks a DTCG tree and renders nested object literal source. */
function render(tree, leaf, indent = 1) {
  const pad = '  '.repeat(indent);
  const lines = Object.entries(tree).map(([k, v]) =>
    isToken(v)
      ? `${pad}${key(k)}: ${leaf(v, k)},`
      : `${pad}${key(k)}: {\n${render(v, leaf, indent + 1)}\n${pad}},`,
  );
  return lines.join('\n');
}

/** Renders the TS interface for a tree whose leaves are all `leafType`. */
function renderType(tree, leafType, indent = 1) {
  const pad = '  '.repeat(indent);
  return Object.entries(tree)
    .map(([k, v]) =>
      isToken(v)
        ? `${pad}${key(k)}: ${leafType};`
        : `${pad}${key(k)}: {\n${renderType(v, leafType, indent + 1)}\n${pad}};`,
    )
    .join('\n');
}

/** Resolves `{a.b.c}` inside a tree. */
function lookup(tree, ref) {
  const segments = ref.slice(1, -1).split('.');
  let node = tree;
  for (const s of segments) {
    node = node?.[s];
    if (node === undefined) throw new Error(`Unresolved alias ${ref}`);
  }
  return node;
}

// ─── Sections ──────────────────────────────────────────────────────────────

function palette(dir) {
  const prim = readJson(dir, 'primitives.json');
  const body = render(prim, (t) => `'${t.$value}'`);
  return { prim, src: `export const figmaPalette = {\n${body}\n} as const;` };
}

function semantic(dir, prim) {
  const light = readJson(dir, 'semantic.light.json');
  const dark = readJson(dir, 'semantic.dark.json');
  const leaf = (t) => {
    const v = t.$value;
    if (v.startsWith('{')) {
      lookup(prim, v); // fail loudly on a broken alias
      return access('figmaPalette', v.slice(1, -1).split('.'));
    }
    return `'${v}'`;
  };
  return [
    '/** Shape shared by both modes of the semantic collection. */',
    `export interface FigmaSemanticColors {\n${renderType(light, 'string')}\n}`,
    '',
    `export const figmaSemanticLight: FigmaSemanticColors = {\n${render(light, leaf)}\n};`,
    '',
    `export const figmaSemanticDark: FigmaSemanticColors = {\n${render(dark, leaf)}\n};`,
  ].join('\n');
}

function spaceAndRadius(dir) {
  const sr = readJson(dir, 'space-radius.json');
  return [
    `export const figmaSpace = {\n${render(sr.space, (t) => px(t.$value))}\n} as const;`,
    '',
    `export const figmaRadius = {\n${render(sr.radius, (t) => px(t.$value))}\n} as const;`,
  ].join('\n');
}

function typography(dir) {
  const ty = readJson(dir, 'typography.json');
  const weight = (t) => `'${t.$value}'`; // React Native wants weights as strings
  const out = [
    `export const figmaFontFamily = '${ty.family.primary.$value}';`,
    '',
    `export const figmaFontWeight = {\n${render(ty.weight, weight)}\n} as const;`,
    '',
    `export const figmaFontSize = {\n${render(ty.size, (t) => px(t.$value))}\n} as const;`,
    '',
    `export const figmaLineHeight = {\n${render(ty['line-height'], (t) => px(t.$value))}\n} as const;`,
    '',
    `export const figmaLetterSpacing = {\n${render(ty['letter-spacing'], (t) => px(t.$value))}\n} as const;`,
    '',
  ];

  // Text styles are keyed by their exact Figma name ("Body S/14 SemiBold") so
  // a style found in the file can be searched for here verbatim.
  const styles = [];
  for (const [group, members] of Object.entries(ty['text-style'])) {
    for (const [name, token] of Object.entries(members)) {
      const v = token.$value;
      const val = (ref) => lookup(ty, ref).$value;
      styles.push(
        `  '${group}/${name}': { fontSize: ${px(val(v.fontSize))}, fontWeight: '${val(v.fontWeight)}', ` +
          `lineHeight: ${px(val(v.lineHeight))}, letterSpacing: ${px(val(v.letterSpacing))} },`,
      );
    }
  }
  out.push(
    '/** The library\'s 44 text styles. Line height and letter spacing in px. */',
    `export const figmaTextStyles = {\n${styles.join('\n')}\n} as const;`,
    '',
    'export type FigmaTextStyleName = keyof typeof figmaTextStyles;',
  );
  return out.join('\n');
}

function effects(dir) {
  const render1 = (fx) =>
    Object.entries(fx.shadow)
      .map(([size, token]) => {
        const layers = token.$value
          .map(
            (l) =>
              `    { color: '${l.color}', offsetX: ${px(l.offsetX)}, offsetY: ${px(l.offsetY)}, ` +
              `blur: ${px(l.blur)}, spread: ${px(l.spread)} },`,
          )
          .join('\n');
        return `  ${key(size)}: [\n${layers}\n  ],`;
      })
      .join('\n');
  const light = readJson(dir, 'effects.light.json');
  const dark = readJson(dir, 'effects.dark.json');
  return [
    '/** One drop-shadow layer, as Figma and CSS describe it. */',
    'export interface FigmaShadowLayer {',
    '  /** `#RRGGBBAA` — the opacity lives in the color. */',
    '  color: string;',
    '  offsetX: number;',
    '  offsetY: number;',
    '  blur: number;',
    '  spread: number;',
    '}',
    '',
    `export type FigmaShadowScale = Record<${Object.keys(light.shadow)
      .map((k) => `'${k}'`)
      .join(' | ')}, readonly FigmaShadowLayer[]>;`,
    '',
    `export const figmaShadowsLight: FigmaShadowScale = {\n${render1(light)}\n};`,
    '',
    `export const figmaShadowsDark: FigmaShadowScale = {\n${render1(dark)}\n};`,
    '',
    `export const figmaBlur = {\n${render(light.blur, (t) => px(t.$value))}\n} as const;`,
  ].join('\n');
}

function layout(dir) {
  const lay = readJson(dir, 'layout.json');
  const leaf = (t) => (t.$type === 'number' ? t.$value : px(t.$value));
  return `export const figmaLayout = {\n${render(lay, leaf)}\n} as const;`;
}

// ─── Entry points ──────────────────────────────────────────────────────────

/** The full contents of `src/tokens/generated/figma.ts` for the snapshot in `dir`. */
function generate(dir = FIGMA_DIR) {
  const { prim, src: paletteSrc } = palette(dir);
  return [
    '/**',
    ' * GENERATED from `figma/*.json` by `scripts/generate-from-figma.cjs`.',
    ' * Do not edit: change the snapshot and run `pnpm nx run design-system:generate`.',
    ' *',
    ' * Mirrors the Figma library one-to-one. Nothing outside this package should',
    ' * import it directly; `primitives.ts` and the semantic files map it onto the',
    ' * names the apps use.',
    ' */',
    '',
    '// ─── BSC · Primitives ──────────────────────────────────────────────────────',
    '',
    paletteSrc,
    '',
    '// ─── BSC · Semantic (Light / Dark) ─────────────────────────────────────────',
    '',
    semantic(dir, prim),
    '',
    '// ─── BSC · Space & Radius ──────────────────────────────────────────────────',
    '',
    spaceAndRadius(dir),
    '',
    '// ─── BSC · Typography ──────────────────────────────────────────────────────',
    '',
    typography(dir),
    '',
    '// ─── BSC · Effects (Light / Dark) ──────────────────────────────────────────',
    '',
    effects(dir),
    '',
    '// ─── BSC · Layout ──────────────────────────────────────────────────────────',
    '',
    layout(dir),
    '',
  ].join('\n');
}

module.exports = { generate, OUT_FILE };

if (require.main === module) {
  const next = generate();
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, 'utf8') : '';
    if (current !== next) {
      console.error(
        'src/tokens/generated/figma.ts is out of date with figma/*.json.\n' +
          'Run: pnpm nx run design-system:generate',
      );
      process.exit(1);
    }
    console.log('src/tokens/generated/figma.ts is up to date.');
  } else {
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, next);
    console.log(`Wrote ${path.relative(process.cwd(), OUT_FILE)}`);
  }
}
