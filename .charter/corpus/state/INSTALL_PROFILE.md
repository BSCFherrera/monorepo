---
kind: corpus
id: corpus/state/INSTALL_PROFILE
description: 'Selections captured by `keystone init`; read by the bootstrap action.'
created: 2026-08-27
---

# Install Profile

Selections captured by `keystone init`. Read by the **bootstrap** action; safe to edit by hand. Machine state (keystone version, agents, policies) lives in [`.charter/lockfile.json`](.charter/lockfile.json) at the repo root.

## Selections

| Category | Value(s) |
|---|---|
| agent | claude-code |
| app-type | mobile (React Native 0.87, Android/iOS + web preview) |
| architecture | Nx monorepo; app features layered `data/domain/ui` |
| testing | Jest 29 (TDD); Gherkin test cases pre-OpenSpec; no Appium e2e yet |
| compliance | banking — regime to be confirmed by the team |
| starter | _(unset)_ |
