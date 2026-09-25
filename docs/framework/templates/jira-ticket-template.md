# Plantilla de ticket Jira

## Campos obligatorios

- Jira ID
- Tipo de ítem
- Resumen
- Descripción
- Criterios de aceptación
- Prioridad
- Riesgos conocidos
- Dependencias
- Restricciones técnicas

## Ejemplo

```text
ID: JIRA-123
Tipo: Historia
Resumen: Crear endpoint de estado del servicio
Descripción: Como consumidor interno, necesito consultar el estado del servicio para validar disponibilidad.
Criterios de aceptación:
- responde 200
- retorna payload JSON con estado
- no expone datos sensibles
Prioridad: Media
Riesgos: bajo
Dependencias: ninguna
Restricciones técnicas: respetar arquitectura y perfil tecnológico vigente
```
