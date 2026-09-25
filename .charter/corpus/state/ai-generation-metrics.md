# AI generation metrics

Running tally of how much of this codebase's history was AI-generated, per the `AI-Generated-By:` commit trailer (`guides/process/release.md`). Updated incrementally by the [ai-provenance sensor](sensors/ai-provenance.md) after every commit made through this charter.

**Last reconciled:** 2026-09-04 (full-history reconciliation — see `sensors/ai-provenance.md`). Only commit `6852c31` carries the `AI-Generated-By:` trailer; all 49 prior commits predate this rule (several were in fact agent-produced but used `Co-Authored-By:` or no marker at all, so they count as human-only here — the trailer is what's checked, not actual authorship history).

## Totals

| Metric | AI-generated | Human-only | Total | % AI |
|---|---|---|---|---|
| Commits | 1 | 49 | 50 | 2% |
| Lines changed (+/-) | 143 | 1,531,484 | 1,531,627 | ~0.01% |

## Notes

- A commit counts as AI-generated if its message carries an `AI-Generated-By:` trailer. No trailer → counted as human-only.
- "Lines changed" is insertions + deletions from `git show --stat`, not net lines — a large refactor with heavy deletions still counts as real work.
- If this file and `git log` disagree, trust `git log` and re-run the sensor's reconciliation pass (see `sensors/ai-provenance.md`).
