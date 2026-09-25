# Guía Maestra del Framework IA-SDLC + Jira + OpenSpec

Usa este documento como punto único de entrada para adoptar el framework en un proyecto nuevo o existente.

## Qué hace este framework

- recibe trabajo desde Jira
- transforma ese trabajo en changes de OpenSpec
- aplica contexto, prompts, guardrails y validaciones
- entrega cambios trazables con revisión humana y automatización controlada

## Qué parte es manual

- definición del ticket
- clasificación de complejidad y riesgo
- aprobación de diseño, seguridad y PR
- decisión de merge y despliegue

## Qué parte es automática o automatizable

- scaffolding de OpenSpec
- generación de análisis, código y pruebas
- build, lint, test, seguridad y cobertura en CI
- creación de ramas, PRs y comentarios automáticos

## Flujo resumido

```text
Jira
→ validación de entrada
→ OpenSpec change
→ análisis
→ implementación por bloques
→ pruebas y pipeline
→ PR
→ aprobación
→ merge
→ despliegue
→ cierre
```

## Uso

1. Copia este paquete al proyecto.
2. Completa la plantilla de perfil tecnológico.
3. Ajusta la plantilla de ticket Jira.
4. Inicializa OpenSpec.
5. Ejecuta el primer cambio usando la guía completa del repositorio origen si necesitas más detalle.

## Comandos de instalación y ejecución

Desde `framework-package`:

```bash
npm install
npm run framework:setup
npm run framework:jira:configure
```

### Wizard interactivo — flujo completo de inicio a fin

Para ejecutar **todo el flujo** guiado por un asistente interactivo que solicita los datos en pantalla:

```bash
npm run framework:full-flow
```

El wizard realiza, paso a paso:

1. Detecta si el proyecto es nuevo o existente.
2. Instala dependencias, Keystone, OpenSpec y las proyecciones del charter.
3. Valida las reglas Keystone antes de iniciar el desarrollo.
4. Solicita el perfil técnico y reglas de arquitectura (solo proyectos nuevos).
5. Configura Jira y obtiene el ticket mediante Atlassian MCP cuando se usa Claude Code.
6. Configura el repositorio Git (remote, rama principal).
7. Crea el change OpenSpec y la rama Git.
8. Ejecuta en Claude Code las etapas OpenSpec usando el charter Keystone.
9. Sincroniza la memoria del framework.
10. Opcionalmente ejecuta Validación → Publicación → Cierre cuando el agente termina.

Parámetros disponibles para modo semi-automático:

```bash
npm run framework:full-flow -- -JiraId PROJ-123 -Type story -Title "Add health endpoint" -SkipJiraConfig
npm run framework:full-flow -- -Unattended -JiraId PROJ-123 -Type story -Title "Add health endpoint"
npm run framework:full-flow -- -TargetPath "C:\Projects\MiProyecto"
npm run framework:full-flow -- -TargetPath "C:\Projects\MiProyecto" -Agent claude-code
npm run framework:full-flow -- -TargetPath "C:\Projects\MiProyecto" -Agent manual
npm run framework:full-flow -- -TargetPath "$HOME/Projects/MiProyecto"   # macOS
```

El modo `claude-code` es el predeterminado: requiere Claude Code instalado,
el servidor `atlassian` autenticado con `/mcp` y usa `getJiraIssue` para obtener
el ticket. El agente lee `CLAUDE.md`, `CHARTER.md` y `.charter/` antes de
ejecutar OpenSpec. `-Agent manual` habilita explícitamente el fallback REST y
las etapas de automatización por API.

Para ejecutar solo las etapas OpenSpec directamente con Claude Code:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\invoke-claude-openspec.ps1 `
	-ChangeName "jira-123-mi-cambio" `
	-TargetPath "C:\Projects\MiProyecto" `
	-JiraId "JIRA-123"
```

En macOS:

```bash
pwsh -File ./scripts/invoke-claude-openspec.ps1 \
	-ChangeName "jira-123-mi-cambio" \
	-TargetPath "$HOME/Projects/MiProyecto" \
	-JiraId "JIRA-123"
```

Si no quieres persistir variables en el equipo, usa:

```bash
npm run framework:jira:configure -- -SessionOnly
```

Para crear un change desde Jira:

