---
kind: sensor
mode: computational
on: release
run: '# TODO: wire the ai-provenance metric update'
id: ai-provenance
description: 'Tracks what percentage of commits and changed lines are AI-generated, from the AI-Generated-By trailer.'
---
# Sensor: ai-provenance

Tracks what percentage of commits and changed lines are AI-generated, from the `AI-Generated-By:` trailer defined in `guides/process/release.md`.

- **Trigger** — release phase, right after `git commit` succeeds.
- **Inputs** — the commit just made (`git show --stat HEAD`, `git log -1 --format=%B HEAD`).
- **Exit condition** — the commit is classified (AI-generated if it carries `AI-Generated-By:`, human otherwise) and its insertions+deletions counted.
- **Output** — updated running totals: `commits_total`, `commits_ai`, `lines_total`, `lines_ai`, and the derived percentages.
- **State writes** — proposes a diff to `corpus/state/ai-generation-metrics.md` (increment, never recompute from full history unless the file is missing or the user explicitly asks for a reconciliation pass). User accepts or edits, per the scaffolding safety contract.

## Reconciliation

If the state file is missing, corrupted, or the user suspects drift, recompute from full history instead of incrementing:

```
git log --format='%H' | while read c; do
  git log -1 --format='%B' "$c" | grep -q '^AI-Generated-By:' && echo "$c ai" || echo "$c human"
done
```

Cross-tabulate against `git log --numstat` for the lines-changed totals.
