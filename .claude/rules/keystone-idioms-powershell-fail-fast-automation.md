---
kind: rule
id: rules/keystone-idioms-powershell-fail-fast-automation
description: "PowerShell scripts fail fast: $ErrorActionPreference=Stop, mandatory params, guarded Push-Location."
globs:
  - "scripts/**/*.ps1"
source: .charter/guides/idioms/powershell/fail-fast-automation.md
generated_by: keystone-project
---

# Fail-Fast Automation Scripts — rules

Full guide: `.charter/guides/idioms/powershell/fail-fast-automation.md` (read on demand).

## IRON LAW

Every script must set `$ErrorActionPreference = "Stop"` before doing any work that can fail.


## GOLDEN RULE

- Required inputs are mandatory `param()` entries, not optional-with-silent-default.
- Directory changes (`Push-Location`) are paired with `try/finally` to guarantee restoration.
- Config is loaded once from `framework.config.json` via `ConvertFrom-Json`, and only keys verified to exist in that file are read.
