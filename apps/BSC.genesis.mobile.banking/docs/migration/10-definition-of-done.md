# 10 — Definición de listo y de terminado

---

## Definition of Ready (DoR) — una feature puede empezar cuando…

- [ ] Su especificación funcional está escrita en `02-functional-spec.md` con criterios de aceptación, y **aprobada explícitamente**.
- [ ] Su catálogo de pantallas y estados está en `03-screen-flow-catalog.md`, incluidos los estados de error, vacío y sin conexión.
- [ ] Sus endpoints están en `04-api-integration-contract.md`, con forma de petición, forma de respuesta y códigos de error conocidos.
- [ ] Sus riesgos de seguridad están identificados en `06-security-threat-model.md`.
- [ ] Sus preguntas abiertas están resueltas, o su impacto está acotado y aceptado por escrito.
- [ ] Sus dependencias de otras oleadas están terminadas.
- [ ] La matriz de escenarios de prueba está escrita, antes del código.

## Definition of Done (DoD) — una feature está terminada cuando…

### Funcional

- [ ] Todos los criterios de aceptación pasan.
- [ ] Cada estado de cada pantalla está implementado y verificado: cargando, vacío, error, sin conexión, timeout, éxito, bloqueado.
- [ ] Navegación hacia adelante, botón atrás de Android, teclado y recuperación tras segundo plano funcionan.
- [ ] Toda diferencia respecto a la app Flutter está registrada y **aprobada** en `09-traceability-matrix.md` §4.

### Pruebas

- [ ] Las pruebas se escribieron antes del código, con evidencia del ciclo rojo → verde → refactor.
- [ ] Se cumplen los umbrales de cobertura por zona de `07-test-strategy.md`. El promedio global no sustituye a ninguno.
- [ ] Las respuestas del backend se validan contra esquema, con fixtures derivados de respuestas reales redactadas.
- [ ] Los escenarios transversales aplicables pasan, incluidos doble toque y reintento en operaciones que mueven dinero.
- [ ] Cada defecto encontrado produjo primero una prueba de regresión.

### Seguridad

- [ ] Sin secretos en código, bundle, registros ni artefactos.
- [ ] Sin PII ni montos en registros, analytics ni reportes de fallos — verificado con prueba automática, no por inspección.
- [ ] Ningún dato sensible persiste en disco sin cifrar.
- [ ] Ninguna decisión de autorización se toma en el cliente.
- [ ] Las dependencias nuevas están justificadas por necesidad, mantenimiento, seguridad, licencia y costo de reemplazo, con ADR si son significativas.

### Calidad

- [ ] `npm run verify` pasa completo, con código de salida 0.
- [ ] Sin `TODO` ni `FIXME` nuevos sin ticket asociado.
- [ ] Commits pequeños y trazables; sin reescritura de historia.

### Documentación

- [ ] `09-traceability-matrix.md` refleja el código real.
- [ ] Los ADR de las decisiones tomadas están escritos.
- [ ] `12-risk-register.md` y `11-open-questions.md` actualizados.
- [ ] Spec aprobado y evidencia de pruebas congelados en `archive/`.
- [ ] `SESSION-HANDOFF.md` deja la próxima acción ejecutable.

---

## Quality gates

### Gate A — Alcance

- [ ] Inventario, especificaciones, catálogo de pantallas y contrato de API revisados.
- [ ] Preguntas bloqueantes de `11-open-questions.md` respondidas.
- [ ] Plan de migración y oleadas aceptados.
- [ ] **Aprobación explícita del usuario.**

### Gate B — Arquitectura

- [ ] ADR principales aprobados (D-01 a D-12 de `05-target-architecture.md`).
- [ ] Modelo de amenazas revisado, **con aceptación formal de las tres amenazas que la migración introduce** (T-07, T-15 y el límite de confianza JavaScript↔nativo).
- [ ] Estrategia de pruebas aprobada.
- [ ] Esqueleto técnico en pie y `verify` ejecutable.
- [ ] **El `DeviceKeyModule` firma correctamente en un teléfono real.** Sin esto, el Gate B no se cierra bajo ninguna circunstancia.

### Gate C — Por feature

- [ ] DoR cumplido al empezar, DoD cumplido al cerrar.
- [ ] Pruebas en verde y umbrales cumplidos.
- [ ] Paridad funcional y visual verificada, con las diferencias aprobadas.
- [ ] Sin hallazgos de seguridad críticos o altos abiertos.

### Gate D — Candidata a release

- [ ] `verify` completo en verde, reproducible, con informe con fecha, commit y versiones de herramientas.
- [ ] Verificación por pantalla completa, para todas las superficies del catálogo.
- [ ] Escenarios transversales ejecutados, incluidos instalación limpia, actualización y vuelta atrás.
- [ ] Rendimiento y memoria medidos en flujos críticos **contra la línea base de la app Flutter**.
- [ ] SBOM generado; SCA, SAST y escaneo de secretos sin hallazgos críticos o altos.
- [ ] Revisión MASTG priorizada por riesgo, ejecutada y documentada.
- [ ] **Cero hallazgos críticos o altos sin excepción formal aprobada y con fecha de vencimiento.**

### Gate E — Cierre

- [ ] Trazabilidad completa: cada capacidad Flutter tiene destino, prueba y estado.
- [ ] Documentación reconciliada con el código real.
- [ ] Evidencias archivadas en `archive/`.
- [ ] Runbooks de operación e incidentes.
- [ ] Plan de despliegue gradual y de vuelta atrás aprobado.
- [ ] Plan de comunicación al cliente sobre el re-enrolamiento del dispositivo (D-09).

---

## Criterios de rechazo

Se detiene el avance, sin negociación, si:

- Una prueba se ajusta para que pase en vez de corregirse el código.
- Un mock se adapta a lo que el cliente espera en vez de al contrato real.
- Un hallazgo crítico o alto se pospone sin excepción formal por escrito.
- Un control de seguridad se degrada para que quepa en React Native.
- Se declara terminada una feature cuya documentación no refleja el código.
