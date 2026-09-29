# Paquete de implementacion (frontend)

El paquete maestro de implementacion y coordinacion con administradores se encuentra en:

- `../../../AppConversacional-BackEnd/docs/traceability/implementation-package/README.md`

Este repositorio ya tiene los pipelines y scripts necesarios para trazabilidad:

- `.azuredevops/build/traceability-pr.yml`
- `.azuredevops/build/traceability-prod-gate.yml`
- `.azuredevops/scripts/traceability/validate-jira-key-pr.sh`
- `.azuredevops/scripts/traceability/validate-jira-prod-gate.sh`

Usar el mismo variable group:

- `vg-jira-traceability`

Modo de produccion requerido:

- observacion sin bloqueo (`TRACEABILITY_ENFORCE_GATE=false`)
