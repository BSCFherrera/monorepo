# Configuración y uso de prompts del framework

Este documento define cómo configurar y usar los templates de prompts en todo el framework.

## 1. Objetivo

Asegurar que todos los cambios usen prompts consistentes, trazables y alineados con:

- ticket Jira
- change de OpenSpec
- perfil tecnológico del proyecto
- guardrails y política de datos

## 2. Dónde están los prompts

## Templates funcionales

- docs/framework/templates/prompts/01-context-template.md
- docs/framework/templates/prompts/02-analysis-template.md
- docs/framework/templates/prompts/03-code-template.md
- docs/framework/templates/prompts/04-testing-template.md
- docs/framework/templates/prompts/05-gherkin-template.md

## Prompts del agente OpenSpec

- .github/prompts/opsx-explore.prompt.md
- .github/prompts/opsx-propose.prompt.md
- .github/prompts/opsx-apply.prompt.md

## 3. Cómo configurar prompts por proyecto

## Paso 1. Completar contexto del proyecto

Editar el template de contexto con:

- stack y versiones
- arquitectura y capas
- convenciones de código
- estructura real de carpetas
- comandos build/test/lint
- restricciones de seguridad

## Paso 2. Definir guardrails y límites

Tomar reglas desde:

- docs/framework/guardrails/working-guardrails.md

Ajustar si el proyecto requiere restricciones adicionales.

## Paso 3. Vincular Jira y OpenSpec

Cada prompt debe incluir:

- Jira ID
- Change Name
- objetivo del bloque
- criterios de aceptación del ticket

## Paso 4. Guardar una versión por proyecto

Se recomienda crear una carpeta de prompts aplicados, por ejemplo:

- docs/framework/templates/prompts/applied/

Y registrar el prompt usado por cambio.

## 4. Cómo usar los prompts en el flujo completo

## Fase de entrada

- validar ticket Jira
- no generar código aún

## Fase de contexto

- usar 01-context-template.md para fijar contexto técnico

## Fase de análisis

- usar 02-analysis-template.md en cambios media/alta complejidad

## Fase de implementación

- usar 03-code-template.md por bloque pequeño

## Fase de testing

- usar 04-testing-template.md para cobertura y edge cases

## Fase de escenarios (post-propose)

- usar 05-gherkin-template.md para generar el .feature del change a partir de proposal/design/tasks ya generados

## Fase OpenSpec con agente

- /opsx:explore para aclarar
- /opsx:propose para estructurar artefactos
- /opsx:apply para implementar tareas

## 5. Reglas de calidad para prompts

- no incluir datos sensibles
- no dejar prompts ambiguos
- no pedir cambios fuera del alcance del bloque
- incluir resultados esperados verificables
- incluir restricciones de arquitectura y seguridad

## 6. Trazabilidad de prompts

Registrar por cada cambio:

- prompt version
- fecha
- autor
- Jira ID
- change name
- resultado

Puedes registrar esto en:

- docs/framework/memory/team-change-status.md
