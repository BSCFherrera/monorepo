---
kind: rule
id: rules/keystone-idioms-openspec-change-lifecycle
description: Changes under openspec/changes/ go through the openspec CLI, never hand-authored.
globs:
  - "openspec/**"
source: .charter/guides/idioms/openspec/change-lifecycle.md
generated_by: keystone-project
---

# OpenSpec Change Lifecycle — rules

Full guide: `.charter/guides/idioms/openspec/change-lifecycle.md` (read on demand).

## IRON LAW

Changes under `openspec/changes/` are created only via the `openspec` CLI (directly or through `scripts/create-change.ps1` / `scripts/opsx-*.ps1`), never hand-authored.


## GOLDEN RULE

- Keep `jira-context.md` and `jira-snapshot.md` present and accurate for each change — later stages (memory sync, close-change) depend on them.
- Don't add keys to `openspec/config.yaml` that neither the `openspec` CLI nor this package's scripts read.
