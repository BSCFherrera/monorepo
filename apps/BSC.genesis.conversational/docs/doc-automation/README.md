# Automatizacion de Documentacion Tecnica - Frontend

Esta implementacion genera documentacion tecnica del frontend desde metadatos de Azure DevOps y opcionalmente la publica en Confluence.

## Archivos principales

- scripts/doc_automation/generate_docs.py
- scripts/doc_automation/config.example.json
- scripts/doc_automation/templates/*.md.tpl
- .azuredevops/build/docs-automation.yml

## Variables requeridas

- ADO_ORG_URL
- ADO_PROJECT
- ADO_PAT

Opcionales:

- ADO_REPO_ID
- PUBLISH_CONFLUENCE (true/false)
- CONFLUENCE_BASE_URL
- CONFLUENCE_SPACE_KEY
- CONFLUENCE_USER
- CONFLUENCE_API_TOKEN
- CONFLUENCE_PARENT_TITLE

## Ejecucion local

```powershell
cd c:\Users\extjvisbal\AppConversacionalWorkspace\AppConversacional-FrontEnd
$env:ADO_ORG_URL = "https://dev.azure.com/BMSC"
$env:ADO_PROJECT = "Proyecto_Genesis"
$env:ADO_REPO_ID = "BSC.genesis.conversational.frontend"
$env:ADO_PAT = "<PAT>"
$env:PUBLISH_CONFLUENCE = "false"
python scripts/doc_automation/generate_docs.py --config scripts/doc_automation/config.example.json --repo-root .
```

Salida:

- docs/generated/service_catalog.md
- docs/generated/architecture_overview.md
- docs/generated/changelog.md
- docs/generated/deployment_guide.md
- docs/generated/metadata_snapshot.json

## Que genera para el front

- Catalogo de pantallas, componentes y archivos TSX detectados
- Diagrama de arquitectura de alto nivel del app mobile
- Changelog tecnico desde commits y PRs
- Guia de despliegue desde pipelines de Azure DevOps

## Pipeline automatico

El YAML corre por merge a main/master/develop y semanalmente.

## Personalizacion de plantillas

Los equipos pueden sobrescribir plantillas sin tocar codigo creando archivos en:

- docs/doc-automation/templates-overrides/

Nombres soportados:

- service_catalog.md.tpl
- architecture_overview.md.tpl
- changelog.md.tpl
- deployment_guide.md.tpl
