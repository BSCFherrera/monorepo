---
kind: rule
id: rules/keystone-idioms-design-system-bsc-design-system
description: Every UI component comes from the design-system lib libs/BSC.genesis.design.system (@bsc/design-system), which holds all design rules, tokens and components; apps never create UI components. Read before designing or coding any UI.
globs:
  - "apps/**/*.tsx"
  - "libs/BSC.genesis.design.system/**"
  - "libs/**/*.tsx"
  - "openspec/changes/**/*.md"
source: .charter/guides/idioms/design-system/bsc-design-system.md
generated_by: keystone-project
---

# BSC Design System — rules

Full guide: `.charter/guides/idioms/design-system/bsc-design-system.md` (read on demand).

## IRON LAW

Every UI component an app uses comes from `@bsc/design-system` (`libs/BSC.genesis.design.system`). **Apps never create UI components**: an app contains only screens (the route-level `*Screen.tsx` components its navigator registers) and navigation wiring, and a screen only composes design-system components — it has no styling of its own (no `StyleSheet.create`, no `style` values, no visual primitives). When a needed component, variant or layout piece doesn't exist, it is **created first in the lib** and then imported in the app — never built in the app, not even temporarily.

No design or implementation uses a color, font, font size, line height, spacing value, shadow, blur, or grid that is not a BSC Design System token. Before designing or writing UI, read `libs/BSC.genesis.design.system/DESIGN-RULES.md` and take every value from it. If the needed value does not exist, stop and ask — never invent, approximate, or hard-code one (no raw hex, no ad hoc `px`, no default Tailwind/browser/system palette or font).


## GOLDEN RULE

- **One lib, all design.** Design rules live in the lib's `DESIGN-RULES.md`; this guide enforces them and must not diverge from it — when a design rule changes, change `DESIGN-RULES.md` first, then this guide.
- **A new component is built in the lib, to its Figma spec.** It takes every value from `src/tokens` (through `src/theme`), declares its framework-neutral props in `@bsc/contracts` (`src/ui/`) with `Bsc*Props` extending them, has an English public API (customer-facing copy is passed in as props and translated by the app through `@bsc/i18n`), exposes a `testID` on every interactive element per [`idioms/testing-policy`](idioms/testing-policy.md), ships with Jest tests in `src/__tests__/`, and is exported from `src/index.ts`.
- **Components are app-agnostic.** No business logic, data fetching, navigation or app state in a lib component, and no import from any app — the `scope:shared` tag enforces the last part.
- **Tokens are generated, never hand-edited.** `src/tokens/generated/figma.ts` comes from the Figma snapshot in `figma/` (`pnpm nx run design-system:generate`); the drift test and `design-system:check-generated` fail on divergence. Tokens are never redefined inside an app.
- **Color via semantic tokens only.** Components consume semantic tokens (`bg/surface`, `text/primary`, `action/primary`, `feedback/danger`, …), never primitive scales (`blue-900`) and never raw hex. Every semantic token has a Light and a Dark value; support both modes without per-component color overrides.
- **Brand ≠ status.** `action/primary` (BSC Primary Blue 900 `#003594`) is the main CTA; BSC Green 600 (`#009739`) is identity only. Confirmation/success uses the Success (Emerald) scale, never brand green. Error/Warning/Success are never conveyed by color alone — always pair with text or an icon.
- **Ink, not black.** Default black is `base/ink` (`#1A1F1E`); `base/ink-strong` when more intensity is needed; `base/black` (`#000000`) only for technical or contrast requirements Ink cannot meet. Extended-spectrum scales (Sky, Blue, Indigo, Purple, Pink, Slate, Gray, Neutral) are for data-viz/illustration, never a replacement for the blue CTA.
- **Contrast is a gate.** Normal text ≥ 4.5:1; large text and component boundaries/focus indicators ≥ 3:1, in Light and Dark.
- **Typography** uses only the type scale's text styles. Body MD 16/24 is the default; Body S for dense UI; Caption for non-critical metadata. Letter-spacing −2 % only on titles ≥ 36px, never in body. Never fix the height around text (font scaling in React Native, zoom/reflow on web); keep long text to 45–75 characters per line.
- **Spacing on the 4px rhythm** with `space/*` tokens only: 4–24px inside components, 28–64px between groups/sections, 80–256px for page layout. No intermediate values without a validated need; never use layout tokens as control padding.
- **Elevation is the minimum that explains layering.** Use `Shadow/XS…3XL` and `Blur/SM…XL` styles; at most two simultaneous levels in a view. Focus, hover, pressed and disabled states come from state tokens, never from shadow or blur alone. Blur surfaces need verified text contrast and an opaque-surface + semantic-border fallback for reduced transparency.
- **Grid per viewport:** Desktop 1440 → 12 columns / margin 112 / gutter 32; Tablet 768 → 6 columns / gutter 32; Mobile → 4 columns / margin 16 / gutter 16, designed on iPhone 14 (390×844) and validated at 375 and 440 widths. Breakpoints follow content, not device names. Touch targets ≥ 44×44px.
- **Fonts** come from the lib. **React Native:** Google Sans Flex, static cuts in `libs/BSC.genesis.design.system/assets/fonts`, registered by each app per that folder's README. **Web:** load Google Sans (400;500;600;700, `display=swap`) via `next/font` or the Google Fonts link.


## RULES

- In a tech spec, the UI section lists every design-system component the change uses and every component, variant or layout piece that must be **added to the lib**; the plan orders the lib work before the app work that imports it.
- A screen that needs spacing, alignment or a layout the lib can't express yet is a missing lib component, not a reason to style inside the app.
- In a design or tech-spec deliverable, cite tokens by name (`bg/surface`, `space/16`, `Body MD`, `Shadow/MD`, `Grid/Mobile/4 Columns`) instead of values, so the implementation maps 1:1.
- A component's Figma component-page Specs (anatomy, sizes, hierarchy, states) are authoritative for that component. Component specs are **not yet transcribed** into `DESIGN-RULES.md`; when one is needed, read that component's page in Figma or ask the owner — do not guess its variants or dimensions.
- Prefer dark-mode-safe implementation from the start: no color literal, no image or shadow that only works on Light.
- If a requested design conflicts with a rule here (off-palette color, non-scale spacing, non-brand font), surface the conflict and propose the closest token rather than silently complying or silently correcting.
- Existing app-side components and screen styling that predate this rule are debt (`corpus/state/code-debt.md`: `DEBT-007` banking, `DEBT-008` conversational), not a pattern to copy: a change that modifies one's UI or behavior moves it into the lib first (import-only or rename edits don't trigger the move).

For reasoning, see [`corpus/idioms/design-system/bsc-design-system.md`](corpus/idioms/design-system/bsc-design-system.md). For the full rules and token values, see `libs/BSC.genesis.design.system/DESIGN-RULES.md`.
