# 11 — Preguntas abiertas y decisiones

**Estados:** `Abierta` · `Respondida` · `Cerrada`
**Prioridad:** 🔴 bloqueante para el Gate A · 🟠 bloqueante para el Gate B · 🟡 bloqueante para una oleada · ⚪ informativa

---

## ✅ P-01 — Reversión de la decisión de stack · **RESPONDIDA** · 2026-09-16

**Respuesta:** _«Hemos tomado la decisión de utilizar React Native por políticas de la empresa.»_

**Efecto:** la justificación es **institucional, no técnica**. Se registra así en `adr/0001`, que pasa a estado **Aceptado** y supersede a `ANALISIS-STACK-TECNOLOGICO.md` §1.1. No se construye una argumentación técnica a posteriori.

**Lo que sigue abierto por consecuencia:** las amenazas T-07 (bundle de JavaScript) y T-15 (cadena de suministro npm) siguen siendo reales y **requieren aceptación formal de seguridad en el Gate B**. La política de empresa fija el framework; no acepta por sí sola el riesgo residual. → ver P-14.

**Estado:** Cerrada.

---

## ✅ P-02 — Alcance de iOS · **RESPONDIDA** · 2026-09-16

**Respuesta:** _«Así es, es parte del alcance.»_

**Efecto:**

- Estimación: **144 → ~195 puntos** (+35%).
- `adr/0003-paridad-de-firma-en-ios.md` creado: el módulo de firma para iOS es **desarrollo nuevo en Swift**, no portado. El Secure Enclave alcanza paridad en todas las garantías salvo una (no expone el nivel de respaldo de la llave); la opción recomendada resuelve esa brecha sin tocar el backend.
- La oleada 0 ya no cierra con Android: exige **firma verificada en un iPhone físico**.
- D-01 (Community CLI vs Expo) se refuerza hacia **Community CLI**: ahora hay módulos nativos propios en dos plataformas.

**Estado:** Cerrada, pero abre P-13, que es bloqueante.

---

## ✅ P-03 — Contrato del backend · **RESPONDIDA** · 2026-09-16

**Respuesta:** _«Hoy en día la aplicación funciona consumiendo los contratos que están en el backend. Debemos garantizar el correcto funcionamiento.»_

**Interpretación:** **el backend no se modifica.** El contrato existente es la referencia y la app nueva debe funcionar contra él tal como está.

**Hallazgo posterior que facilita el trabajo:** el backend **sí expone Swagger**. `Program.cs` registra `AddSwaggerGen` con Swashbuckle 6.5.0 y lo sirve en la raíz (`/swagger/v1/swagger.json`) **en todos los ambientes**. No hay archivo OpenAPI versionado en el repositorio, pero se puede extraer levantando la API. Se versionará una copia con fecha y commit dentro de `BSC.MobileAppRN` como referencia congelada.

**Procedimiento acordado:**

1. Levantar el backend y descargar `swagger.json`; versionarlo con su commit.
2. Generar tipos TypeScript y esquemas de validación a partir de él.
3. Validar cada respuesta contra su esquema en el borde del cliente, de modo que un desajuste falle con un mensaje claro.
4. Pruebas de contrato con fixtures derivados de respuestas reales redactadas.

**Consecuencia que hay que resolver → P-15:** «no modificar el backend» significa que **las carencias del contrato hay que mitigarlas del lado cliente**. La más grave es la ausencia de idempotencia.

**Estado:** Cerrada.

---

## ✅ P-04 — Capacidades declaradas pero no implementadas · **RESPONDIDA** · 2026-09-16

**Respuesta:** _«Esto es un feature que trabajaremos después de la migración a React Native.»_

**Efecto: paridad estricta.** Las cinco capacidades quedan **fuera del alcance** de la migración: notificaciones push, detección de red, lector de QR, gráficos y reporte de fallos. La app nueva hace exactamente lo que hace la actual, ni más ni menos.

**Interpretación aplicada, incluidas las dos que yo había recomendado incluir:**

- **Reporte de fallos (capacidad 5):** mi argumento a favor era que sacar a piloto una app sin visibilidad de errores es ciego. **Ese argumento se cae**: la app Flutter nunca llegó a producción, así que no hay clientes reales a los que dejar sin soporte. Diferirlo es razonable.
- **Detección de red (capacidad 2):** se difiere la librería dedicada. Los fallos de red **se siguen manejando**: el cliente HTTP los distingue de los errores del servidor y cada pantalla tendrá su estado de error, igual que hoy. Lo que no habrá es un indicador de «sin conexión» que reaccione al instante.

