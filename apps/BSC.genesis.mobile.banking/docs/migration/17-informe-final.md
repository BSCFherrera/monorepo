# Informe final de la migración

**De:** `BSC.MobileApp` (Flutter) · **A:** `BSC.MobileAppRN` (React Native)
**Fecha:** 2026-09-17 (segunda versión, tras la validación en dispositivo)
**Para:** arquitectura, seguridad y áreas funcionales

---

## 1. En una página

El banco decidió por política de empresa unificar el desarrollo móvil en React
Native. La aplicación Flutter **nunca estuvo en producción**, así que no había
clientes que migrar: el encargo era reescribir la aplicación conservando el
diseño exacto y el comportamiento, sin tocar el backend.

**El porte está funcionalmente completo.** Las trece features del original están
escritas, con 844 pruebas automáticas en verde, y la aplicación compila y corre
en un teléfono real.

**No es publicable todavía, y lo que falta no es código.** Son **cinco
decisiones del banco** —firma, certificados, URL del backend y el interruptor de
autorización en dos canales— más una tarde de verificaciones con el teléfono
conectado.

Por el camino aparecieron **nueve defectos en el original** que el porte corrige
o documenta. El más serio: la aplicación Flutter generaba códigos de segundo
factor que el servidor del banco **rechaza**, porque usaba una librería en un
modo que no cumple el estándar.

---

## 2. Qué se construyó

|                                | Flutter (original) | React Native (porte) |
| ------------------------------ | -----------------: | -------------------: |
| Líneas de código de aplicación |             29.671 |               33.809 |
| Líneas de pruebas              |                  — |               10.774 |
| Pruebas automáticas            |                  — |              **844** |
| Dependencias de terceros       |                 31 |               **12** |
| Módulos nativos propios        |                  1 |                **6** |

**Las cifras piden tres aclaraciones**, porque leídas solas engañan.

**Por qué el porte tiene más líneas con la misma funcionalidad.** Dart escribe
una pantalla en menos líneas que TypeScript con React: el lenguaje tiene azúcar
sintáctico para construir interfaces que JavaScript no tiene. Además el porte
hace cosas que el original no hacía —validar las respuestas del backend, redactar
los registros, calcular la huella sobre el cuerpo real—. La comparación honesta
no es línea contra línea sino **pantalla contra pantalla**, y ahí son las mismas.

**Por qué bajan las dependencias de 31 a 12.** Ocho de las del original estaban
declaradas y no se usaban. Otras se sustituyeron por módulos nativos propios,
cortos y auditables: la detección de dispositivo comprometido, por ejemplo, son
unas decenas de líneas de Kotlin en lugar de una librería de terceros con su
propio ciclo de actualizaciones. Cada dependencia que entra es superficie de
ataque y trabajo de mantenimiento; cada una que sale, al revés.

**Qué es un «módulo nativo propio».** React Native escribe la interfaz en
TypeScript, pero hay cosas que solo sabe hacer Android: guardar una llave en el
chip de seguridad, pedir la huella dactilar, impedir capturas de pantalla. Un
módulo nativo es una pieza de Kotlin que expone esa capacidad a la parte
TypeScript. El porte tiene seis, todos de seguridad, todos escritos por el
equipo y **legibles en una sentada**, que es precisamente lo que una auditoría
bancaria pide y una librería de terceros no da.

---

## 3. Lo que el porte corrige del original

Estos nueve no son mejoras de estilo. Son cosas que estaban mal y que solo se
ven leyendo el código del original línea a línea, que es lo que exigió el método
de trabajo: **nada de traducción mecánica archivo por archivo**.

|     | Qué estaba mal en Flutter                                                                                                                                                                    | Qué pasa en el porte                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Los códigos del segundo factor no los acepta el servidor.** El original usaba la librería `otp` en un modo que no cumple el estándar RFC 6238; el servicio TokenBSC del banco sí lo cumple | Implementación propia y estándar. El modo defectuoso quedó escrito **como documentación ejecutable** del defecto, con su prueba |
| 2   | **El PIN no validaba nada.** `pin_screen.dart:42` aceptaba cualquier cosa                                                                                                                    | Valida de verdad                                                                                                                |
| 3   | **El certificate pinning era un método vacío.** Parecía que existía                                                                                                                          | Andamiaje real, documentado, a la espera de las huellas del banco (D-02)                                                        |
| 4   | **La dirección interna del banco escrita en el código** como respaldo. Una compilación mal configurada apuntaba en silencio a un servidor de desarrollo                                      | La URL se inyecta en compilación, y si falta **la app falla al arrancar** en vez de conectarse a donde no debe                  |
| 5   | **La release se firmaba con la llave de depuración**, que es pública                                                                                                                         | Lee un almacén externo; si no lo encuentra, `npm run verify` lo reporta                                                         |
| 6   | **El identificador de la plantilla** (`com.example.…`)                                                                                                                                       | Identificador propio, y una comprobación automática que lo vigila                                                               |
| 7   | **La huella de la operación se calculaba sobre el estado de la pantalla**, no sobre lo que se enviaba                                                                                        | Se deriva **del cuerpo que se envía**, verificado contra lo que el backend calcula                                              |
| 8   | **Los respaldos de Android podían llevarse datos de la app** a la nube del cliente                                                                                                           | Desactivados, y fijado por una prueba                                                                                           |
| 9   | **El selector de tipo de documento se escondía sin decirlo** cuando el catálogo venía vacío, y el alta mandaba siempre cédula                                                                | Sigue el mismo comportamiento, pero **está registrado** como D-07 en vez de ser invisible                                       |

