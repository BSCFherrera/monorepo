---
kind: guide
id: idioms/design-system/bsc-design-system
description: Every front-end (web or mobile) design and implementation follows the BSC Design System — semantic color tokens, Google Sans type scale, 4px spacing rhythm, elevation/blur styles, grids. Read before designing or coding any UI.
globs:
  - "apps/**/*.tsx"
  - "packages/ui-native/**"
  - "packages/design-tokens/**"
  - "libs/**/*.tsx"
  - "openspec/changes/**/*.md"
---
# BSC Design System — rules

The rules from [`corpus/idioms/design-system/bsc-design-system.md`](corpus/idioms/design-system/bsc-design-system.md), which holds the full token values. Source of truth: the Figma file *BSC Design System* (`https://www.figma.com/design/PTm8YggQ9F9SejUmxqnqxe/BSC-Design-System`).

## SCOPE

Applies to every front-end deliverable — Next.js web apps and React Native mobile apps — in **both** the design step (wireframes, UI specs, tech-spec UI sections, component choices) and the implementation step (styles, components, theming). Backend-only work is out of scope.

## IRON LAW

No front-end design or implementation uses a color, font, font size, line height, spacing value, shadow, blur, or grid that is not a BSC Design System token. Before designing or writing UI, read [`corpus/idioms/design-system/bsc-design-system.md`](corpus/idioms/design-system/bsc-design-system.md) and take every value from it. If the needed value does not exist, stop and ask — never invent, approximate, or hard-code one (no raw hex, no ad hoc `px`, no default Tailwind/browser/system palette or font).

## GOLDEN RULE

- **Color via semantic tokens only.** Components consume semantic tokens (`bg/surface`, `text/primary`, `action/primary`, `feedback/danger`, …), never primitive scales (`blue-900`) and never raw hex. Every semantic token has a Light and a Dark value; support both modes without per-component color overrides.
- **Brand ≠ status.** `action/primary` (BSC Primary Blue 900 `#003594`) is the main CTA; BSC Green 600 (`#009739`) is identity only. Confirmation/success uses the Success (Emerald) scale, never brand green. Error/Warning/Success are never conveyed by color alone — always pair with text or an icon.
- **Ink, not black.** Default black is `base/ink` (`#1A1F1E`); `base/ink-strong` when more intensity is needed; `base/black` (`#000000`) only for technical or contrast requirements Ink cannot meet. Extended-spectrum scales (Sky, Blue, Indigo, Purple, Pink, Slate, Gray, Neutral) are for data-viz/illustration, never a replacement for the blue CTA.
- **Contrast is a gate.** Normal text ≥ 4.5:1; large text and component boundaries/focus indicators ≥ 3:1, in Light and Dark.
- **Typography is Google Sans**, weights 400/500/600/700, using only the 11 text styles (Title XXL/XL/L/MD/S/XS, Subtitle, Body L/MD/S, Caption). Body MD 16/24 is the default; Body S for dense UI; Caption for non-critical metadata. Letter-spacing −2 % only on titles ≥ 36px, never in body. Never fix the height around text (font scaling in React Native, zoom/reflow on web); keep long text to 45–75 characters per line.
- **Spacing on the 4px rhythm** with `space/*` tokens only: 4–24px inside components, 28–64px between groups/sections, 80–256px for page layout. No intermediate values without a validated need; never use layout tokens as control padding.
- **Elevation is the minimum that explains layering.** Use `Shadow/XS…3XL` and `Blur/SM…XL` styles; at most two simultaneous levels in a view. Focus, hover, pressed and disabled states come from state tokens, never from shadow or blur alone. Blur surfaces need verified text contrast and an opaque-surface + semantic-border fallback for reduced transparency.
- **Grid per viewport:** Desktop 1440 → 12 columns / margin 112 / gutter 32; Tablet 768 → 6 columns / gutter 32; Mobile → 4 columns / margin 16 / gutter 16, designed on iPhone 14 (390×844) and validated at 375 and 440 widths. Breakpoints follow content, not device names. Touch targets ≥ 44×44px.
- **One token source, two consumers.** Tokens live in a single shared lib (`libs/shared-design-tokens`, TypeScript, per [`idioms/nx/monorepo-structure`](idioms/nx/monorepo-structure.md) and [`idioms/typescript`](idioms/typescript.md)): web consumes them as CSS variables / Tailwind v4 `@theme`; React Native consumes them as typed constants. Do not redefine tokens inside an app.
- **Web fonts:** load Google Sans (400;500;600;700, `display=swap`) via `next/font` or the Google Fonts link. **React Native:** `@expo-google-fonts/google-sans` + `expo-font`, block render until fonts load.
- **Components:** when a BSC base component exists (Buttons, Inputs, Avatar, Sheet, Pagination, Check & Radio, Progress, Toggle-Switch, Cards, Header, Tags, Snack bar, Sliders, Loading indicator, Messaging), build on it and its variants rather than a new one-off. Interactive elements keep their `testID`/`data-testid` per [`idioms/testing-policy`](idioms/testing-policy.md).

## RULES

- In a design or tech-spec deliverable, cite tokens by name (`bg/surface`, `space/16`, `Body MD`, `Shadow/MD`, `Grid/Mobile/4 Columns`) instead of values, so the implementation maps 1:1.
- A component's Figma component-page Specs (anatomy, sizes, hierarchy, states) are authoritative for that component. Component specs are **not yet transcribed** into the corpus (Figma export is disabled for the file); when one is needed, read that component's page in Figma or ask the owner — do not guess its variants or dimensions.
- Prefer dark-mode-safe implementation from the start: no color literal, no image or shadow that only works on Light.
- If a requested design conflicts with a rule here (off-palette color, non-scale spacing, non-brand font), surface the conflict and propose the closest token rather than silently complying or silently correcting.

For reasoning and the full token values, see [`corpus/idioms/design-system/bsc-design-system.md`](corpus/idioms/design-system/bsc-design-system.md).
