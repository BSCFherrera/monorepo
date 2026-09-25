---
captured: 2026-09-04
source: implementation surprise + drift review finding — ISP-2 mobile app e2e
proposed-layer: guides/idioms/testing-stack
proposed-globs:
  - "apps/*-e2e/**"
---

## What happened

`idioms/testing-stack`'s iron law bans Mocha, Jasmine, and Cucumber for
any new project — but WebdriverIO's own CLI test runner (the standard,
documented way to drive Appium) only ships adapters for exactly those
three frameworks (`@wdio/mocha-framework`, `@wdio/jasmine-framework`,
`@wdio/cucumber-framework`). There is no `@wdio/jest-framework` — it
doesn't exist on npm. The first implementation used the WDIO CLI with
its default Mocha framework and passed a drift review only because
nobody checked the framework field; a later review pass caught it and
required a rewrite.

The working fix: don't use the `wdio` CLI or `wdio.conf.ts` at all.
Instead, write a plain Jest test file that imports `webdriverio`'s
`remote()` function directly to create/tear down its own Appium session,
and use `expect-webdriverio`'s `expect` (imported and assigned over
Jest's global `expect` in a setup file — it *replaces* Jest's `expect`,
it does not `.extend()` it) for the `toBeEnabled()`/`toBeDisplayed()`
matchers. Getting this to run required:

- `extensionsToTreatAsEsm: ['.ts']` + `ts-jest`'s `useESM: true`, because
  `webdriverio`/`expect-webdriverio` ship real ESM throughout their
  dependency tree (forcing a CJS transform via `transformIgnorePatterns`
  on the whole tree is a dead end — there's always another transitive
  ESM package, e.g. `deep-eql`).
- The e2e project's own `tsconfig.json` needs `module: esnext` +
  `moduleResolution: bundler` to match.
- Running Jest needs `NODE_OPTIONS=--experimental-vm-modules` (wired
  into the Nx target's `env`, not just the shell).
- `@wdio/globals` must stay installed as a plain dependency even though
  nothing imports it directly — `expect-webdriverio`'s snapshot matcher
  hard-requires it internally and throws `Cannot find module
  '@wdio/globals'` if it's absent.
- Each test needs its own session lifecycle (`beforeEach`/`afterEach`
  creating and deleting a session) rather than reusing one — and after
  creating a session, must explicitly wait for a known element to exist
  (`waitForExist({ timeout: 30000 })`) before interacting, since each
  session relaunches the app and re-fetches the JS bundle from Metro;
  skipping that wait produces an intermittent "element wasn't found" on
  a warm run that looks identical to a real failure.

## Why it matters

"Appium for React Native e2e" and "never Mocha" are both stated
separately in the charter, but they're in tension for any project that
takes the obvious path (WDIO's CLI runner). Nobody discovers this until
a drift review flags the framework field, or — worse — nobody catches
it at all and the charter's own iron law silently doesn't apply to
mobile e2e. The actual working recipe (Jest + `webdriverio`'s client
directly, ESM mode) is non-obvious and took real trial-and-error to
land on.

## Proposed change

Add to `idioms/testing-stack` (or a new `idioms/react-native/appium-e2e`
note cross-linked from `idioms/react-native/mobile-app`): React Native
e2e uses Appium as the *driver*, but never the WebdriverIO CLI test
runner (`wdio.conf.ts`) as the *framework*, since it only supports
Mocha/Jasmine/Cucumber. Instead, write Jest test files that import
`webdriverio`'s `remote()` directly and use `expect-webdriverio`'s
`expect` (assigned over Jest's global in a setup file). Document the
required config shape (ESM `tsconfig`, `NODE_OPTIONS=--experimental-vm-modules`,
`@wdio/globals` as a silent required dependency, and the
post-session-creation `waitForExist` for the app's first element) as a
copyable recipe so the next project doesn't re-derive it from scratch.
