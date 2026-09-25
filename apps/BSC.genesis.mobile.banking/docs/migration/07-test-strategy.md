# 07 — Estrategia de pruebas

**Punto de partida verificado:** la app Flutter tiene **77 pruebas en verde** repartidas en 8 archivos. Cubren bien el núcleo de seguridad —interceptor de autenticación, gestor de sesión, huella de operación, clasificación de riesgo, integridad, formateadores— y un widget. **No cubren ninguna pantalla, ningún BLoC, ningún repositorio y ningún flujo de dinero.**

Ese desequilibrio es el que la migración tiene que corregir, y el enfoque TDD lo vuelve obligatorio: en la app nueva **ninguna línea de código de producción se escribe antes que su prueba**.

---

## 1. Pirámide propuesta

| Nivel                   | Qué cubre                                                                                                           | Herramienta                                                                 | Criticidad               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------ |
| **Unitarias / dominio** | Huella de operación, clasificación de riesgo, validadores, formateadores, mapeadores DTO→modelo, política de sesión | Jest + ts-jest                                                              | **Máxima**               |
| **Contratos**           | Toda respuesta del backend validada contra un esquema Zod, con fixtures derivados de respuestas reales redactadas   | Zod + fixtures                                                              | **Máxima**               |
| **Integración**         | Repositorios contra servidor simulado: renovación de token, reintento, 4xx/5xx, cuerpo inválido, timeout            | Jest + MSW                                                                  | Alta                     |
| **Componentes**         | Pantallas y componentes en sus estados: cargando, vacío, error, sin conexión, éxito, bloqueado                      | React Native Testing Library                                                | Alta                     |
| **Módulos nativos**     | `DeviceKeyModule` y `SecureScreenModule`                                                                            | Pruebas instrumentadas de Android (JUnit + Espresso) sobre dispositivo real | **Máxima**               |
| **E2E**                 | Flujos completos sobre la app compilada                                                                             | Detox (D-11)                                                                | Alta en flujos de dinero |
| **Visual**              | Comparación contra línea base aprobada, con tolerancia explícita                                                    | Por definir en el Gate B                                                    | Media                    |

**Sobre el nivel de módulos nativos:** es el único que **no se puede probar en un emulador ni en CI convencional**, porque StrongBox y la biometría requieren hardware real. Las pruebas de firma se ejecutan en el Pixel conectado por USB, y su evidencia se archiva manualmente. Hay que aceptarlo como excepción documentada desde ahora, no descubrirlo en el Gate D.

## 2. Reglas de TDD

1. **Rojo → verde → refactor**, en ese orden y con evidencia del ciclo.
2. **Cada defecto encontrado durante la migración produce primero una prueba de regresión** que falla, y solo después la corrección. Esto aplica también a los defectos heredados de la app Flutter (por ejemplo, el PIN sin validar).
3. **Sin _snapshots_ amplios como sustituto de aserciones.** Un snapshot de 400 líneas que nadie lee no prueba nada y se aprueba a ciegas en cuanto cambia. Se permiten snapshots pequeños y deliberados.
4. **Los simulacros respetan el contrato real.** Un mock que devuelve la forma que le conviene al cliente oculta exactamente el error que hay que encontrar. Los fixtures se derivan de respuestas reales del backend, redactadas.
5. **Datos sintéticos siempre.** Nunca datos de clientes reales, ni siquiera en capturas. Cuentas, montos, nombres y documentos son generados y determinísticos.

## 3. Umbrales de cobertura por criticidad

Un porcentaje global único no garantiza nada: se alcanza cubriendo lo fácil. Se definen umbrales por zona:

| Zona                                                                | Cobertura mínima de líneas | Justificación                                                                          |
| ------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------- |
| `packages/bsc-shared/` (huella, riesgo, validadores, formateadores) | **100%**                   | Lógica pura, barata de cubrir, y un error aquí rechaza o autoriza dinero indebidamente |
| `src/core/security/`                                                | **95%**                    | Sesión, almacenamiento, puentes nativos                                                |
| `src/core/network/`                                                 | **95%**                    | Interceptor de autenticación, errores, pinning                                         |
| `src/features/*/domain/` y `data/`                                  | **85%**                    | Reglas y mapeo                                                                         |
| `src/features/*/ui/`                                                | **70%**                    | Estados de pantalla; el resto lo cubre E2E y visual                                    |
| `src/design-system/`                                                | **60%**                    | Presentación pura                                                                      |

**El pipeline falla si una zona baja de su umbral**, no solo si baja el promedio.

## 4. Escenarios transversales obligatorios

Se ejecutan en cada oleada, no solo al final:

**Sesión y acceso**