**El primero merece una frase aparte.** La aplicación Flutter mostraba al cliente
un código de seis dígitos que, al teclearlo, el servidor rechazaba. No es un
defecto cosmético: es una función de seguridad que no funcionaba, y no se habría
descubierto sin abrir el código del servicio TokenBSC para compararlo. Salió de
la regla de trabajo de **leer siempre el manejador del backend, no solo el
contrato**, porque es el manejador el que descubre los muñones.

---

## 4. Lo que falta, y de quién depende

### Lo que añadió la validación en dispositivo

Una sesión con el teléfono conectado cerró **doce de las diecisiete
verificaciones** y encontró **seis defectos en el porte y cinco muñones nuevos
del backend**. El más grave era de dinero y **afecta también al portal en
producción**:

**Una transferencia de RD$ 100.00 acreditaba RD$ 100.15 al beneficiario y
debitaba RD$ 100.30.** El canal enviaba el total con el impuesto incluido; el
core calcula el impuesto por su cuenta y lo cobra en un movimiento aparte, así
que entendía el total como el monto a transferir. En una transferencia a un
tercero, el cliente le manda más dinero del que escribió. **El portal Nuxt hace
exactamente lo mismo y está en producción** (D-19); su pantalla no lo delata
porque calcula el saldo nuevo en el cliente y siempre cuadra consigo misma.

Los otros cuatro muñones del backend, todos escalados y ninguno tocado:
`POST /beneficiaries/confirm` **no valida el segundo factor** y aceptó el código
`000000` (D-20); `POST /devices/register` **no genera ni envía ningún código**
de enrolamiento (D-21); el **escalón presencial del primer dispositivo** no lo
puede satisfacer ninguna pantalla del móvil (D-22); y **un dispositivo revocado
no puede volver a registrarse nunca** (D-23), lo que convierte el mecanismo de
vuelta atrás del piloto en un billete de ida. A ellos se suma D-24: el servicio
de comisiones **rechaza todos los pagos** porque exige un documento que la
aplicación no tiene, y el porte enseñaba entonces comisión e impuesto en cero.

**Lo que esto dice del método.** Ninguno de estos once hallazgos aparece en el
navegador ni en una suite de pruebas: todos salieron de mover dinero real y
mirar después el saldo de las dos cuentas. La cifra del comprobante no sirve
como verificación, porque la calcula el propio cliente.

### Cinco decisiones del banco — bloquean la publicación

|          | Decisión                                            | Consecuencia de no tomarla                                                                                                 |
| -------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **D-03** | Custodia del almacén de claves de release           | No hay APK firmado. **Un almacén perdido = no se puede volver a publicar nunca**, porque las tiendas exigen la misma clave |
| **D-18** | La URL del backend por ambiente y cómo se inyecta   | El APK de release **no habla con ningún backend**                                                                          |
| **D-02** | Las huellas del certificado del banco y su rotación | La app acepta el certificado de cualquier proxy corporativo                                                                |
| **D-04** | Encender `Enforce` en el guardián de transacciones  | **Hoy una operación sin autorización válida se ejecuta igual** y solo queda anotada                                        |
| **D-01** | Corregir la huella de operación en el portal Nuxt   | Encender D-04 con el portal sin corregir **rompe toda transferencia del portal que cruce monedas**                         |

**D-01 y D-04 son la pareja peligrosa de este proyecto.** El teléfono ya está
alineado con el backend; el portal firma la moneda del destino donde el backend
usa la del origen. El mismo interruptor que protege al teléfono rompe al portal.
Van juntas, y en ese orden.

**D-04 es, además, la que hace que todo esto sirva de algo.** Mientras esté
apagada, el trabajo de autorización de operaciones —la firma con la llave del
teléfono, la huella, la biometría— está construido y **no protege nada**, porque
el servidor no exige que sea válido. Es la peor forma de que un defecto
sobreviva: todo _parece_ funcionar.

### Diecisiete verificaciones en dispositivo — una tarde de trabajo

V-01…V-17. Están construidas y probadas, pero no vistas en un teléfono: que el
cifrado del almacenamiento seguro funcione de verdad, que la biometría cancelada
no muestre un banner indebido, que una actualización conserve el enrolamiento.
No son decisiones ni desarrollo nuevo: es tiempo con el Pixel conectado.

### Siete validaciones funcionales — de negocio y cumplimiento

Desde qué nombre debe saludar el dashboard hasta qué se considera dato personal
a efectos de los registros. Ninguna bloquea el desarrollo; varias bloquean el
piloto.

### Lo que se dejó fuera, y se dice

- **iOS entero** (P-13). No hay ni un módulo nativo escrito. Es desarrollo nuevo,
  no portado: el chip de seguridad de Apple funciona distinto.
