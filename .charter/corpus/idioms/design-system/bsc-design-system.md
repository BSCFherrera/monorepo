---
kind: corpus
id: corpus/idioms/design-system/bsc-design-system
description: Why front-ends follow the BSC Design System, plus the full token values (color, type, spacing, effects, grids) transcribed from the Figma foundations pages.
---

# BSC Design System — reasoning and token reference

BSC is a bank (Banco Santa Cruz imagery throughout the Figma file). Its web and mobile products must read as one brand and stay accessible; the design system exists so design and code share one vocabulary of tokens instead of re-deciding values per screen. The rule set forbids off-system values because every hard-coded hex, pixel, or font drifts from Light/Dark theming, breaks contrast guarantees, and forces a second edit when the system changes. Tokens are cited by name in design so code maps 1:1.

**Source:** Figma file `PTm8YggQ9F9SejUmxqnqxe` (*BSC Design System*, pages Colors, Typography, Icons, Effect (Blurs & Shadows), Spacing radius & grids). Transcribed visually on 2026-09-18 (the file has export disabled, so the REST API returns `403 File not exportable`). Values marked *(inferred)* or *(verify)* were not directly legible — confirm in Figma before relying on them.

**Not yet transcribed:** the 15 *Base components* pages (Buttons, Inputs, Avatar, Sheet, Pagination, Check & Radio boxes, Progress indicators, Toggle-Switch, Cards, Header, Tags, Snack bar, Sliders, Loading indicator, Messaging), the *Utility* pages, *Getting started* principles, and radius tokens. Each component page has a Specs frame (anatomy, size, hierarchy, icon, state, layout & spacing).

## Colors

158 primitives in 14 scales, built for Tailwind CSS v4.2, with Light/Dark semantic tokens.

### Base

| Token | Hex | Use |
|---|---|---|
| `base/white` | `#FFFFFF` | |
| `base/ink` | `#1A1F1E` | default "black" |
| `base/ink-strong` | `#0F1211` | more intensity than Ink |
| `base/black` | `#000000` | exception only |

### Brand scales (900 / 600 / 900 are the official tones)

| Step | BSC Primary Blue | BSC Green | BSC Neutral |
|---|---|---|---|
| 50 | `#F2F7FF` | `#E5FFE7` | `#F4F7F7` |
| 100 | `#E8F1FF` | `#D7FBDB` | `#EEF1F0` |
| 200 | `#D3E3FF` | `#C5EFC9` | `#DFE3E2` |
| 300 | `#B6D0FF` | `#ACDFB1` | `#CCD0CF` |
| 400 | `#8DB6FF` | `#89C891` | `#B1B7B6` |
| 500 | `#6999EF` | `#62AF6D` | `#959C9A` |
| 600 | `#467CDF` | **`#009739` BRAND** | `#7B8281` |
| 700 | `#2D63C7` | `#0C7E31` | `#636B69` |
| 800 | `#214FA5` | `#016725` | `#505655` |
| 900 | **`#003594` BRAND** | `#004F1A` | **`#3F4443` BRAND** |
| 950 | `#082458` | `#00320D` | `#252928` |

Blue 900 = main CTA / institutional identity. Green 600 = secondary identity, does not replace Success.

### Functional (feedback) scales

| Step | Error | Warning | Success (Emerald) |
|---|---|---|---|
| 50 | `#FEF2F2` | `#FFFBEB` | `#ECFDF5` |
| 100 | `#FFE2E2` | `#FEF3C6` | `#D0FAE5` |
| 200 | `#FFC9C9` | `#FEE685` | `#A4F4CF` |
| 300 | `#FFA2A2` | `#FFD230` | `#5EE9B5` |
| 400 | `#FF6467` | `#FFB900` | `#00D492` |
| 500 | *(verify)* ~`#FB2C36` | `#FE9A00` | `#00BC7D` |
| 600 | `#E7000B` | `#E17100` | `#009966` |
| 700 | `#C10007` | `#BB4D00` | `#007A55` |
| 800 | `#9F0712` | `#973C00` | `#006045` |
| 900 | `#82181A` | `#7B3306` | `#004F3B` |
| 950 | `#460809` | `#461901` | `#002C22` |

Error = errors, blocks, destructive actions. Warning = risk/pending attention (never for positive confirmation). Success = confirmation/healthy state, a functional Emerald scale kept separate from brand green.

### Extended spectrum (data-viz, categories, illustration, secondary experiences)

Neutral (`#FAFAFA`…`#0A0A0A`), Gray (`#F9FAFB`…`#030712`, cool), Sky, Blue, Indigo, Purple, Pink, Slate — Tailwind v4 default scales, 50–950. Never replace the blue CTA.

