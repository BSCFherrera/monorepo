/**
 * Nx's ESLint executor (@nx/eslint 20.3.0) only auto-discovers a flat config
 * named `eslint.config.js`/`.cjs`, not the root's `eslint.config.mjs` (see
 * node_modules/@nx/eslint/src/utils/flat-config.js — `.mjs` isn't in its
 * lookup list yet). Without a discoverable file here, `nx run utils:lint`
 * falls back to legacy `.eslintrc` resolution and fails, since this
 * workspace has no `.eslintrc*` files at all.
 *
 * This shim re-exports the root config unchanged so this package lints
 * under the exact same rules as every other package.
 */
module.exports = require('../../eslint.config.mjs').default;