**Consecuencia operativa:** las 8 dependencias declaradas y nunca usadas en `pubspec.yaml` **no se trasladan** al `package.json` de la app nueva. El proyecto arranca sin dependencias muertas.

**Estado:** Cerrada. Estimación vuelve a **~195 puntos** (no sube a 203).

### Registro de la pregunta original, para cuando se retomen

<details>
<summary>Detalle de las cinco capacidades, tal como se presentó para la decisión</summary>

### Qué se encontró y por qué hay que preguntarlo

El archivo `pubspec.yaml` de la app Flutter es la lista de librerías que el proyecto declara usar — el equivalente exacto del `package.json` del portal. Esa lista incluye librerías para notificaciones push, detección de red, lectura de códigos QR y gráficos.

Al revisar el código se comprobó que **ninguna de esas librerías se llama desde ningún archivo**. Están declaradas pero no se usan: son una intención que no se llegó a construir.

Eso significa que **la app que está instalada hoy no hace esas cuatro cosas**. La pregunta es qué hacer con ellas al reconstruir la app, porque las tres opciones cuestan distinto:

- **Migrar** una capacidad = reescribir algo que ya funciona y se puede comparar contra la app actual para saber si quedó bien.
- **Construir** una capacidad = diseñarla desde cero, decidir cómo se comporta, y no tener contra qué compararla.

Mezclar ambas cosas tiene un costo oculto: cuando aparece un fallo, nadie sabe si vino de la migración o de lo nuevo.

### Capacidad 1 — Notificaciones push

**Qué sería:** que el banco pueda enviar un aviso al teléfono del cliente aunque la app esté cerrada. Por ejemplo, avisar de una transferencia recibida o de que se acaba de enrolar un dispositivo nuevo.

**Qué hay hoy:** nada en la app. Las librerías de Firebase están declaradas pero no se usan, y falta el archivo de configuración (`google-services.json`) que Firebase necesita para funcionar. El backend tiene un `NotificationController`, pero al revisarlo envía **correos y plantillas**, no avisos al teléfono.

**Qué costaría incluirla:** es la más cara de las cuatro, porque no es solo trabajo de la app:

- Cuenta de Firebase del banco, y su equivalente de Apple para iPhone.
- Trabajo del lado del backend para registrar los teléfonos y enviar los avisos — y eso **choca con la decisión de P-03 de no modificar el backend**.
- Definir qué se notifica, con qué texto, y qué información puede ir en el aviso (un push se ve en la pantalla bloqueada: **no puede llevar montos ni números de cuenta**).
- Manejo de permisos: en Android 13+ y en iOS el cliente debe autorizar las notificaciones explícitamente.

**Recomendación: dejarla fuera de esta migración** y tratarla como un proyecto propio después. Si el banco la quiere pronto, conviene planificarla en paralelo pero no dentro del mismo alcance.

---

### Capacidad 2 — Modo sin conexión / detección de red

**Qué sería:** que la app note cuándo el teléfono se queda sin internet y se lo diga al cliente con un mensaje claro, en lugar de que la pantalla se quede cargando hasta que pasen los 30 segundos de espera y salga un error genérico.

**Qué hay hoy:** la librería que detecta el estado de la red está declarada y no se usa. Hoy, si el cliente pierde la señal en medio de una transferencia, ve un error técnico después de medio minuto de espera.

**Aclaración importante:** esto **no** es «que la app funcione sin internet». Ver saldos sin conexión exigiría guardar datos financieros en el teléfono, y eso es una decisión de seguridad seria que no conviene tomar de pasada. Aquí se trata solo de **detectar y avisar**.

**Qué costaría incluirla:** poco. Es una de las diferencias más visibles entre una app que se siente sólida y una que no, y el propio catálogo de pantallas lo exige: cada pantalla necesita un estado «sin conexión» definido.

**Recomendación: incluirla, en su versión de detectar y avisar.** Es barata, mejora la percepción de calidad de forma inmediata, y no implica guardar ningún dato sensible en el teléfono.

---

### Capacidad 3 — Lectura de códigos QR

**Qué sería:** usar la cámara para leer un código QR — por ejemplo, para pagar a un comercio o para cargar los datos de un beneficiario sin escribirlos.

**Qué hay hoy:** la librería está declarada y no se usa. No existe ninguna pantalla que abra la cámara.