- **El pago a la tarjeta de un tercero** (D-05). El endpoint existe y **devuelve
  éxito sin llamar al core**: la llamada está comentada bajo un
  `//TODO : HACER TRANSFERENCIA INTERBANCARIA`, y sigue igual en la rama más
  reciente del backend. Conectarlo le diría al cliente que pagó sin mover un peso.
- **El código del token suave** (D-06). El backend no devuelve el secreto, así
  que la pantalla no puede mostrar nada. **Tampoco en el original.**
- **Pruebas de componentes, E2E y validación por esquemas** (D-14). Las tres
  exigen dependencias nuevas, y la política de librerías está sin fijar.
- **CI, SAST y escaneo de secretos del sector** (D-15). Hoy hay un escáner
  propio: cubre el caso conocido, no sustituye a una herramienta madura.
- **Telemetría y reporte de fallos.** No hay ninguna. Sin ella **no se puede
  medir el piloto**.

---

## 5. Cómo se trabajó, y por qué importa

Tres reglas explican casi todos los hallazgos de este informe.

**No se tradujo archivo por archivo; se migró el comportamiento.** Para cada
pantalla se leyó el widget Dart completo y se copiaron las medidas que el
original escribe a mano. Portar los tokens de diseño no basta: el original tiene
márgenes escritos a mano que no salen de ningún token, y son los que hacen que
una pantalla se vea igual o no.

**Antes de portar una llamada al backend se abría el manejador, no solo el
contrato.** El controlador y el DTO dicen qué forma tiene la petición; **el
manejador dice si hace algo**. Así aparecieron los muñones: endpoints que
devuelven éxito sin llamar al core.

**Lo que mueve dinero calcula su huella sobre el cuerpo que se envía**, nunca
sobre el estado de la pantalla, y con una prueba que replica el cálculo de C#
como oráculo. Las tres huellas canónicas se verificaron contra el backend
levantado **sin mover dinero**: enviando operaciones con cuentas inexistentes,
de modo que el guardián registre la cadena y el manejador después las rechace.

**Los errores que cuestan una sesión también se documentaron**, porque el
siguiente que los sufra merece encontrarlos escritos: que `adb install -r` mata
la app que instala y devuelve el foco a la anterior —lo que produjo una tanda
entera de capturas falsas con una paridad imposible del 0,00%—; que
`uiautomator dump` funciona para React Native y no para Flutter; que el
enrolamiento devuelve 409 si el servicio TokenBSC no está levantado, sin decir
por qué.

---

## 6. Recomendación

**Cerrar las cinco decisiones y las diecisiete verificaciones, y salir a un
piloto interno.** El detalle está en
[`16-plan-de-piloto-y-vuelta-atras.md`](./16-plan-de-piloto-y-vuelta-atras.md);
el resumen es que la vuelta atrás aquí es barata, porque el canal que los
clientes usan hoy —el portal— no se toca y no hay nada que revertir en la base
de datos.

**Antes del piloto hacen falta dos cosas que hoy no existen** y no son
decisiones sino trabajo: telemetría, porque sin ella el piloto no se puede
medir, y ejercitar la revocación de dispositivos, porque es el único mecanismo
de vuelta atrás que actúa en minutos y **nunca se ha probado**.

**Y una advertencia que conviene no suavizar:** publicar con `Enforce` apagado es
publicar sin la protección que justifica todo el trabajo de autorización de
operaciones. Si hay que elegir un solo punto de esta lista para defender en una
reunión, es ese.

---

## Índice de los documentos de la migración

|                                             |                                                          |
| ------------------------------------------- | -------------------------------------------------------- |
| [00](./00-executive-summary.md)             | Resumen ejecutivo                                        |
| [01](./01-as-is-inventory.md)               | Inventario del original                                  |
| [02](./02-functional-spec.md)               | Especificación funcional                                 |
| [03](./03-screen-flow-catalog.md)           | Catálogo de pantallas                                    |
| [04](./04-api-integration-contract.md)      | Contrato de integración                                  |
| [05](./05-target-architecture.md)           | Arquitectura objetivo                                    |
| [06](./06-security-threat-model.md)         | Modelo de amenazas                                       |
| [07](./07-test-strategy.md)                 | Estrategia de pruebas                                    |
| [08](./08-migration-plan.md)                | Plan de migración                                        |
| [09](./09-traceability-matrix.md)           | Matriz de trazabilidad                                   |
| [10](./10-definition-of-done.md)            | Definición de listo y terminado                          |
| [11](./11-open-questions.md)                | Preguntas abiertas                                       |
| [12](./12-risk-register.md)                 | Registro de riesgos                                      |
| [13](./13-pendientes.md)                    | **Pendientes: decisiones, verificaciones, validaciones** |
| [14](./14-revision-mastg.md)                | Revisión MASTG                                           |
| [15](./15-runbooks.md)                      | Runbooks operativos                                      |
| [16](./16-plan-de-piloto-y-vuelta-atras.md) | Plan de piloto y vuelta atrás                            |
| 17                                          | Este informe                                             |
