/**
 * Design tokens — the platform-neutral source of truth for BSC's design.
 *
 * Three layers:
 *   - primitives  raw palette and scales (`palette`, `space`, …). Internal.
 *   - semantic    values by role (`colors`, `spacing`, `radius`, `typography`, `shadows`).
 *   - component   sizes of reusable controls (`components`).
 *
 * Plain data, no framework imports: React Native, web and tooling can all
 * consume it. Platform adapters (e.g. RN shadow styles) live in `../theme`.
 */
export * from './primitives';
export * from './colors';
export * from './spacing';
export * from './radius';
export * from './shadows';
export * from './typography';
export * from './components';
export * from './theme';