**Qué costaría incluirla:** trabajo moderado en la app, pero la pregunta real no es técnica: **¿para qué se usaría el QR?** Si no hay un flujo de negocio definido —qué contiene el código, quién lo genera, cómo se valida— construir el lector no sirve de nada. Además requiere pedir permiso de cámara, lo que añade una fricción que hay que justificar.

**Recomendación: dejarla fuera**, salvo que ya exista un caso de uso aprobado por negocio. Si lo hay, se especifica aparte.

---

### Capacidad 4 — Gráficos

**Qué sería:** mostrar información en forma de gráfico — por ejemplo, un gráfico de barras con los gastos del mes por categoría.

**Qué hay hoy:** la librería de gráficos está declarada y no se usa. Sin embargo, sí existe en el diseño una **paleta de 6 colores preparada para gráficos** (`BscColors.categorical`), lo que sugiere que estuvo planificado.

**Qué costaría incluirla:** moderado en la app, pero antes hay que resolver **de dónde salen los datos**. Un gráfico de gastos por categoría necesita que alguien clasifique cada movimiento en una categoría, y hoy no hay evidencia de que el backend lo haga. Sin esa clasificación no hay gráfico posible.

**Recomendación: dejarla fuera** de esta migración.

---

### Capacidad 5 — Observabilidad (esta no estaba en la pregunta original, pero debería)

**Qué sería:** que cuando la app falle en el teléfono de un cliente, el equipo se entere — con el detalle de dónde falló y en qué versión — en lugar de depender de que el cliente llame a llamar al banco.

**Qué hay hoy:** **nada.** La app solo imprime mensajes por consola cuando un desarrollador la tiene conectada. En producción, un fallo es invisible.

**Qué costaría incluirla:** bajo. Lo que hay que cuidar es la **redacción de datos sensibles**: ningún reporte de error puede llevar montos, números de cuenta, nombres ni documentos de identidad. Eso se resuelve filtrando en el origen, antes de que el dato salga del teléfono.

**Recomendación: incluirla, sin excepción.** Sacar a piloto una app recién reconstruida sin forma de saber si está fallando es el riesgo más innecesario del proyecto.

---

### 📋 Lo que hay que decidir

| #   | Capacidad                                  | ¿Existe hoy? | Recomendación                        | Impacto en el esfuerzo          |
| --- | ------------------------------------------ | ------------ | ------------------------------------ | ------------------------------- |
| 1   | Notificaciones push                        | No           | ❌ Fuera — proyecto aparte           | +13 puntos y trabajo de backend |
| 2   | Detección de red y aviso de «sin conexión» | No           | ✅ **Dentro**                        | +3 puntos                       |
| 3   | Lector de códigos QR                       | No           | ❌ Fuera, salvo caso de uso aprobado | +8 puntos                       |
| 4   | Gráficos                                   | No           | ❌ Fuera — falta el dato de origen   | +8 puntos y trabajo de backend  |
| 5   | Observabilidad (reporte de fallos)         | No           | ✅ **Dentro, sin excepción**         | +5 puntos                       |

**Si se aceptan las recomendaciones, el alcance sube de ~195 a ~203 puntos.** Si se incluye todo, sube a ~232 y aparecen dependencias de backend que contradicen P-03.

</details>

---

## ⚠️ P-13 — Equipo macOS, cuenta de Apple y iPhone de prueba · **RESPONDIDA CON CONSECUENCIA** · 2026-09-16

**Respuesta:** _«De acuerdo, esto lo haremos luego de la migración.»_

**Consecuencia que hay que dejar por escrito, porque no es obvia:**

iOS está **en el alcance** (P-02), pero el equipo macOS llega **después** de la migración (P-13). Ambas cosas no pueden cumplirse a la vez en el mismo período, y no es una cuestión de organización sino de cómo funciona la plataforma de Apple:

| Sin Mac no se puede…                     | Motivo                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| Compilar la app de iPhone                | Xcode solo existe en macOS                                              |
| Instalar las dependencias nativas de iOS | CocoaPods requiere macOS                                                |
| Ejecutar una sola prueba en iPhone       | No hay forma de producir el binario                                     |
| Firmar o publicar en App Store           | El proceso de firma es exclusivo de macOS                               |
| Probar el Secure Enclave y la biometría  | **Ni siquiera con Mac basta el simulador: hace falta un iPhone físico** |

**Cómo se procede, en consecuencia:**

