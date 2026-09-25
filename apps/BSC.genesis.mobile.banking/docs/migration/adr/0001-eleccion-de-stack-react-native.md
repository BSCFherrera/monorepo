# ADR-0001 — Migrar de Flutter a React Native

**Estado:** ✅ **Aceptado**
**Fecha de propuesta:** 2026-09-16 · **Fecha de aceptación:** 2026-09-16
**Decidido por:** Banco Santa Cruz — política de empresa (comunicado por R. Ceballos)
**Supersede a:** `BSC.MobileApp/docs/ANALISIS-STACK-TECNOLOGICO.md` §1.1

---

## Contexto

`BSC.MobileApp` está escrita en Flutter: 29.671 líneas de Dart, 13 features, ~30 superficies visuales, 2 módulos nativos Kotlin, solo Android. Funciona, compila sin errores y sus 77 pruebas pasan.

Existe un análisis previo en el mismo repositorio que evaluó Flutter frente a React Native y **concluyó a favor de Flutter**, con tres argumentos: ausencia de un intérprete de JavaScript en el dispositivo, rendimiento y consistencia visual, y estabilidad frente a actualizaciones del sistema operativo.

## Decisión

**Se migra a React Native.**

**La justificación es institucional, no técnica: es una política de empresa de Banco Santa Cruz.** Se registra exactamente así, sin construir a posteriori una argumentación técnica que no fue la que originó la decisión. Documentarla de otro modo sería deshonesto y, además, frágil: cualquiera que compare este ADR con el análisis anterior detectaría la contradicción.

El análisis previo queda **superseded, no invalidado**. Sus observaciones técnicas siguen siendo correctas y por eso alimentan directamente el modelo de amenazas (T-07, T-15) y la oleada de endurecimiento del plan de migración.

## Consecuencias que la decisión acarrea

### Beneficios que sí se materializan

1. **Se elimina una de tres implementaciones duplicadas.** `operationFingerprint` existe hoy en C# (backend), TypeScript (portal) y Dart (app). La copia Dart desaparece y el algoritmo pasa a compartirse entre portal y app vía `packages/bsc-shared/`.
2. **El lenguaje coincide con el del resto del ecosistema BSC.** El portal es Nuxt 4 + Vue 3 + TypeScript 5.9; Dart no se usa en ninguna otra parte.
3. **Mayor disponibilidad de talento** de TypeScript que de Dart en el mercado local.
4. **El código nativo Kotlin se conserva.** `DeviceKeyPlugin.kt` y `SecureScreenPlugin.kt` se reutilizan; el costo es el puente, no la criptografía.

### Costos que hay que asumir de forma explícita

1. **T-07 — Bundle de JavaScript en el dispositivo.** Flutter compila AOT a código máquina; React Native embarca bytecode de Hermes. Mitigable con ofuscación, eliminación de `console.*`, ausencia de source maps y verificación de firma — **pero no eliminable**. Requiere aceptación formal de seguridad en el Gate B.
2. **T-15 — Superficie de cadena de suministro.** npm tiene un historial de incidentes mayor que pub.dev. Se mitiga con lockfile fijado, SCA, SBOM y cero dependencias de terceros en la ruta de firma.
3. **Un límite de confianza nuevo:** el borde JavaScript ↔ nativo. Todo lo que lo cruce se trata como entrada no confiable del lado Kotlin/Swift.
4. **~144 puntos de esfuerzo base, +35% por iOS** (ver ADR-0003), para obtener una aplicación que hace lo que la actual ya hace. El retorno está en el mantenimiento futuro.
5. **Cada cliente debe volver a enrolar su dispositivo.** La llave del StrongBox no se transfiere entre aplicaciones.

## Condición no negociable

Si en la oleada 0 la firma con llave en hardware **no alcanza paridad** con las garantías actuales —StrongBox/Secure Enclave, biometría obligatoria por firma, invalidación al cambiar la biometría—, **se detiene y se reporta**. No se degrada el control de seguridad para que quepa en React Native. La política de empresa fija el framework; no autoriza bajar el nivel de protección del canal.
