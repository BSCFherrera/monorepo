# Archivo de evidencia

Aquí se congela, al cierre de cada ciclo SDD, lo que permite reconstruir qué se aprobó y con qué evidencia.

## Estructura

```
archive/
└── <NN>-<oleada>/
    ├── spec-aprobado.md        copia congelada del spec, con fecha y quién aprobó
    ├── resultados-pruebas.md   salida de `verify`, cobertura por zona, evidencia del ciclo TDD
    ├── evidencia-hardware.md   pruebas de StrongBox, biometría y FLAG_SECURE en dispositivo real
    ├── decisiones.md           decisiones tomadas durante el ciclo y su justificación
    └── cierre.md               diferencias respecto a Flutter, deuda abierta, riesgos nuevos
```

## Reglas

- **Nunca se archivan secretos, credenciales, tokens, certificados, PII ni datos bancarios.** Las capturas y los fixtures son sintéticos y redactados.
- No se archivan binarios innecesarios: los APK y los artefactos de compilación viven en el pipeline, no aquí.
- Lo archivado **no se edita**. Si algo cambia, se archiva la versión nueva junto a la anterior.
- Un ciclo no se da por cerrado si su carpeta está incompleta.