1. **Todo el trabajo se hace preparado para las dos plataformas.** La arquitectura, la navegación, el sistema de diseño, la lógica compartida y los contratos son independientes de plataforma por construcción. No hay atajos «solo Android» que después haya que deshacer.
2. **El módulo de firma para iOS se escribe en Swift** siguiendo `adr/0003`, con la misma superficie de métodos que el de Android. Queda en el repositorio, listo.
3. **Ese código queda sin verificar** hasta que exista el Mac y el iPhone. Se marca explícitamente como tal en la matriz de trazabilidad: escrito ≠ verificado.
4. **Solo Android puede cerrar el Gate C y el Gate D** durante este proyecto. iOS cierra en una fase posterior, cuando llegue el equipo.

**Esfuerzo:** de los ~50 puntos de iOS, se ejecutan ahora ~8 (escribir el módulo Swift y mantener la arquitectura multiplataforma). Los ~42 restantes —paridad visual en iPhone, proyecto iOS, firma, CI, App Store y pruebas en dispositivo— quedan para la fase posterior.

**Alcance ejecutable ahora: ~153 puntos.**

**Estado:** Cerrada, con la limitación registrada como riesgo R-08.

---

## 📁 P-13-bis — Cuenta de Apple Developer e iPhone de prueba (cuando se retome)

Al retomar iOS harán falta: cuenta de Apple Developer del banco (Enterprise u Organization), perfiles de aprovisionamiento y certificados de distribución, un iPhone físico con Face ID o Touch ID, y la versión mínima de iOS a soportar (sugerido iOS 15+). Ninguno bloquea hoy.

**Decisión:** ¿Quién provee el equipo macOS, la cuenta de Apple Developer del banco y el iPhone físico de pruebas, y para cuándo?

**Evidencia:** iOS entró en alcance (P-02). Sin macOS con Xcode **no se puede compilar, ni firmar, ni publicar** una app de iPhone: no es una limitación evitable, es cómo funciona la plataforma de Apple. En la máquina de trabajo actual no hay macOS, Xcode, Ruby ni CocoaPods. Además, **el Secure Enclave y la biometría no se pueden probar en el simulador**: hace falta un iPhone real.

**Opciones:**

- **A. Mac físico** asignado al equipo (Mac mini es suficiente y es la opción más económica).
- **B. Mac en la nube** (MacStadium, servicio equivalente) para compilación y CI. ⚠️ Requiere aprobación de seguridad: el código fuente y las llaves de firma saldrían de la red del banco.
- **C. Mac compartido** con otra área.

**Recomendación: A.** El plazo aquí es **administrativo, no técnico** — compra, aprobación, aprovisionamiento —, así que es lo primero que conviene poner en marcha, en paralelo con la oleada 0 de Android. Si se retrasa, bloquea el cierre de la oleada 0 completa.

**Bloquea:** cierre de la oleada 0 y todo el trabajo de iOS.

---

## 🟠 P-14 — Aceptación formal de las amenazas que introduce React Native

**Decisión:** ¿quién firma que el banco acepta dos riesgos nuevos que antes no tenía, y con qué medidas a cambio?

### Explicado sin términos técnicos

Cuando se eligió Flutter, el documento de análisis dio tres razones. Dos de ellas eran de seguridad, y **siguen siendo ciertas**: no dejan de serlo porque la decisión haya cambiado. Cambiar de framework trae dos riesgos que con Flutter no existían.

**Riesgo 1 — El código de la app queda más a la vista.**

Flutter convierte todo el código a lenguaje de máquina antes de instalar la app. Lo que queda en el teléfono es un bloque binario: alguien que descargue el APK y lo abra ve instrucciones de procesador, no el programa.

React Native no funciona así. Buena parte de la app viaja como un paquete de JavaScript compilado que se ejecuta dentro del teléfono. Está compactado y es difícil de leer —no es el código fuente tal cual—, pero **es sensiblemente más accesible que un binario**. Quien tenga el teléfono y conocimientos puede estudiar cómo funciona la app por dentro con bastante menos esfuerzo que antes.

_Qué NO significa:_ no significa que puedan robar dinero. La llave que firma las transacciones vive en el chip de seguridad del teléfono y no se puede leer ni desde el código de la app; la verificación biométrica la exige el sistema operativo, no una instrucción del programa. Nada de eso cambia.

_Qué SÍ significa:_ es más fácil estudiar la app para encontrar debilidades, y más fácil intentar modificarla para distribuir una versión alterada.