- Login correcto, credenciales incorrectas, usuario bloqueado.
- Expiración por inactividad: aviso, recuperación con actividad, expiración efectiva.
- Renovación de token exitosa; renovación fallida → cierre de sesión.
- Revocación desde otro dispositivo (`logout-all`).
- Reanudación de la app tras estar en segundo plano.

**Red**

- Pérdida de conexión a mitad de una operación.
- Conexión intermitente.
- Respuestas 400, 401, 403, 404, 409, 422, 500, 502, 503.
- Cuerpo de respuesta inválido o incompleto.
- Timeout de 30 s.

**Dinero — los más importantes**

- Doble toque en «confirmar»: **no debe producir dos transferencias**.
- Reintento tras error de red: **no debe duplicar la operación** (depende de C-01, idempotencia).
- Operación alterada entre confirmación y ejecución → rechazo por huella.
- Firma cancelada por el cliente → sin ejecución, sin caída automática a código por SMS.
- Llave invalidada por cambio biométrico → se pide re-enrolar, no se firma.
- Operación que escala a `elevated` por monto, por beneficiario nuevo, por moneda extranjera y por enfriamiento del dispositivo.

**Plataforma**

- Instalación limpia, actualización sobre versión anterior, y vuelta atrás.
- Pantallas pequeñas y grandes; fuente ampliada del sistema.
- Accesibilidad: lector de pantalla y contraste en los flujos críticos.
- Permisos denegados.
- Cambio de ambiente: **solo posible en compilaciones de desarrollo**, imposible en release.

**Seguridad**

- Ningún dato sensible en los registros (prueba automática que busca patrones de cuenta, monto y documento en la salida).
- Captura de pantalla bloqueada donde corresponde.
- Sin datos sensibles en la vista previa del conmutador de apps.

## 5. Ambientes y datos

| Ambiente                   | Uso                                 | Notas                                                                                                   |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Local con simulacros (MSW) | Unitarias, integración, componentes | Sin red real; determinístico                                                                            |
| Backend de desarrollo      | E2E manual y automatizado           | Hoy `http://<IP interna del banco>:5000`; desde el Pixel se alcanza con `adb reverse tcp:5000 tcp:5000` |
| Piloto                     | Validación con usuarios internos    | ❓ Pendiente de definir (P-08)                                                                          |

**Datos de prueba:** existe un cliente de prueba conocido por el equipo. Su identificador **no se escribe en estos documentos ni en el código**; vive en la configuración local de cada desarrollador. Los fixtures del repositorio son sintéticos.

## 6. Comando orquestador `verify`

Un solo comando, con código de salida distinto de cero ante cualquier incumplimiento. Se define en el Gate B y se implementa antes de la primera oleada, no al final:

```
npm run verify
├── install:check      instalación reproducible; lockfile sin cambios
├── format:check       Prettier
├── lint               ESLint
├── typecheck          tsc --noEmit, modo estricto
├── test:unit          Jest, con umbrales por zona
├── test:contract      validación de esquemas contra fixtures
├── test:component     React Native Testing Library
├── build:android      compilación limpia de release
├── build:ios          solo si iOS entra en alcance (P-02)
├── secrets:scan       gitleaks sobre código y bundle compilado
├── sast               análisis estático de seguridad
├── sca                vulnerabilidades de dependencias
├── licenses           licencias permitidas
├── sbom               generación de SBOM
├── config:verify      sin cleartext, sin endpoints de desarrollo, sin banderas inseguras en release
└── report             informe consolidado con fecha, commit y versiones de herramientas
```

Lo que **no** puede entrar en `verify` porque necesita hardware real, y se ejecuta y archiva aparte: pruebas de StrongBox, biometría y `FLAG_SECURE`.

## 7. Verificación por pantalla

Cada superficie del catálogo `03` necesita, antes de darse por migrada:

| Comprobación                                                             | Cómo                                                                             |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Estados: cargando, vacío, error, sin conexión, timeout, éxito, bloqueado | Prueba de componente con simulacros                                              |
| Navegación hacia adelante y botón atrás de Android                       | E2E                                                                              |
| Teclado: no tapa campos, se cierra correctamente                         | E2E + revisión manual                                                            |
| Recuperación tras segundo plano                                          | E2E                                                                              |
| Fuente ampliada y contraste                                              | Revisión manual con evidencia archivada                                          |
| Paridad visual contra la línea base                                      | Comparación visual con tolerancia explícita y revisión humana de cada diferencia |

**Sobre la comparación visual:** una diferencia detectada **nunca se aprueba automáticamente**. React Native usa controles nativos y Flutter dibuja los suyos, así que habrá diferencias legítimas de renderizado de texto y sombras. La tolerancia se fija tras medir las primeras pantallas y se documenta; cada diferencia fuera de tolerancia se revisa y se acepta o se corrige, con registro.
