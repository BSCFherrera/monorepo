---
kind: guide
id: idioms/powershell/fail-fast-automation
description: 'PowerShell scripts fail fast: $ErrorActionPreference=Stop, mandatory params, guarded Push-Location.'
globs:
  - "scripts/**/*.ps1"
---
# Fail-Fast Automation Scripts — rules

The rules from [`corpus/idioms/powershell/fail-fast-automation.md`](corpus/idioms/powershell/fail-fast-automation.md).

## IRON LAW

Every script must set `$ErrorActionPreference = "Stop"` before doing any work that can fail.

## GOLDEN RULE

- Required inputs are mandatory `param()` entries, not optional-with-silent-default.
- Directory changes (`Push-Location`) are paired with `try/finally` to guarantee restoration.
- Config is loaded once from `framework.config.json` via `ConvertFrom-Json`, and only keys verified to exist in that file are read.