_Qué se hace al respecto:_ compactar y ofuscar el paquete, quitar todo rastro de diagnóstico de la versión de producción, verificar la firma de la app al arrancar, y —la más importante— **no poner ninguna decisión de seguridad en ese código**. El backend decide qué se autoriza; la app solo presenta y firma.

**Riesgo 2 — Se depende de mucho más código de terceros.**

Toda app moderna usa librerías escritas por otros. La diferencia es de escala: el ecosistema de Flutter es más pequeño y más controlado; el de JavaScript, del que React Native depende, es enormemente mayor y tiene un historial más frecuente de casos en los que alguien logró introducir código malicioso en una librería popular, que luego se instala sola en miles de proyectos.

_Qué se hace al respecto:_ fijar versiones exactas de todo, revisar automáticamente si alguna tiene vulnerabilidades conocidas, mantener una lista publicada de todo lo que la app usa, justificar cada librería que se agregue, y **no usar ninguna librería de terceros en la parte que firma las transacciones** — por eso el módulo de la llave y el cálculo de la huella se escribieron a mano.

### Qué se pide concretamente

Que el área de seguridad del banco **lea y firme** la sección 5 de [`06-security-threat-model.md`](06-security-threat-model.md), donde estos dos riesgos están descritos con su detalle técnico, junto con las medidas compensatorias.

**No es un trámite.** Es la diferencia entre «el banco decidió cambiar de framework y asumió conscientemente estos dos riesgos con estas medidas» y «nadie se dio cuenta». Si el día de mañana hay una auditoría, lo primero que se preguntará es quién evaluó el cambio de postura de seguridad.

**Por qué conviene ahora y no al final:** si seguridad exige controles adicionales —por ejemplo, detección de manipulación de la app, o una herramienta concreta de protección del código—, eso cambia el trabajo de la oleada 9 y parte de la arquitectura. Saberlo antes cuesta una reunión; saberlo después cuesta rehacer.

**Bloquea:** Gate B.

---

## 🟠 P-15 — Idempotencia en las operaciones que mueven dinero · **NUEVA — importante**

**Decisión:** si el backend no puede modificarse (P-03), ¿cómo se evita que un cliente ejecute dos veces la misma transferencia?

**Evidencia:** una búsqueda en todo el código del backend de `Idempoten`, `IdempotencyKey`, `CorrelationId` y `X-Correlation` **no devolvió ningún resultado**. No hay llave de idempotencia ni identificador de correlación en ninguna parte.

**Por qué importa:** si el cliente toca «confirmar» dos veces, o si la red se cae justo después de enviar la petición y la app reintenta, **el backend no tiene forma de saber que es la misma operación**. Puede ejecutar dos transferencias. Es el peor escenario posible en banca, y es el único de la lista que produce una pérdida de dinero real.

### ✅ Verificado el 2026-09-16 — el mecanismo existe, pero **está apagado**

Se revisó `TransactionAuthorizationGuard.cs` y su configuración. Lo encontrado:

**La buena noticia:** el diseño ya resuelve el problema. El guard llama a `_tokenBscClient.ConsumeAuthorizationAsync(...)`, y **consumir** significa que la autorización es **de un solo uso**: un segundo intento con el mismo identificador recibe «La autorización no es válida». Eso es idempotencia efectiva para toda operación autorizada. El guard cubre los tres controladores que mueven dinero: `PaymentExecutionProcedureController`, `CreditCardManagementController` y `LoanManagementController`.

**La mala noticia — y es seria:** `src/BSC.EnLinea.API/appsettings.json` línea 19 dice:

```json
"TransactionAuthorization": {
  "Enforce": false
}
```

Con `Enforce: false`, el propio código documenta el comportamiento: una transacción **sin autorización válida se ejecuta igual**, y solo se deja constancia en la bitácora. Es decir, **toda la cadena de autorización —llave en StrongBox, firma biométrica, huella canónica— está hoy en modo observación en esa configuración.** El control existe de extremo a extremo y no está bloqueando nada.

### ✅ P-15.1 — Respondida · 2026-09-16

**Respuesta:** _«Aún esta aplicación no está montada en producción.»_

**Efecto:** `Enforce: false` es una configuración de desarrollo, no una brecha en un sistema vivo. El riesgo R-19 baja de exposición alta a **media**, y deja de ser un incidente para convertirse en un **requisito de lanzamiento**.

**Lo que queda comprometido, y hay que sostener:**

