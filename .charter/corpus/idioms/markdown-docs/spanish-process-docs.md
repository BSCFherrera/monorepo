# Spanish-Language Process Docs

`README.md` and `docs/**/*.md` are written in Spanish (see `README.md`'s "Uso recomendado" / "Comandos del paquete" sections) — this is a deliberate choice, since the package targets Spanish-speaking teams adopting the framework. Docs mix prose instructions with literal command blocks (npm scripts, agent slash-commands like `/opsx:explore`) that must stay copy-pasteable.

> **Rules extracted:** [`guides/idioms/markdown-docs/spanish-process-docs.md`](guides/idioms/markdown-docs/spanish-process-docs.md).

## How to apply

- Write new process docs and templates in Spanish, matching the existing corpus, unless the user asks for English.
- Keep command blocks (npm scripts, slash-commands) verbatim and tested against what actually exists in `package.json` / `scripts/` — don't invent flags or commands.

## Review checklist

- [ ] Does new prose match the existing Spanish-language convention?
- [ ] Do quoted commands match real `package.json` scripts / documented slash-commands?

**Traces to:** iron law "No invented imports, methods, config keys, or CLI flags" (CHARTER.md).
