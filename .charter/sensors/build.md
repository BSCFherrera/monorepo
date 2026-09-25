---
kind: sensor
mode: computational
on: pre-verify
run: 'pnpm nx run-many -t build'
id: build
description: 'The project''s build / compile / package step.'
---
# Sensor: build

The project's build / compile / package step.

- **Trigger** — verification phase (gate).
- **Inputs** — the project's build command from `corpus/state/CODEBASE_STATE.md`.
- **Exit condition** — exit code 0; artifacts produced where expected.
- **Output** — pass/fail.
- **State writes** — none.