- La app nueva se desarrolla y se prueba contra un ambiente con **`Enforce: true`**. Probar siempre con el control apagado significa que el día que se encienda nadie sabrá qué se rompe — y se romperá justo en el flujo de dinero.
- **`Enforce: true` es condición de salida del Gate D.** Una app que sale a producción con el control en `false` tiene la firma biométrica, la llave en hardware y la huella canónica funcionando… y sin efecto: el backend ejecutaría igual una transacción sin autorización válida. Todo el trabajo de la oleada 0 quedaría decorativo.

**Sigue abierta:** P-15.3 — ¿qué devuelve TokenBSC al consumir una autorización ya consumida? La app tiene que distinguir «la operación ya se ejecutó» de «la autorización es inválida», porque al cliente hay que decirle cosas distintas. Es una pregunta acotada para el equipo de backend.

**Bloquea:** oleadas 5 y 6 (transferencias y pagos), solo por P-15.3.

---

## 🟠 P-05 — Umbrales de riesgo de las operaciones

**Decisión:** ¿Cuáles son los umbrales oficiales de Cumplimiento y de dónde se leen?

**Evidencia:** `operation_risk.dart` fija `50.000 DOP` como límite de operación cotidiana, `5.000 DOP` durante el enfriamiento del dispositivo y una tasa de respaldo de `59,5` para convertir dólares. Su propio comentario dice que _«los umbrales son del banco, no nuestros»_ y que deberían venir de configuración _«cuando Cumplimiento los fije»_.

**Nota tras P-03:** servirlos desde el backend exigiría un endpoint nuevo, lo que choca con «no modificar el backend». Si no se abre excepción, se mantienen en el cliente **pero documentados y aprobados por Cumplimiento**, no heredados en silencio.

**Bloquea:** oleada 5.

---

## 🟠 P-06 — Endpoints del backend sin consumo móvil

`InternationalCatalogsController`, `NotificationController` y `TransactionsController` existen y no tienen ruta en la app. Verificado: `NotificationController` envía **correos y plantillas**, no avisos push, así que no cubre la capacidad 1 de P-04.

**Bloquea:** cierre del documento `04`.

---

## 🟠 P-07 — Política institucional de librerías, licencias y observabilidad

Sin política escrita encontrada. La migración a npm aumenta la superficie de cadena de suministro (T-15), lo que la vuelve más necesaria. Se relaciona con la capacidad 5 de P-04: elegir proveedor de reporte de fallos exige saber qué está aprobado.

**Bloquea:** Gate B.

---

## 🟠 P-08 — Ambientes, firma y distribución

Sin CI/CD; release firmada con llave de depuración; `applicationId` de plantilla; URL por defecto en HTTP claro. Con iOS en alcance, se suma el aprovisionamiento de Apple (ver P-13).

**Bloquea:** Gate B y Gate D.

---

## 🟡 P-09 — Equipo y calendario

¿Cuántas personas, con qué dedicación, y hay fecha comprometida? La estimación es relativa (~195–203 puntos con iOS) precisamente por eso.

---

## ✅ P-10 — Identificador de la aplicación · **RESUELTO EN LA OLEADA 0** · 2026-09-16

**Decidido: `com.bsc.mobile`.** Pendiente de confirmación formal, pero ya aplicado en el proyecto porque cambiarlo después es caro.

**Por qué no se usó el dominio invertido.** La convención habitual sería invertir el dominio del banco (`bsc.com.do` → `do.com.bsc.mobile`), y así se creó el proyecto al principio. **No funciona: `do` es palabra reservada en Java y en Kotlin**, de modo que no puede ser un segmento de nombre de paquete. El generador de React Native ni siquiera creó bien las carpetas — dejó un directorio literal llamado `do.com.bsc.mobile` en vez de la jerarquía correspondiente.

Es un problema conocido de todos los dominios `.do`, y la práctica habitual en República Dominicana es usar `com.<empresa>`. Por eso `com.bsc.mobile`.

**Consecuencia ya cerrada:** la app Flutter nunca llegó a producción, así que no hay convivencia ni migración de identificadores que resolver.

**Falta:** confirmar el _bundle identifier_ de iOS cuando llegue el Mac (se propone el mismo `com.bsc.mobile`).

---

## 🟠 P-16 — Certificados corporativos en el pipeline de CI · **NUEVA**

**Decisión:** ¿cómo confía el pipeline de CI en la CA del proxy corporativo?

**Evidencia:** al intentar la primera compilación de Android, todas las descargas de Gradle fallaron con `unable to find valid certification path to requested target`. La causa no es la red: la red funciona. Es que **la red del banco intercepta TLS con una CA propia, Windows confía en ella y el almacén de certificados del JDK no la incluye.** Cualquier herramienta basada en Java falla; PowerShell y npm funcionan porque usan el almacén de Windows.

