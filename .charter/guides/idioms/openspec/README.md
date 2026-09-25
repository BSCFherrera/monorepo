# OpenSpec — this package's stack

`openspec/**` holds the spec-driven change-management config
(`config.yaml`: `schema: spec-driven`) and, at runtime, per-change
proposals under `openspec/changes/<change-name>/` created by
`scripts/create-change.ps1` via `npx openspec new change`.
