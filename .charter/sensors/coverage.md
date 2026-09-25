---
kind: sensor
mode: computational
on: pre-verify
run: 'pnpm nx run-many -t test --coverage'
id: coverage
description: 'Reads test coverage and updates the State layer.'
---
# Sensor: coverage

Reads test coverage and updates the State layer.

- **Trigger** — verification phase (proposes state update), **audit**.
- **Inputs** — the project's coverage command from `corpus/state/CODEBASE_STATE.md`. Skipped if no coverage tool is configured.
- **Exit condition** — coverage report produced. Threshold: **85%** on statements, branches, and lines, both frontend and backend (`rules/idioms/testing-policy`) — a report under threshold fails the verification gate.
- **Output** — coverage stats per region.
- **State writes** — proposes a diff to `corpus/state/CODEBASE_STATE.md` updating coverage per region. User accepts or edits.
