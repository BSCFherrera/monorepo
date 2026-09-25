---
kind: rule
id: rules/keystone-idioms-testing-stack
description: The mandatory unit/integration and e2e test frameworks for every project in this repo, by project type — Next.js web uses Vitest + Playwright, .NET backend uses NUnit + Playwright, React Native mobile uses Jest + Appium.
globs:
  - "**/*.spec.*"
  - "**/*.test.*"
  - "**/*.e2e.*"
  - "**/e2e/**"
  - "vitest.config.*"
  - "playwright.config.*"
source: .charter/guides/idioms/testing-stack.md
generated_by: keystone-project
---

# Testing stack — rules

Full guide: `.charter/guides/idioms/testing-stack.md` (read on demand).

## IRON LAW

The mandated test stack is fixed **per project type**, never picked ad hoc or left to an Nx generator's default:

| Project type | Unit/integration | E2E |
|---|---|---|
| Next.js web app `apps/<name>` (see [`idioms/react/nextjs-ssr`](idioms/react/nextjs-ssr.md)) | **Vitest** | **Playwright** |
| .NET backend service `apps/<name>` (see [`idioms/dotnet/backend`](idioms/dotnet/backend.md)) | **NUnit** | **Playwright** (API-level, against the real running service) |
| React Native mobile app (see [`idioms/react-native/mobile-app`](idioms/react-native/mobile-app.md)) | **Jest** (+ `@testing-library/react-native`) | **Appium** |

Never Mocha, Jasmine, Cypress, xUnit, or MSTest for a new project of any type. Never Vitest or Jest for a .NET backend's unit tests, never Jest for a Next.js web app's unit tests, and never Vitest for a React Native app's unit tests — each pairing is the one its project type's own tooling is built and maintained against, not an interchangeable default.


## GOLDEN RULE

- Scaffold with the project type's mandated runner explicitly (e.g. `--unitTestRunner=vitest --e2eTestRunner=playwright` for a Next.js web app; the .NET SDK's NUnit test project template for a backend; Jest + Appium wired in for a React Native app) rather than accepting whatever a generator defaults to and swapping later.
- Domain/application-layer unit tests run under each project type's mandated runner (Vitest for TS, NUnit for .NET) with zero framework/DOM globals — they test plain domain code, matching the hexagonal architecture's zero-framework-import rule for `domain/`.
- E2E specs run against a real running app, never a mocked-API stand-in, per `idioms/testing-policy` — Playwright for a Next.js web app (browser-level) or a .NET backend (API-level HTTP calls against the real running service), Appium for a React Native app (native UI).


## RULES

- React Native e2e uses Appium as the *driver*, but never the WebdriverIO CLI test runner (`wdio.conf.ts`) as the *framework* — it only ships adapters for Mocha/Jasmine/Cucumber, all banned by this guide's iron law. Instead write plain Jest test files that import `webdriverio`'s `remote()` directly to create/tear down each test's own Appium session, and use `expect-webdriverio`'s `expect` (assigned over Jest's global `expect` in a setup file — it replaces Jest's `expect`, not `.extend()`s it) for `toBeEnabled()`/`toBeDisplayed()` matchers. Required config: `extensionsToTreatAsEsm: ['.ts']` + `ts-jest`'s `useESM: true` and `tsconfig` `module: esnext` / `moduleResolution: bundler` (webdriverio/expect-webdriverio ship real ESM throughout their dependency tree — forcing a CJS transform is a dead end); `NODE_OPTIONS=--experimental-vm-modules` wired into the Nx target's `env`; `@wdio/globals` kept as a plain dependency even though nothing imports it directly (`expect-webdriverio`'s snapshot matcher hard-requires it internally); and, after each session is created, an explicit `waitForExist({ timeout: 30000 })` on a known element before interacting, since each session relaunches the app and re-fetches the JS bundle from Metro.

For reasoning, see [`corpus/idioms/testing-stack.md`](corpus/idioms/testing-stack.md).