```bash
npm run framework:new-change -- -JiraId JIRA-123 -Type story -Title "Add customer health endpoint" -CreateBranch
```

Para crear el change y ejecutar el flujo base de OpenSpec en una sola acción:

```bash
npm run framework:auto-flow -- -JiraId JIRA-123 -Type story -Title "Add customer health endpoint" -CreateBranch
```

Para explorar, proponer e implementar con OpenSpec y el agente:

```text
/opsx:explore jira-123-add-customer-health-endpoint
/opsx:propose jira-123-add-customer-health-endpoint
/opsx:apply jira-123-add-customer-health-endpoint
```

Para generar escenarios de prueba en Gherkin a partir del spec del change (requiere haber corrido `/opsx:propose` o `opsx-propose.ps1` antes, ya que lee `proposal.md`/`design.md`/`tasks.md`):

```bash
npm run framework:scenarios:generate -- -ChangeName jira-123-add-customer-health-endpoint
```

El archivo se guarda en `openspec/changes/<changeName>/scenarios/<changeName>.feature`.

Para validar, sincronizar y publicar:

```bash ICM como framework de manejo de memoria
npm run framework:validate
npm run framework:memory:update -- -JiraId JIRA-123 -ChangeName jira-123-add-customer-health-endpoint -Stage implementation -Status in-progress -Summary "Started implementation"
npm run framework:memory:sync
npm run framework:sync-remote
npm run framework:publish -- -Branch feature/JIRA-123-add-customer-health-endpoint -Message "feat: add customer health endpoint [JIRA-123]"
```

Para cerrar el change después de probarlo:

```bash
npm run framework:close-change -- -ChangeName jira-123-add-customer-health-endpoint
```

## Esquema de memoria del framework

El framework usa dos niveles de memoria:

- memoria local: `.framework-memory/local-status.md` para notas de ejecución locales
- memoria compartida: `docs/framework/memory/team-change-status.md` para estatus replicado y visible para todo el equipo

La réplica al repositorio se realiza con:

```bash
npm run framework:memory:update -- -JiraId JIRA-123 -ChangeName jira-123-add-customer-health-endpoint -Stage qa -Status ready-for-review -Summary "Validation completed"
npm run framework:memory:sync
```

## Flujo automático de Jira, memoria y OpenSpec

El flujo recomendado para una historia nueva es:

```bash
npm run framework:jira:download -- -JiraId JIRA-123
npm run framework:auto-flow -- -JiraId JIRA-123 -Type story -Title "Add customer health endpoint" -CreateBranch
npm run framework:memory:sync
```

Si el equipo ya terminó de probar el change:

```bash
npm run framework:validate
npm run framework:close-change -- -ChangeName jira-123-add-customer-health-endpoint
npm run framework:memory:update -- -JiraId JIRA-123 -ChangeName jira-123-add-customer-health-endpoint -Stage closed -Status archived -Summary "Change archived after validation"
npm run framework:memory:sync
```

## Configuración y uso de prompts

Configura y usa los templates con la guía:

- `docs/framework/PROMPT-CONFIG-AND-USAGE.md`

Los templates base están en:

- `docs/framework/templates/prompts/01-context-template.md`
- `docs/framework/templates/prompts/02-analysis-template.md`
- `docs/framework/templates/prompts/03-code-template.md`
- `docs/framework/templates/prompts/04-testing-template.md`

## Qué instala el paquete en el proyecto destino

- `.github/copilot-instructions.md`
- `.github/prompts/`
- `.github/skills/`
- `docs/framework/FRAMEWORK-MASTER-GUIDE.md`
- `docs/framework/QUICK-START-CHECKLIST.md`
- `docs/framework/RACI-MATRIX.md`
- `docs/framework/templates/`
- `docs/framework/guardrails/`
- `openspec/config.yaml`
- `framework.config.json`

## Límite de automatización

El paquete automatiza el setup, la descarga de Jira, la creación base del change, la validación, la sincronización de memoria, la sincronización remota, el cierre del change y la publicación de ramas o commits.

Sigue siendo necesaria intervención humana para:

- validar el ticket Jira
- aprobar análisis y arquitectura
- revisar el código generado
- aprobar PRs y despliegues
- aprobar el archivado final del change si la organización lo exige
