# Perfil Tecnico del Proyecto

> Generado por: run-full-flow.ps1 (IA-SDLC Framework)
> Fecha: 2026-09-25

## Informacion general

| Campo         | Valor       |
|---------------|-------------|
| Nombre        | BSC.genesis.monorepo  |
| Descripcion   | Definido por el ticket Jira asociado a este cambio.  |

## Arquitectura, testing, cobertura y CI

Estas decisiones no se solicitan interactivamente. La agente IA (Claude Code) las toma de:

- `.charter/corpus/state/CODEBASE_STATE.md` (stack detectado, comandos de tooling, region map)
- `.charter/guides/idioms/<stack>/` (convenciones de arquitectura por stack)
- `.charter/guides/computational/` (lint, formato, editorconfig)

Si `CODEBASE_STATE.md` aun tiene placeholders sin resolver, la agente ejecuta primero la skill `keystone:bootstrap` (`.charter/commands/bootstrap.md`) para detectarlas del codigo real antes de implementar.

---
*Este archivo se usa como contexto tecnico por el agente IA durante la implementacion.*

