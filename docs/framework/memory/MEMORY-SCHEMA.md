# Esquema de memoria del framework

## Objetivo

Mantener estado compartido y trazable de los cambios del framework para todo el equipo.

## Niveles de memoria

## Memoria local

- ruta: .framework-memory/local-status.md
- propósito: notas locales y operativas del desarrollador
- versionado: no obligatorio

## Memoria compartida del repositorio

- ruta: docs/framework/memory/team-change-status.md
- propósito: estado oficial de los cambios y decisiones relevantes
- versionado: sí, se debe commitear

## Formato de entradas

Cada registro debe tener:

- timestamp
- Jira ID
- change name
- stage
- status
- summary
- author

## Ejemplo

```text
- timestamp: 2026-08-04T12:00:00Z
  jiraId: JIRA-123
  changeName: jira-123-add-customer-health-endpoint
  stage: implementation
  status: in-progress
  summary: service and tests scaffolded
  author: developer-name
```

## Flujo de actualización

1. actualizar memoria con framework:memory:update
2. replicar a memoria compartida con framework:memory:sync
3. incluir archivo actualizado en commit o PR
