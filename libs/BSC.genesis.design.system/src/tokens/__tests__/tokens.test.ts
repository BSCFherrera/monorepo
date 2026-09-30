import * as fs from 'node:fs';

import {
  codeOnlyPalette,
  coloredShadow,
  colors,
  colorsDark,
  components,
  darkTheme,
  gradients,
  lineHeightPx,
  palette,
  shadows,
  shadowsDark,
  textStyles,
  textStylesDark,
  theme,
} from '../index';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { generate, OUT_FILE } = require('../../../scripts/generate-from-figma.cjs');

/** Every string leaf of a nested token object, with its path. */
function hojas(valor: unknown, ruta = ''): Array<[string, unknown]> {
  if (valor !== null && typeof valor === 'object') {
    return Object.entries(valor).flatMap(([k, v]) => hojas(v, ruta ? `${ruta}.${k}` : k));
  }
  return [[ruta, valor]];
}

const COLOR = /^#[0-9A-F]{6}([0-9A-F]{2})?$/;

describe('color format', () => {
  // One format everywhere: #RRGGBB, or #RRGGBBAA with alpha LAST. The previous
  // version of this package mixed alpha-first and alpha-last, which renders
  // the wrong color in whichever consumer guessed the other order.
  const todos = [
    ...hojas(palette, 'palette'),
    ...hojas(codeOnlyPalette, 'codeOnlyPalette'),
    ...hojas(colors, 'colors'),
    ...hojas(colorsDark, 'colorsDark'),
    ...hojas(shadows, 'shadows'),
    ...hojas(shadowsDark, 'shadowsDark'),
    ...hojas(textStyles, 'textStyles'),
    ...hojas(textStylesDark, 'textStylesDark'),
  ].filter(([ruta]) => /color|palette/i.test(ruta));

  it.each(todos.filter(([, v]) => typeof v === 'string'))(
    '%s is #RRGGBB or #RRGGBBAA (uppercase)',
    (_ruta, valor) => {
      expect(valor).toMatch(COLOR);
    },
  );

  it('found the colors it is meant to check', () => {
    expect(todos.length).toBeGreaterThan(300);
  });
});

describe('gradients', () => {
  it.each(Object.entries(gradients))('%s runs from 0 to 1 with increasing stops', (_nombre, g) => {
    const offsets = g.stops.map((s) => s.offset);
    expect(offsets[0]).toBe(0);
    expect(offsets[offsets.length - 1]).toBe(1);
    expect([...offsets].sort((a, b) => a - b)).toEqual(offsets);
  });
});

describe('coloredShadow', () => {
  it('appends the 28 % alpha byte after the color', () => {
    expect(coloredShadow('#0b3b8c')[0]?.color).toBe('#0B3B8C47');
  });

  it('rejects a color that already has alpha, instead of producing garbage', () => {
    expect(() => coloredShadow('#0B3B8C47')).toThrow(/#RRGGBB/);
  });
});

describe('lineHeightPx', () => {
  it('is the Figma line height, already in px', () => {
    expect(lineHeightPx(textStyles.bodyMedium)).toBe(20);
    expect(lineHeightPx(textStyles.displaySmall)).toBe(44);
  });
});

describe('Figma is the source of truth', () => {
  it('src/tokens/generated/figma.ts matches the snapshot in figma/*.json', () => {
    // If this fails, run: pnpm nx run design-system:generate
    expect(fs.readFileSync(OUT_FILE, 'utf8')).toBe(generate());
  });

  it.each([
    ['brand.primary', colors.brand.primary, '#003594', colorsDark.brand.primary, '#8DB6FF'],
    ['surface.background', colors.surface.background, '#F4F7F7', colorsDark.surface.background, '#0F1211'],
    ['text.primary', colors.text.primary, '#3F4443', colorsDark.text.primary, '#EEF1F0'],
    ['status.error', colors.status.error, '#C10007', colorsDark.status.error, '#FF6467'],
    ['overlay.scrim', colors.overlay.scrim, '#0000007A', colorsDark.overlay.scrim, '#000000A3'],
  ])('%s follows BSC · Semantic in both modes', (_name, light, lightHex, dark, darkHex) => {
    expect(light).toBe(lightHex);
    expect(dark).toBe(darkHex);
  });

  it('code-only tokens are the same in both modes', () => {
    expect(colorsDark.gradients).toBe(colors.gradients);
    expect(colorsDark.categorical).toBe(colors.categorical);
    expect(colorsDark.text.onDarkMuted).toBe(colors.text.onDarkMuted);
    expect(shadowsDark.bar).toBe(shadows.bar);
  });

  it('text styles use the Figma font and its styles', () => {
    expect(theme.typography.fontFamily).toBe('Google Sans Flex');
    expect(textStyles.bodyMedium).toMatchObject({
      figmaStyle: 'Body S/14 Regular',
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0,
    });
  });
});

describe('theme', () => {
  it('exposes every layer an app needs', () => {
    expect(Object.keys(theme).sort()).toEqual(
      [
        'colors',
        'components',
        'radius',
        'semanticRadius',
        'shadows',
        'spacing',
        'typography',
      ].sort(),
    );
    expect(theme.components).toBe(components);
  });

  it('has a dark mode of the same shape', () => {
    expect(Object.keys(darkTheme).sort()).toEqual(Object.keys(theme).sort());
    expect(darkTheme.colors).toBe(colorsDark);
    expect(darkTheme.spacing).toBe(theme.spacing);
  });
});
