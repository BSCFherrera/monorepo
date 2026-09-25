# Agents

Canonical home for project-authored agent definitions. Each agent
lives at `agents/<id>.md` and declares the canonical primitive
frontmatter — `kind: agent`, `id`, `description`, `tools:` — plus a
system-prompt body (a role spawned as a subagent by `id`, per `CHARTER.md`).

This is the **source of truth**. `keystone project` regenerates the host
projection at `.claude/agents/<id>.md` by copying the file verbatim.
Hand-edits to the projection are erased on the next run; the drift
sensor reports them.

The same file is served by `keystone-mcp` so MCP-aware hosts can
discover agents alongside rules and skills. One source, many
consumers.

## Authoring

```
keystone new agent <id>
```

Scaffolds `agents/<id>.md` with canonical frontmatter. Fill in the
system prompt body — `tools:` declares the allow-list the host enforces
when this agent runs.

See [`docs/ports/primitive.md`](docs/ports/primitive.md) for the
full descriptor shape.
