# OpenSpec Change Lifecycle

Changes are not free-form edits — they go through `npx openspec new change <name>` (invoked by `scripts/create-change.ps1`), producing `openspec/changes/<change-name>/` with a `jira-context.md` recording the originating Jira ID/type/title, plus an optional `jira-snapshot.md` copied from either the target project's `docs/framework/memory/jira-issues/<JiraId>.md` or its local `.framework-memory/jira-<JiraId>.md`. `openspec/config.yaml` fixes `schema: spec-driven` for the whole package.

> **Rules extracted:** [`guides/idioms/openspec/change-lifecycle.md`](guides/idioms/openspec/change-lifecycle.md).

## How to apply

- Never hand-create a directory under `openspec/changes/` — always go through the `openspec` CLI (directly or via `scripts/opsx-*.ps1` / `create-change.ps1`) so the change is registered in OpenSpec's own state.
- Preserve the `jira-context.md` / `jira-snapshot.md` pairing when scripting around changes — downstream tooling (memory sync, close-change) expects them.
- Treat `openspec/config.yaml`'s `schema: spec-driven` as fixed; don't add ad hoc schema keys without checking what the `openspec` CLI actually reads.

## Review checklist

- [ ] Was the change created via the `openspec` CLI, not by hand?
- [ ] Does `jira-context.md` exist and match the Jira ID/type/title actually used?
- [ ] Are new config keys in `openspec/config.yaml` ones the CLI or scripts actually consume?

**Traces to:** iron law "No invented imports, methods, config keys, or CLI flags" (CHARTER.md).