En la máquina de desarrollo quedó resuelto con `-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT` en `android/gradle.properties`, que hace que Java use el almacén de Windows.

**El problema es que esa solución es específica de Windows.** Si el pipeline corre sobre agentes Linux —lo habitual en Azure DevOps—, hará falta:

- **A.** Importar la CA corporativa en el `cacerts` de la imagen del agente.
- **B.** Un espejo interno de artefactos (Azure Artifacts como proxy de Maven Central y del portal de plugins de Gradle), que además hace las compilaciones reproducibles y más rápidas.
- **C.** Agentes autoalojados en Windows, con el mismo arreglo que la máquina de desarrollo.

**Recomendación: B**, con A como paso inmediato. Un espejo interno resuelve a la vez la confianza, la reproducibilidad y la dependencia de que GitHub o el portal de Gradle estén disponibles — que ya falló una vez en esta misma sesión, cuando la descarga de la plantilla de React Native desde GitHub fue bloqueada.

**Bloquea:** Gate B (pipeline de CI).

---

## ⚪ P-17 — Cadena de herramientas nativa de Android · **RESUELTO, anotado para el pipeline**

Tres restricciones descubiertas al levantar la primera compilación. Ninguna es un problema de código, pero las tres detienen a cualquiera que clone el repositorio sin saberlas:

| Restricción           | Detalle                                                                                                                                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gradle ≥ 9.4.1**    | Lo exige el plugin de Android de React Native 0.87. Las versiones en caché de las compilaciones de Flutter (8.12 y 9.1.0) no sirven. Descargarlo depende de P-16                                                                                     |
| **NDK 28.2.13676358** | La plantilla pedía el 27.1.12297006, que en esta máquina existía como carpeta **vacía** —una instalación abortada— y que el gestor del SDK no pudo completar. Se fijó el 28.2, que sí está instalado y es el que usaban las compilaciones de Flutter |
| **CMake 3.22.1**      | Instalado. La Nueva Arquitectura de React Native compila C++, así que es obligatorio                                                                                                                                                                 |

**Para el agente de CI:** la imagen debe traer preinstalados el NDK y CMake, o poder descargarlos — lo que vuelve a depender de P-16. Conviene fijar las versiones en la imagen y no dejar que el gestor del SDK las resuelva en cada corrida, que es lento y frágil.

---

## 🟡 P-11 — Topología de red y API Gateway

¿La app habla directo al backend o pasa por un gateway? Determina **dónde se ancla el certificate pinning**. Anclarlo al certificado equivocado deja a los clientes fuera en la siguiente rotación.

**Bloquea:** oleada 9 y ADR-0002.

---

## ⚪ P-12 — Preguntas menores

| #      | Pregunta                                                                                              | Efecto         |
| ------ | ----------------------------------------------------------------------------------------------------- | -------------- |
| P-12.1 | ¿El tema oscuro debe encenderse? Existe definido y está desactivado                                   | Diseño         |
| P-12.2 | ¿El inglés debe funcionar de verdad? Declarado, pero los textos están incrustados en español          | Alcance        |
| P-12.3 | ¿`/accounts/:id` y `/products/:id` pueden unificarse? Construyen lo mismo                             | Simplificación |
| P-12.4 | ¿Qué pantallas exactamente deben bloquear capturas? Hoy no está documentado                           | Seguridad      |
| P-12.5 | ¿Nombre definitivo del repositorio? Se creó como `BSC.MobileAppRN`; el pedido decía `BSC.MobileAPPRN` | Convención     |
| P-12.6 | El `.code-workspace` referencia `BSC.TokenBSC`, que no existe (sí `BSC.TokenBSC.Api`)                 | Entorno        |
| P-12.7 | **Nuevo:** versión mínima de iOS a soportar (sugerido iOS 15+)                                        | Alcance iOS    |

---

## Preguntas surgidas al implementar las oleadas 1 a 3

### ✅ P-19 — Passkey · **RESPONDIDA** · 2026-09-16

**Respuesta:** _«Anotemos para realizarlo luego de la migración.»_

**Efecto:** la entrada por biometría queda como está —desbloqueo con token vigente— y las credenciales son el respaldo cuando el token venció. Passkey se retoma después.

