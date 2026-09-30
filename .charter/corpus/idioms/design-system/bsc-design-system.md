---
kind: corpus
id: corpus/idioms/design-system/bsc-design-system
description: Why front-ends follow the BSC Design System and why all UI lives in one lib (libs/BSC.genesis.design.system); the rules and token values themselves live in that lib's DESIGN-RULES.md.
---

# BSC Design System — reasoning

BSC is a bank (Banco Santa Cruz imagery throughout the Figma file). Its web and mobile products must read as one brand and stay accessible; the design system exists so design and code share one vocabulary of tokens instead of re-deciding values per screen. The rule set forbids off-system values because every hard-coded hex, pixel, or font drifts from Light/Dark theming, breaks contrast guarantees, and forces a second edit when the system changes. Tokens are cited by name in design so code maps 1:1.

## Why one lib, and why apps create no UI components

Decided by the team on 2026-09-29. The design system used to be split across `libs/shared-design-tokens` (tokens) and `libs/shared-ui-native` (components), with the rules only in the charter — and the banking app still grew ~30 components of its own (cards, headers, sheets, bottom nav) next to its screens. Each app-local component is a second, unreviewed interpretation of the design system: it hard-codes its own measurements, misses dark mode and contrast checks, and can't be reused by the next app (the conversational app is already planned). Consolidating into `libs/BSC.genesis.design.system` gives one place where:

- the **rules** live next to the code they govern (`DESIGN-RULES.md`), so a component change and a rule change are reviewed together;
- the **tokens** are generated from Figma and drift-checked;
- **every component** is built once, to its Figma spec, with tests and `testID`s.

Apps keep only screens and navigation, so a visual change to the product is always a change to the lib. Forcing a missing component into the lib first costs a little up front and removes the "temporary" app component that never gets moved.

## Where the rules and values are

- Rules and full token reference (colors, typography, spacing, effects, grids, icons, anti-patterns): `libs/BSC.genesis.design.system/DESIGN-RULES.md`, the source of truth.
- Generated token values: `libs/BSC.genesis.design.system/src/tokens/generated/figma.ts`, from the Figma snapshot in `libs/BSC.genesis.design.system/figma/`.
- Figma: https://www.figma.com/design/PTm8YggQ9F9SejUmxqnqxe/BSC-Design-System (read-only).

Back to the rules: [`guides/idioms/design-system/bsc-design-system.md`](guides/idioms/design-system/bsc-design-system.md).