### Semantic tokens (Light → Dark) *(inferred from swatches vs. primitives; verify in Figma variables)*

| Token | Light | Dark |
|---|---|---|
| `bg/canvas` | Neutral 50 | Ink Strong |
| `bg/surface` | White | Ink |
| `bg/surface-elevated` | White | Neutral 950 |
| `bg/subtle` | Neutral 50 | Neutral 950 |
| `border/default` | Neutral 200 | Neutral 800 |
| `border/strong` | Neutral 300 | Neutral 700 |
| `text/primary` | Neutral 900 | Neutral 100 |
| `text/secondary` | Neutral 700 | Neutral 400 |
| `text/tertiary` | Neutral 600 | Neutral 500 |
| `text/on-brand` | White | Neutral 950 |
| `text/on-photo` | White | White |
| `text/success` | Success 700 | Success 300 |
| `action/primary` | Blue 900 | Blue 400 |
| `action/primary-pressed` | Blue 950 | Blue 300 |
| `action/primary-subtle` | Blue 50 | Blue 950 |
| `action/primary-text` | Blue 900 | Blue 300 |
| `action/confirm` | Success 700 | Success 400 |
| `action/confirm-subtle` | Success 50 | Success 950 |
| `brand/green` | Green 600 | Green 500 |
| `feedback/danger` | Error 700 | Error 400 |
| `feedback/danger-subtle` | Error 100 | Error 800 |
| `feedback/attention` | Warning 800 | Warning 400 |
| `feedback/attention-subtle` | Warning 100 | Warning 800 |

### Color rules (from the Figma "Rules that protect meaning")

1. **Contrast first** — normal text ≥ 4.5:1; large text and component limits 3:1. Focus, Error, Warning and Success always need text or an icon.
2. **Brand ≠ status** — `brand/blue/900` is the main CTA; `brand/green/600` expresses identity. Confirmation uses Success so meaning does not depend on recognizing the brand.
3. **True Black is exceptional** — `base/ink` by default, `base/ink-strong` for more intensity, `base/black` only for technical requirements or contrast Ink cannot resolve.

## Typography

Family **Google Sans**, weights Regular 400 / Medium 500 / Semibold 600 / Bold 700. Three layers: Tokens (BSC · Typography) → Text styles (Title, Subtitle, Body, Caption) → `_Base` template. Character set covers Spanish accents/ñ/¿¡ and `$ RD$ € £ ¥`.

| Style | Size | Line height | Tracking |
|---|---|---|---|
| Title XXL | 72px / 4.5rem | 90px / 5.625rem | −2% |
| Title XL | 60px / 3.75rem | 72px / 4.5rem | −2% |
| Title L | 48px / 3rem | 60px / 3.75rem | −2% |
| Title MD | 36px / 2.25rem | 44px / 2.75rem | −2% |
| Title S | 30px / 1.875rem | 38px / 2.375rem | normal |
| Title XS | 24px / 1.5rem | 32px / 2rem | normal |
| Subtitle | 20px / 1.25rem | 30px / 1.875rem | normal |
| Body L | 18px / 1.125rem | 28px / 1.75rem | normal |
| **Body MD (base)** | 16px / 1rem | 24px / 1.5rem | normal |
| Body S | 14px / 0.875rem | 20px / 1.25rem | normal |
| Caption | 12px / 0.75rem | 18px / 1.125rem | normal |

Usage: read first with Body MD; do not rely only on color or weight — combine size, spacing and 2–3 visible weights per screen; avoid fixed heights around text; keep 45–75 characters per line; tight tracking never in body.

Web:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
:root {
  --bsc-type-family-primary: "Google Sans", system-ui, sans-serif;
  --bsc-type-size-16: 1rem;
  --bsc-type-line-height-24: 1.5rem;
  --bsc-type-letter-spacing-tight: -0.02em;
}
.body-md { font: 400 var(--bsc-type-size-16)/var(--bsc-type-line-height-24) var(--bsc-type-family-primary); }
```

React Native (`fontSize`/`lineHeight` are density-independent):

```ts
// npx expo install @expo-google-fonts/google-sans expo-font
import { useFonts, GoogleSans_400Regular, GoogleSans_500Medium,
  GoogleSans_600SemiBold, GoogleSans_700Bold } from '@expo-google-fonts/google-sans';