**Nota para cuando se retome:** la opción más barata sigue siendo aprovechar la llave de StrongBox que **ya está construida y verificada**, junto con `/devices/challenge` y `/devices/verify-signature` que el backend ya expone. Faltaría que el backend acepte esa firma como prueba de identidad y no solo como autorización de una operación.

<details>
<summary>Análisis original</summary>

### Passkey no es implementable contra el backend actual

**Decisión:** ¿cómo se implementa la autenticación por passkey que el banco definió?

**Evidencia:** el banco indicó que la autenticación se hace por Face ID y **passkey**, no por PIN. Passkey es el nombre comercial de WebAuthn/FIDO2, y exige del lado del servidor tres cosas que el backend hoy **no expone**: registro de credencial, emisión de reto y verificación de firma. Las 45 rutas del contrato no incluyen ninguna.

Además, la entrada por biometría tal como está —heredada de Flutter— tiene un límite que conviene entender: **verifica identidad pero no obtiene credenciales nuevas**. Solo funciona si queda un token de sesión válido guardado; si venció, no hay más remedio que pedir usuario y contraseña. Passkey es justamente lo que resolvería eso.

**Opciones:**

- **A.** Passkey después de la migración, con los endpoints nuevos que haga falta. Mientras tanto, biometría como desbloqueo y credenciales como respaldo.
- **B.** Aprovechar la llave del dispositivo que **ya existe y ya funciona** —la de StrongBox, verificada en el Pixel— para autenticar además de firmar. El backend ya tiene `/devices/challenge` y `/devices/verify-signature`. Sería passkey en todo menos el nombre, sin endpoints nuevos.
- **C.** Passkey dentro de esta migración, lo que contradice P-03 (no modificar el backend).

**Recomendación: A ahora, B como propuesta a evaluar.** La opción B es interesante porque la infraestructura criptográfica ya está construida y probada; lo que faltaría es que el backend acepte esa firma como prueba de identidad y no solo como autorización de una operación. Es una conversación con el equipo de backend, no un cambio grande.

**Bloquea:** nada hoy.

</details>

---

### 🟠 P-20 — Umbral para introducir un navegador

**Decisión:** ¿cuándo se reemplaza la navegación por estado con React Navigation?

**Evidencia:** la app tiene hoy dos niveles —lista y detalle— y eso se resuelve con estado, sin librería. Instalé React Navigation y **la desinstalé** al ver que no la estaba usando: dependencias declaradas y no usadas es exactamente lo que criticamos del `pubspec.yaml` de Flutter, donde 8 de 30 nunca se importaban.

**Recomendación:** introducirla en la **oleada 5**, cuando llegue el asistente de transferencias de tres pasos con su botón atrás. Ahí sí paga su costo. La arquitectura (D-04) ya la contempla.

---

### 🟠 P-21 — El botón atrás de Android

**Decisión:** ¿qué hace el botón atrás del sistema en cada pantalla?

**Evidencia:** en la app Flutter lo maneja GoRouter por defecto. Con navegación por estado hay que atenderlo explícitamente, y hoy **no está atendido**: en el detalle de producto, el botón atrás cierra la app en vez de volver al dashboard.

**Recomendación:** resolverlo junto con P-20. Mientras tanto queda registrado como diferencia conocida respecto a Flutter, no como olvido.

---

### ✅ P-22 — Productos de categoría desconocida · **RESPONDIDA** · 2026-09-16

**Respuesta:** _«Todas las categorías deben estar definidas. Mostremos todo y luego vamos corrigiendo si es necesario.»_

**Efecto:** se confirma el comportamiento implementado — nada se oculta. Las categorías que la app no conoce aparecen agrupadas bajo «Otros productos» con nombre genérico, y la prueba de contrato contra el backend real avisa en consola si aparece alguna nueva.

Con el cliente de prueba y sus 18 productos **no apareció ninguna categoría desconocida**, así que las cinco que la app conoce cubren el catálogo actual.

<details>
<summary>Planteamiento original</summary>

### Qué mostrar en un producto de categoría desconocida

**Decisión:** ¿cómo se presenta un producto cuya categoría la app no reconoce?

**Evidencia:** en la app Flutter, un `switch` sin `default` hacía que cualquier producto con categoría nueva **desapareciera de la pantalla sin dejar rastro**. El cliente vería menos productos de los que tiene y nadie se enteraría. Ahora se agrupan bajo «Otros productos» con nombre genérico.

**Pregunta para negocio:** ¿es correcto mostrarlos así, o hay categorías que deliberadamente no deben verse en el canal móvil?

</details>
