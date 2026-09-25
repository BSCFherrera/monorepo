---
kind: corpus
id: corpus/idioms/testing-stack
description: Why this repo mandates a test stack per project type — Vitest + Playwright for Next.js web, NUnit + Playwright for .NET backend, Jest + Appium for React Native mobile — instead of one runner picked blind for every project.
---

# Testing stack — reasoning

This repo runs three project types with genuinely different runtimes, and the test stack follows the runtime rather than being forced to one runner across all of them: Next.js web apps (React 19, ESM-first TypeScript) on Vitest + Playwright, .NET backend services (per [`corpus/idioms/dotnet/backend`](dotnet/backend.md)) on NUnit + Playwright, and React Native mobile apps on Jest + Appium. None is a fallback for another — each is the pairing its own ecosystem's tooling is built and maintained against. Nx's generators default to Jest for unit tests and (depending on plugin/version) Cypress or Playwright for e2e; those defaults aren't tuned for any of this repo's project types, which is why each is pinned explicitly rather than left to whatever a generator produces.

## Next.js web: Vitest + Playwright

Vitest over Jest for this stack (see [`corpus/idioms/react/nextjs-ssr`](react/nextjs-ssr.md)):
- Native ESM, no CJS transform layer to fight when a dependency ships ESM-only.
- Runs on the same Vite/esbuild transform pipeline Next's toolchain increasingly shares, so config stays small instead of accumulating Jest transform/moduleNameMapper overrides.
- Startup and watch-mode are near-instant, which matters most exactly where TDD (`corpus/idioms/testing-policy`) demands the tightest Red-Green-Refactor loop: the `domain/` layer, which is plain TypeScript with zero framework imports and gains nothing from Jest's jsdom/React tooling.
- First-class Nx support (`@nx/vite`) — not a bolt-on retrofit.

Playwright over Cypress for e2e:
- Real multi-browser (Chromium/Firefox/WebKit) coverage in one runner, relevant once the app is SSR and needs to be verified as actually rendered server-side, not just interacted with in one embedded browser.
- Auto-waiting and trace/video capture make it a stronger fit for verifying the [`corpus/idioms/testing-policy`](testing-policy.md) requirement that an e2e test fail on a detected backend error rather than just checking the happy-path DOM state.
- First-class Nx support (`@nx/playwright`) alongside `@nx/next`.

This third composes with [`corpus/idioms/testing-policy`](testing-policy.md) (the *what* — TDD, coverage floor, Gherkin-to-e2e traceability) and [`corpus/idioms/nx/monorepo-structure`](nx/monorepo-structure.md) (run everything through `npx nx`, never the underlying test binary directly).

## .NET backend: NUnit + Playwright

NUnit is the mainstream unit-test framework for .NET — first-class tooling in the SDK and IDEs, attribute-based fixtures (`[TestFixture]`, `[Test]`, `[TestCase]`) that read naturally against the hexagonal `Domain`/`Application` layering, and no reason to reach for xUnit or MSTest instead when the repo already needs one pinned choice across every `apps/<name>` backend.

Playwright stays the e2e tool here too, but at the API layer: a .NET backend usually has no browser UI of its own, so its e2e specs are Playwright's `APIRequestContext` making real HTTP calls against the real running service — same tool, same [`corpus/idioms/testing-policy`](testing-policy.md) contract (fail on a detected error, never assert against a mock), just exercising a JSON API instead of a DOM. This keeps one e2e runner across the whole monorepo (a Next.js web app's browser-level Playwright suite and a .NET backend's API-level Playwright suite share config conventions and Nx task-graph wiring) rather than introducing a fourth framework only for backend API testing.

## React Native mobile: Jest + Appium

RN's whole testing toolchain — `@react-native/jest-preset`, native-module auto-mocking, `@testing-library/react-native` — is built and maintained against Jest; there is no official Vitest integration, and the community alternatives (e.g. `vitest-native`) are young third-party projects with their own version constraints, not something to bet a monorepo's mobile test suite on. Appium mirrors Playwright's role at the e2e layer: it drives the real compiled app (through platform accessibility trees) exactly as Playwright drives a real browser, so both project types keep the same guarantee — e2e exercises a real running app, never a mocked-API stand-in — through the tool built for their own platform. See [`corpus/idioms/react-native/mobile-app`](react-native/mobile-app.md) for the full reasoning.

## React Native e2e: Appium as driver, never WDIO CLI as framework

"Appium for React Native e2e" and "never Mocha" (this guide's own iron law) are in tension for any project taking the obvious path: WebdriverIO's own CLI test runner — the standard, documented way to drive Appium — only ships framework adapters for Mocha, Jasmine, and Cucumber (`@wdio/mocha-framework`, `@wdio/jasmine-framework`, `@wdio/cucumber-framework`); there is no `@wdio/jest-framework`. A first pass using `wdio.conf.ts` with its default Mocha framework can pass review if nobody checks the framework field — the iron law silently doesn't apply to mobile e2e until a later review catches it.

The fix is to stop treating WDIO's CLI as the test framework and use it only as a client library: a plain Jest test file imports `webdriverio`'s `remote()` to open/close its own Appium session, and `expect-webdriverio`'s matchers are installed by assigning its `expect` over Jest's global in a setup file. Getting this running requires ESM mode end-to-end (`webdriverio`/`expect-webdriverio`'s dependency tree is real ESM; forcing a CJS transform just surfaces the next transitive ESM package, e.g. `deep-eql`), `@wdio/globals` installed as a silent required dependency of `expect-webdriverio`'s snapshot matcher, and a per-test `waitForExist` after session creation — each app launch re-fetches the JS bundle from Metro, so skipping the wait produces an intermittent false failure indistinguishable from a real one.

## Anti-patterns

- Accepting an Nx/dotnet generator's default runner because "it's what the generator gives you," for any project type, then treating the resulting config as fixed.
- Using Jest or xUnit/MSTest for a .NET backend's unit tests, Jest for a Next.js web app's unit tests, or Vitest/NUnit for a React Native app's unit tests — each is the wrong tool for that runtime's own supported tooling, not an interchangeable choice.
- Running Playwright specs against a mocked Server Action or a mocked backend endpoint, or Appium specs against a mocked backend, instead of the real running app — any of these defeats the reason e2e exists here.

## References

- Vitest docs: https://vitest.dev
- Playwright docs: https://playwright.dev
- Nx Vitest plugin: https://nx.dev/nx-api/vite
- Nx Playwright plugin: https://nx.dev/nx-api/playwright
- React Native testing docs (Jest preset): https://reactnative.dev/docs/testing-overview
- Appium docs: https://appium.io/docs/en/latest/
- NUnit docs: https://docs.nunit.org
- Playwright `APIRequestContext` (API testing): https://playwright.dev/docs/api-testing

Back to the rules: [`guides/idioms/testing-stack.md`](guides/idioms/testing-stack.md).
