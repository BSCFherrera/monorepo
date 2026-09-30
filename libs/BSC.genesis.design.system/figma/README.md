# Figma snapshot

The variables of the **BSC Design System** Figma library, as DTCG JSON. This
is the source for `src/tokens/generated/figma.ts`; Figma wins over code wherever both
define a value.

- File: `PTm8YggQ9F9SejUmxqnqxe` (BSC-Design-System)
- Read: 2026-09-23, read-only, through the Figma MCP (Plugin API).

| File | Figma collection | Mode |
|---|---|---|
| `primitives.json` | BSC · Primitives | Value |
| `semantic.light.json` / `semantic.dark.json` | BSC · Semantic | Light / Dark |
| `space-radius.json` | BSC · Space & Radius | Value |
| `typography.json` | BSC · Typography + the 44 local text styles (`text-style`) | Value |
| `effects.light.json` / `effects.dark.json` | BSC · Effects (`shadow/*`, `blur/*`) | Light / Dark |
| `layout.json` | BSC · Layout | Value |

**Not in the snapshot**

- Collections hidden from publishing: `Kit`, `Colors`, `cooliocns`, and the
  duplicates `BSC · Semantic` (4 variables), `BSC / Primitives` (2) and
  `BSC · Space & Radius` (1).
- The variables `Boolean`, `1er paso` and `String` in `BSC · Effects`: they
  aren't effects.
- Figma's paint styles: they're photos and logos, not colors.

**Conventions**: a color is `#RRGGBB` or `#RRGGBBAA` (alpha last); a
dimension is `{ "value": n, "unit": "px" }`; an alias is `{group.name}`. The
font weight `SemiBold` etc. is stored as its number, with Figma's value under
`$extensions.com.figma`.

## Refreshing

1. Re-read the file's local variables and text styles, **read only** — never
   write to the Figma file from this repo. A View seat on the Professional
   plan allows only a handful of MCP calls, so read everything in one
   `use_figma` script (`getLocalVariableCollectionsAsync`,
   `getLocalVariablesAsync`, `getLocalTextStylesAsync`).
2. Update the JSON files here.
3. `pnpm nx run design-system:generate`, then `pnpm test`.

`src/tokens/__tests__/tokens.test.ts` fails when `src/tokens/generated/figma.ts` doesn't
match these files, and `pnpm nx run design-system:check-generated` does the
same from the command line.