// if (!loaded) return null;
export const type = StyleSheet.create({
  bodyMD: { fontFamily: 'GoogleSans_400Regular', fontSize: 16, lineHeight: 24 },
});
```

## Spacing (4px rhythm)

| Group | Tokens |
|---|---|
| Component (4–24) | `space/0` 0 · `space/4` 0.25rem · `space/8` 0.5rem · `space/12` 0.75rem · `space/16` 1rem · `space/20` 1.25rem · `space/24` 1.5rem |
| Pattern (28–64) | `space/28` 1.75rem · `space/32` 2rem · `space/40` 2.5rem · `space/48` 3rem · `space/64` 4rem |
| Layout (80–256) | `space/80` 5rem · `space/96` 6rem · `space/128` 8rem · `space/160` 10rem · `space/192` 12rem · `space/224` 14rem · `space/256` 16rem |

Components: internal padding, icon–text gap, labels, compact controls. Patterns: between related groups, form sections, content blocks. Layouts: page regions, headers, large compositions. Keep the 4px rhythm; no intermediate values without a validated need. No radius tokens were found on the *Spacing, radius & grids* page — verify before inventing one.

## Effects

Principle: *elevation expresses relations, not decoration.* Use the lowest level that explains which surface is in front. Styles are bound to variables; the same style serves Light and Dark and the mode changes opacity variables.

| Shadow | Layers / values | Use |
|---|---|---|
| `Shadow/XS` | 1 · 0/1/2/0 | compact controls |
| `Shadow/SM` | 2 · 1–3px blur | buttons, chips |
| `Shadow/MD` | 2 · 4–8px blur | cards, popovers |
| `Shadow/LG` | 2 · 6–16px blur | menus, panels |
| `Shadow/XL` | 2 · 8–24px blur | dialogs |
| `Shadow/2XL` | 1 · 24/48/−12 | modals |
| `Shadow/3XL` | 1 · 32/64/−12 | exceptional overlay |

| Blur (background) | Radius | Use |
|---|---|---|
| `Blur/SM` | 8px | compact bars |
| `Blur/MD` | 16px | navigation, sheets |
| `Blur/LG` | 24px | prominent panels |
| `Blur/XL` | 40px | immersive layers |

Usage criteria: (1) hierarchy before ornament — two simultaneous levels usually suffice; (2) verifiable contrast — WCAG on text over blur, raise surface opacity if the background is unpredictable; (3) inclusive fallback — for reduced transparency or low-end devices replace blur with an opaque surface + semantic border; (4) independent states — focused/hovered/disabled through state tokens, never shadow or blur alone.

## Grids

| Viewport | Style | Columns | Margin | Gutter |
|---|---|---|---|---|
| Desktop 1440 | `Grid/Desktop/12 Columns` | 12 | 112 | 32 |
| Tablet 768 | `Grid/Tablet/6 Columns` | 6 | *(verify)* | 32 |
| Mobile (375 / **390 default** / 440) | `Grid/Mobile/4 Columns` | 4 | 16 | 16 |

Mobile presets: iPhone 13 mini 375×812, iPhone 14 390×844 (primary), iPhone 17 Pro Max 440×956. Container grids (inside a container, gutter 32, margin 0): `Grid/Container/12, 6, 5, 3, 2 Columns`.

Implementation notes: start with the average (iPhone 14) and validate at 375 and 440; device names are test scenarios — change columns or max-width when legibility or composition requires; safe areas (notch, Dynamic Island, system bars, orientation) belong to the platform template, not the column style; protect accessibility (touch targets ≥ 44×44, test enlarged text, don't shrink margins to fit dense UI).

## Icons

The Icons page holds a 24×24 stroked icon set plus a *Featured icon* component (5 sizes × 5 color families — blue, gray, red, amber, green — in two container styles). Use it rather than ad hoc icon backgrounds. Component-level detail not transcribed.

## Anti-patterns

- `color: #003594` / `bg-blue-900` in a component instead of `action/primary`.
- Pure `#000` text or a default Tailwind `gray-*`/`slate-*` palette for surfaces.
- Using brand green for a success message or confirm button.
- Status shown only as red/green color with no text or icon.
- System font stack or Inter/Roboto instead of Google Sans; ad hoc `font-size: 15px`.
- `padding: 10px`, `margin: 18px` — values off the 4px scale.
- Stacking three shadows, or relying on a hover shadow as the only hover indication.
- Blur behind text with no contrast check and no opaque fallback.
- Fixed-height text containers that clip when the user enlarges text.
- Redefining tokens inside an app instead of the shared tokens lib.

## References

- Figma: https://www.figma.com/design/PTm8YggQ9F9SejUmxqnqxe/BSC-Design-System
- Tailwind CSS v4 theme variables: https://tailwindcss.com/docs/theme
- Expo Google Fonts: https://github.com/expo/google-fonts

Back to the rules: [`guides/idioms/design-system/bsc-design-system.md`](guides/idioms/design-system/bsc-design-system.md).
