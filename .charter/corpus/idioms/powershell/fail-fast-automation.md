# Fail-Fast Automation Scripts

Every script in `scripts/` sets `$ErrorActionPreference = "Stop"` up front and declares its inputs as `param()` blocks with `[Parameter(Mandatory = $true)]` for anything the flow can't proceed without (e.g. `$JiraId`, `$Type`, `$Title` in `create-change.ps1`). Config is read once via `Get-Content ... | ConvertFrom-Json` against `framework.config.json`, not re-parsed per call.

> **Rules extracted:** [`guides/idioms/powershell/fail-fast-automation.md`](guides/idioms/powershell/fail-fast-automation.md).

## How to apply

- Start every new script with `$ErrorActionPreference = "Stop"` so an unhandled error halts the flow instead of continuing with bad state.
- Model required inputs as mandatory `param()` entries, not env-var lookups or interactive prompts.
- Load `framework.config.json` once via `ConvertFrom-Json`; don't hand-parse it.
- Use `Push-Location`/`try`/`finally` (see `create-change.ps1`) when a script changes directory, so the working directory is restored even on error.

## Review checklist

- [ ] Does the script set `$ErrorActionPreference = "Stop"`?
- [ ] Are required inputs mandatory params, not silently-defaulted or read from environment?
- [ ] Is `Push-Location` paired with a `try/finally` that restores location?
- [ ] Is `framework.config.json` read once, not repeatedly?

**Traces to:** iron law "No invented imports, methods, config keys, or CLI flags" (CHARTER.md) — these scripts read config keys they can prove exist in `framework.config.json`.
