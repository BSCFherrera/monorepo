---
kind: sensor
mode: computational
on: PreToolUse
run: '# TODO: wire the commit-message check'
id: commit-message
description: 'Validates conventional-commit format and presence of the AI-Generated-By trailer on agent-produced commits.'
---
# Sensor: commit-message

Validates conventional-commit format and presence of the `AI-Generated-By:` trailer on agent-produced commits.

- **Trigger** — release phase (final gate before `git commit`).
- **Inputs** — the staged commit message; whether the commit is agent-authored/agent-modified (always true for a commit produced through this charter's `task`/`sdd` playbooks).
- **Exit condition** — message matches `<type>(<scope>): <subject>`, title under 70 chars, and — if the commit is agent-produced — carries an `AI-Generated-By: <tool>/<model>` trailer. A commit with zero agent involvement must **not** carry the trailer. `Co-Authored-By:` is never an acceptable substitute (see `guides/process/release.md`'s IRON LAW).
- **Output** — pass/fail. On fail: the violated rule (missing trailer, malformed trailer, or format violation) and a suggested fix.
- **State writes** — none.
