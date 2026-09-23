# Handoff de sesión

**Última actualización:** 2026-09-18 (decimonovena — V-16 y V-06 cerradas; **el alcance inicial queda sin pendientes de desarrollo**)
**Fase:** 3 — Oleadas por feature
**Oleadas:** 0 ✅ · 1 ✅ · 2 ✅ · 3 ✅ · 4 ✅ · 5 ✅ · 6 ✅ · 7 ✅ · 8 ✅ · 9 ✅ · 10 🔶
**Autorización de implementación:** ✅ Otorgada

---

## Estado

**1137 pruebas: 1130 en verde y 7 omitidas** (las omitidas exigen el backend
levantado). 83 suites en verde y 1 omitida. TypeScript estricto sin errores,
ESLint sin errores. **96 commits** en la rama `dev` de `BSC.MobileAppRN.app`,
publicados en el remoto y propuestos a `develop` por Pull Request.

`npm run verify` falla con **dos hallazgos, y eso es correcto**: D-03 (no hay
almacén de claves) y D-02 (no hay pinning), los dos dentro de «Configuración de
release». No se silencian. **9 en verde · 1 fallido · 7 pendientes.**

⚠️ **Durante esta sesión llegó a fallar un tercero, y era propio: el escaneo de
secretos.** El traspaso había escrito la dirección interna del banco al explicar
por qué `adb reverse` no sirve con el APK de Flutter. Es exactamente el defecto
que la migración le viene señalando a la app original, cometido en la
documentación. Corregido: el aviso se mantiene entero y la dirección no. **Un
hallazgo del escáner de secretos nunca se silencia ni se justifica; se quita el
dato y se deja el aprendizaje.**

`BSC.MobileApp` sigue intacto: no se modificó ni un archivo del repositorio
Flutter en toda la migración. `BSC.BSCEnLinea.BackEnd` tampoco (P-03), ni
`BSC.TokenBSC.Api`, ni el portal Nuxt.

**V-19 cerrada**, y con una corrección de fondo: el arreglo de la sesión
anterior **se quedaba corto**. La hoja descontaba el teclado pero no la barra de
navegación, así que el botón seguía 21 píxeles por debajo del borde del teclado.
Verificado en el Pixel en las tres hojas —acceso, segundo factor y alta de
beneficiario—.

**La política de sesión ya se le pide al banco.** Era una omisión del porte:
`applyPolicy` existía y nadie lo llamaba.

**Los asistentes de transferencia y de pago pasaron por el método de las medidas
literales**, con dos diferencias encontradas y corregidas; las tres vistas de
detalle pasaron sin ninguna.

**D-27 es nueva:** el cajón de navegación del original **no está portado** y
ningún documento lo decía.

**El icono ya es el del banco y D-25 queda cerrada.** El isotipo se extrae del
logotipo de marca por programa (`npm run iconos`), y de ahí salen las tres capas
del icono adaptativo, los diez PNG de Android 7, la ficha de Google Play y el de
iOS. Con el mismo trabajo se resolvió el arranque, que era lo otro que delataba
una aplicación a medio hacer: ahora Android pinta el logotipo sobre el degradado
de marca **antes de que exista React Native**, y `PantallaDeArranque` lo continúa
ya dentro de la aplicación, de modo que el relevo no se ve.

**El icono se dibujó grande y se corrigió.** Iba a 65 dp del lienzo de 108:
cumplía la línea maestra de Material y aun así llenaba la máscara de borde a
borde. Ahora va a **52 dp**, el 72 % del área visible, y el tamaño se mide por el
círculo envolvente del símbolo y no por su caja, porque la máscara del lanzador
es redonda. Las piezas de tienda van aparte, a 62 dp, porque son cuadradas y
nadie les aplica máscara. Fijado por prueba, y la prueba se comprobó haciéndola
fallar.

**Y la aplicación ya se llama «Banco Santa Cruz» (D-29).** El nombre bajo el
icono era `BSCMobileAppRN`. Ojo al tocar esto: **hay dos nombres**. El visible
—`values/strings.xml` y `CFBundleDisplayName`— y el técnico —el `name` de
`app.json`, que `MainActivity.getMainComponentName()` repite—, que es con lo que
`AppRegistry` publica la raíz y **sigue siendo `BSCMobileAppRN`**. Cambiar el
segundo deja la app con pantalla roja al arrancar. Los dos están fijados por
prueba.

**Sin verificar en el teléfono.** El icono y el fondo nativo de arranque se
comprobaron con los archivos generados y en el navegador; **el cajón de
aplicaciones, los iconos temáticos de Android 13 y el arranque en frío exigen el
Pixel** y no se dieron por buenos. Los pasos están en
`18-icono-de-la-aplicacion.md`.

## Lo que hay que saber antes de tocar nada

Cinco cosas, las cuatro de la sesión anterior siguen valiendo y hay una quinta:

1. **Un comentario del porte que dice «es lo que hace el original» no es
   evidencia.** Dos resultaron falsos. Se verifica leyendo el Dart.
2. **Una prueba que mira la forma del código en vez del hecho se rompe en
   silencio.** Hay que leer los **valores** de los tokens, no sus nombres.
3. **Copiar el número correcto no basta cuando el marco lo interpreta distinto.**
   Esta sesión lo demostró por segunda vez, en el mismo componente: la hoja
   descontaba el teclado con el número que React Native reporta, y ese número
   **no incluye la barra de navegación** porque se mide contra otra ventana.
4. **El dashboard no admite llamadas nuevas.** Es la pantalla de entrada.
5. **Un valor por defecto de un componente compartido puede estar pisado por la
   pantalla.** Los cuatro pasos de los asistentes escriben `height: 50` a mano
   sobre el 54 del botón. Quien mire solo el componente porta el 54 y no se
   entera. Vale para el alto, para los indicadores de carga y para los rellenos.

6. **Una prueba puede pasar en falso y no notarse.** La regresión de la etiqueta
   vacía comprobaba primero que el árbol no tuviera la cadena vacía. **Pasó, y
   el defecto seguía ahí**: `<Text>{''}</Text>` no deja ningún nodo de texto en
   `toJSON()`, así que buscar el texto no prueba nada sobre si el elemento se
   dibuja y sigue ocupando su línea. Hay que **contar elementos**, no textos. Es
   la tercera vez que una comprobación mira la forma en vez del hecho, y la
   primera en que se coge en el acto — porque se escribió antes del arreglo y se
   exigió verla fallar.

## Próxima acción exacta

**El alcance inicial no tiene pendientes de desarrollo.** Todas las
verificaciones en dispositivo que dependían del equipo están cerradas y
verificadas contra el backend o contra el artefacto, nunca contra la pantalla.

Lo que queda **no es trabajo de código**:

1. **Las decisiones del banco.** D-01 a D-05, D-08, D-09, D-19 a D-24, y **la
   mitad de D-18 que falta** —cuáles son las URLs de cada ambiente; el mecanismo
   ya está hecho y verificado—.
2. **V-17**, todo lo de iOS, que necesita un equipo macOS (P-13).
3. **D-14 y P-07**, que bloquean las pruebas de componente con interacción, las
   E2E y la validación contra esquemas: las cuatro exigen dependencias nuevas.

### ⚠️ Dos cosas del estado del teléfono que hay que saber

1. **El Pixel tiene instalado el APK de release, no el de depuración.** Para
   volver a desarrollar con Metro hay que reinstalar el de debug; comparten
   llave de firma mientras D-03 siga abierta, así que `adb install -r` **no
   borra los datos**.
2. **El Pixel quedó sin dispositivo enrolado**, porque V-06 lo revocó. Cualquier
   prueba que necesite **firmar** una operación —una transferencia real, un
   pago— exige volver a enrolarlo desde Perfil → Seguridad. Y al reenrolarlo se
   cierra la ventana en la que la `TwoFactorSheet` es visible.

## Lo que se dejó fuera en esta sesión, y por qué

Siguiendo la regla de que el traspaso tiene que decir lo omitido:

- **La `TwoFactorSheet` en los otros dos sitios** —el paso del pago y el alta de
  beneficiario—. Se midió la de transferencia, que es la que comparte
  componente; las otras dos no se vieron. **Y ahora la ventana está cerrada**:
  V-06 revocó el dispositivo, así que hasta reenrolarlo no hay forma de llegar a
  ellas, y una vez reenrolado tampoco.
- **El resto de la comparación píxel a píxel de V-13.** Se cerró la transferencia
  expresa —con cuatro defectos medidos y corregidos— y los siete botones con
  flecha y las siete notas al pie quedaron cubiertos con pruebas. **Las demás
  pantallas no se compararon una a una** contra la app Flutter.
- **Volver a dejar el Pixel en depuración y reenrolado.** Se dejó con el APK de
  release instalado y sin dispositivo registrado, que es el estado en que V-06 lo
  deja. Los dos se deshacen en un minuto y están explicados arriba.
- **Los diecinueve beneficiarios `PendingVerification` restantes**, de enero y
  del sembrado de datos.
- **La otra mitad de D-18**: cuáles son las URLs de cada ambiente. Es decisión
  del banco y el mecanismo ya está listo para recibirlas.

⚠️ **Aviso sobre el árbol de trabajo.** Esta sesión coincidió con otra que
trabajaba el icono de la aplicación (D-25 y D-29). Su **documentación** entró en
el commit `d6a439d` para no dejarla perdida, y así está dicho en su mensaje, pero
**su código sigue sin commitear**: los recursos de `mipmap-*`, el manifiesto,
`MainActivity.kt`, `app.json`, `PantallaDeArranque.tsx` y
`scripts/generar-iconos.mjs`. Quien siga debe **commitearlo aparte y no
mezclarlo**. Ya está dentro del APK de release que se probó, y funciona: el
diálogo de huella y el pie del perfil dicen «Banco Santa Cruz».

## Lo último que se hizo (2026-09-18, decimonovena actualización)

El detalle está en el [`CHANGELOG`](./CHANGELOG.md), entrada 21.

**V-16 cerrada, con cero caídas.** Estaba bloqueada por D-18 y se desbloqueó al
resolverse el mecanismo. El APK de release, compilado con R8 y con la URL
inyectada, se instaló encima del de depuración —sin borrar datos— y se recorrió
entero: acceso por huella, dashboard con los 18 productos reales, tasa de
cambio, perfil, seguridad, dispositivos, pagos y el asistente de transferencia
hasta la confirmación, con el servicio de comisiones consultado.
`adb logcat -b crash` **sin una sola entrada**. Los siete módulos nativos, el
cliente HTTP y el parseo de contratos sobreviven a la minificación.

**V-06 cerrada, verificada contra el backend.** `GET /api/v1/devices` pasó de un
dispositivo `Active` a `"Devices": []`. La pantalla de Seguridad ofrece ahora
volver a registrar el teléfono, que es el estado correcto.

## Lo anterior (2026-09-18, decimoctava actualización)

El detalle está en el [`CHANGELOG`](./CHANGELOG.md), entrada 20.

### Cuatro hallazgos encadenados, y el primero solo se pudo ver por V-04

La `TwoFactorSheet` **se midió por fin**: se llega a ella únicamente cuando el
dispositivo no puede firmar, y V-04 había dejado la llave invalidada. Se entró
con una transferencia entre cuentas propias de RD$ 1.00 y **se canceló sin
ejecutar** — comprobado contra el core, no contra la pantalla: las dos cuentas
quedaron idénticas.

De ahí salió que **al botón le faltaba la flecha**, y de ahí que **la capacidad
no existía**: el original la pone en **siete** botones y `BscButton` no tenía
dónde. De ahí, comparando las notas al pie, que **faltaban dos de siete**. Y de
la segunda, que **la pantalla del aviso de sesión no existía**.

### Lo que más conviene recordar

**`SessionManager` anunciaba el aviso y nadie escuchaba.** Tenía `onWarning`,
`onWarningResolved`, `timeRemainingMs` y un `extend()` documentado como «"Seguir
conectado" en el aviso». La sesión se bloqueaba de golpe. Es la **tercera vez**
con el mismo patrón —`applyPolicy` y `setBiometricEnabled` fueron las otras—: una
capacidad construida y sin conectar **no la ve ninguna prueba unitaria ni se ve
leyendo la pantalla**, porque el defecto vive en el hueco entre las dos.

**Una pantalla hecha a mano se queda fuera de las mejoras del componente.** La
hoja de acceso no usa `BscSheet`, así que no heredó su nota al pie —un aviso
antifraude— igual que no heredó el cálculo del teclado en V-19.

### D-18, hecho y verificado

Gradle escribe `BSC_BASE_URL` en `BuildConfig`, el módulo nativo la expone como
constante síncrona y `config.ts` la lee. Sin dependencia nueva. Comprobado sobre
el APK: el DEX lleva la URL y el bundle JS **cero**. **V-16 deja de estar
bloqueada** y el release ya está instalado en el Pixel.

## Lo anterior (2026-09-18, decimoséptima actualización)

El detalle está en el [`CHANGELOG`](./CHANGELOG.md), entradas 17 y 19. Aquí, lo
que hace falta para seguir.

### V-04: la huella nueva invalida la llave, y la app se entera sola

Medido con `dumpsys fingerprint`, que es el sistema y no la aplicación: las
huellas inscritas pasaron de `"count":1` a `"count":2`, y **sin reiniciar la
app** la pantalla de Seguridad apagó «Autorizar con tu huella», puso el
subtítulo «Necesita volver a registrarse» y sacó la banda «La llave dejó de ser
válida». Valida el diseño de `hasUsableKey()`: una llave invalidada **sigue
cargando del Keystore sin error** y solo `initSign` la rechaza.

### D-28: cancelar un alta de beneficiario bloquea volver a registrar la cuenta

El registro queda en `PendingVerification`, la lista solo pide los activos —así
que el cliente no lo ve— y `ExistsByAliasAsync` cuenta todos los no borrados.
Reintentar la cuenta responde **400 con un alias que el cliente no encuentra en
ninguna pantalla**. Es del backend, así que afecta igual al original y al
portal. El registro huérfano se borró.

### D-30: la transferencia expresa del original no se dibuja

El pendiente decía «2 píxeles». Medido en el Pixel, en el original **el campo de
destino queda en 5 px de ancho y del botón «Validar» no hay un solo píxel de su
verde en pantalla**: el botón pide ancho infinito dentro de un `Row`. **No se
puede usar.** El porte no reproduce el defecto y dibuja lo que el original quiso
escribir. Todo en `medidasDelDestinoExpreso.ts`.

### Y el hallazgo que llega más lejos: la etiqueta vacía

`BscTextField` dibujaba su etiqueta **también vacía**, y eso reserva su línea:
**22 dp** de aire muerto en las **seis** pantallas que pasan `label=""`. Medido
en dos sitios independientes —el desfase del botón «Validar» y la separación
entre «MONTO (DOP)» y su campo, 9,9 dp en el original contra 31,2 en el porte—.
Corregido en el sistema de diseño.

### Y otros 18 dp debajo del campo, que tampoco son del original

Quitada la etiqueta, el botón seguía descolocado 9,71 dp, ahora por debajo.
`BscTextField` dibujaba **siempre** un `<Text>` bajo la caja —2 de margen más 16
de mínimo—. El original **no reserva nada**: no hay un solo `errorText` en todo
el Dart, y los errores van en una banda al pie del formulario que el porte
también tiene. De paso, la caja medía **52 donde el original dibuja 50**.

✅ **Verificado en el Pixel el 2026-09-18, después del arreglo**, en la sección
del monto del asistente de transferencia:

| Qué                           | Original | Porte antes | Porte ahora  |
| ----------------------------- | -------- | ----------- | ------------ |
| Del rótulo al campo           | 9,52 dp  | 31,2 dp     | **8,76 dp**  |
| Alto de la caja               | 49,90 dp | 51,81 dp    | **49,90 dp** |
| Del campo al rótulo siguiente | 27,43 dp | 46,10 dp    | **27,05 dp** |
| Desfase entre botón y campo   | —        | 24,2 dp     | **0,00 dp**  |

El campo y el botón «Validar» ocupan ahora exactamente la misma caja.

## Lo anterior (2026-09-18, decimoquinta actualización)

El detalle completo está en el [`CHANGELOG`](./CHANGELOG.md), entrada 16. Aquí,
lo que hace falta para seguir.

### V-19: la barra de navegación que nadie estaba reservando

El arreglo anterior descontaba el teclado y aun así el botón no se veía entero.
Los números del sistema, leídos con `dumpsys window displays` en el Pixel 10a:

| Qué                                    | Píxeles |
| -------------------------------------- | ------- |
| Pantalla                               | 2424    |
| Teclado real (`InsetsSource type=ime`) | 965     |
| Barra de navegación                    | 63      |
| Lo que la hoja reservaba               | 902     |

**965 − 902 = 63, la barra de navegación exacta.** `keyboardDidShow` mide contra
la ventana de la aplicación, que no la incluye; el `Modal` con
`statusBarTranslucent` se dibuja sobre la pantalla entera. Corregido en
`espacioQueTapaElTeclado` (`altoDeLaHoja.ts`), que usan `BscSheet` y la hoja de
acceso —que llevaba su propia copia del cálculo—.

Verificado en las tres hojas: el pie termina en 1417 y el teclado empieza en 1459.

### La política de sesión, cerrada

`politicaDeSesion.ts` porta `SessionPolicyService.fetch()` y `_loadPolicy()`.
Backend leído completo antes de portar: el manejador **no es un muñón**, lee la
tabla de configuración por categoría. Hoy responde 10 minutos y 60 segundos, que
coincide con el valor por defecto del porte —por eso la omisión no se veía—.

### Los asistentes

Dos diferencias: los botones del pie medían **54 donde el original escribe 50**,
en los cuatro pasos, y «Cargando beneficiarios…» iba **sin indicador**. Los
cuatro pies eran el mismo marcado copiado y ahora son `PieDelAsistente`, con una
prueba que **renderiza el componente** y mira el alto que aplica.

---

## Lo anterior (2026-09-18, decimocuarta actualización)

### La entrada por biometría funciona: verificada de punta a punta

**2026-09-18, Pixel 10a, contra el backend y el core reales.** Es el recorrido
completo, y es la primera vez que esta función se ve funcionar en todo el
proyecto — en ninguna de las dos aplicaciones había funcionado nunca.

| Hora     | Qué pasó                                                                           |
| -------- | ---------------------------------------------------------------------------------- |
| 10:56    | Sesión iniciada con usuario y contraseña. El almacén cifrado queda con 10 entradas |
| 11:13:36 | **La app vuelve sola a la pantalla de acceso**: el bloqueo por inactividad saltó   |
| 11:13:36 | El almacén baja a **8 entradas**, no a 6: el token de refresco **sobrevivió**      |
| —        | Se pulsa «Entrar con tu huella» y **abre el diálogo del sistema**, no el aviso     |
| —        | Verificación aceptada → **dashboard con los datos reales del cliente**             |

Las dos mediciones que importan, y por qué:

1. **El almacén bajó en dos entradas, no en tres.** Ese es el bloqueo llevándose
   el token de acceso y su caducidad y **dejando el de refresco**, que es
   exactamente lo que `lockSession` tiene que hacer. Si se lo hubiera llevado,
   la cuenta habría bajado más.
2. **El diálogo del sistema llegó a abrirse.** Antes del arreglo la pantalla
   respondía «Tu sesión expiró» **sin pedir el dedo**, porque la comprobación
   previa no encontraba token de refresco. Que el diálogo aparezca demuestra que
   esa comprobación ahora pasa.

El tiempo real hasta el bloqueo fueron unos diecisiete minutos, no diez: el
temporizador se reinicia con cada actividad y la última fue posterior al inicio
de sesión. Conviene tenerlo en cuenta al repetir la prueba — hay que esperar
más de lo que dice el valor por defecto.

### Lo que quedó abierto de aquí

**El porte nunca pide la política de sesión al backend.** El original tiene
`SessionPolicyService.fetch()` y un `_loadPolicy()` que la aplica al
autenticarse; el porte tiene `applyPolicy` en el gestor de sesión y **nadie lo
llama** fuera de las pruebas, así que siempre usa el valor por defecto de diez
minutos (`DEFAULT_SESSION_POLICY`, en `src/core/security/sessionManager.ts`). El
backend publica el suyo bajo la clave `session.timeout.inactivity.minutes`. Es
una omisión del porte respecto al original y hay que cerrarla: si el banco
cambia la política, la app móvil no se entera.

### Lo que se dejó fuera en aquella sesión, y por qué

Siguiendo la regla de que el traspaso tiene que decir lo omitido:

- **La verificación de la huella de punta a punta.** El arreglo está puesto y con
  pruebas, pero el bloqueo por inactividad tarda 10 minutos y la sesión terminó
  antes. Es el punto 1 de arriba.
- **La verificación del arreglo de la hoja con el teclado**, por lo mismo.
- **La compensación de D-26 en el dashboard y en Pagos**: decidido que no se
  hace. Se escala al core.
- **El filtro de «Para hoy»**, que depende del mismo campo cambiado y por tanto
  puede ocultar una tarjeta con pago pendiente. **No se tocó**, por coherencia
  con la decisión de no compensar. Está anotado en el documento de escalada.
- **El balance al corte del asistente de pagos** sigue saliendo del listado, no
  del detalle. El original hace lo mismo y cambiarlo es decisión del banco.
- **El icono sigue siendo un marcador de posición** (D-25).
- **Las pruebas de componente con interacción** siguen bloqueadas por D-14: falta
  `fireEvent` y `waitFor`, no `react-test-renderer`, que ya está.

## Lo anterior (2026-09-18, decimotercera actualización)

El detalle completo está en el [`CHANGELOG`](./CHANGELOG.md), entrada 14. Aquí,
lo que hace falta para seguir.

### La entrada por huella no funcionó nunca, en ninguna de las dos aplicaciones

Es el hallazgo más grande de la sesión y lo destapó el usuario al probarla:
«había probado eso antes y nunca entra con la huella». Dos defectos encadenados:

1. El porte comprobaba el **token de acceso**, que vive minutos, donde el
   original comprueba el de **refresco**.
2. Y por debajo: **`setBiometricEnabled` no se llama en ningún sitio**, ni en el
   porte ni en `secure_storage.dart` del original. Con la bandera siempre en
   falso, la pantalla de acceso lleva desde el principio ofreciendo un botón que
   no podía llevar a ninguna parte, en las dos aplicaciones.

Corregido en `entradaPorBiometria.ts`, con la bandera activándose tras un inicio
de sesión con credenciales aceptado. **Falta verificarlo de punta a punta** — ver
«Próxima acción exacta».

### D-26, y los dos sitios donde sigue sin compensar

El pago mínimo llega **invertido entre monedas** desde el core. El banco decidió
que el asistente de pagos **pida el detalle** de la tarjeta, y así está.

⚠️ **El dashboard y la pestaña de Pagos siguen enseñando la cifra del listado**,
y se ve: el dashboard anuncia «Pago mínimo: RD$ 174.04» para la \***\*7147, cuyo
mínimo real en pesos son RD$ 2,311.41. Se dejó a propósito —compensar en cada
pantalla multiplica el parche y lo que corresponde es arreglar el origen—, pero
**el cliente ve hoy dos cifras distintas para la misma tarjeta en dos pantallas\*\*
y conviene decidirlo con el banco.

### Lo que se dejó fuera en esta sesión, y por qué

Siguiendo la regla de que el traspaso tiene que decir lo omitido:

- **La compensación de D-26 en el dashboard y en Pagos.** Ver arriba.
- **El balance al corte del asistente de pagos** sigue saliendo del listado
  (`saldoDolares`), no del detalle: el asistente enseña «Balance al Corte
  US$ 2,838.49» donde el detalle dice que el corte son US$ 2,716.92. El contrato
  de productos no trae un campo propio para el ciclo cerrado y el original hace
  lo mismo. **Ahora que el detalle se pide, se podría tomar de ahí** — no se hizo
  porque cambia una cifra que el original también calcula así, y eso es decisión
  del banco.
- **La paridad de pantalla no se aplicó a todas**: se hicieron las hojas de la
  tarjeta, los dos pasos del asistente de pagos, el dashboard y el detalle de
  producto. **Quedan sin pasar por el método**: beneficiarios, seguridad, token,
  mis dispositivos, tasa de cambio, comprobantes fiscales, perfil y oficial de
  cuenta. La comparación de textos no encontró nada en ellas, pero **eso no
  cubre las medidas**, que es donde estaban las diferencias.
- **El icono sigue siendo un marcador de posición.** El andamiaje está y
  documentado; falta el asset del banco (D-25).
- **La comparación píxel a píxel de V-13** contra la app Flutter instalada.
- **Las pruebas de componente con interacción** siguen bloqueadas por D-14, y
  ahora `verify` lo dice con precisión: lo que falta es `fireEvent` y `waitFor`,
  no `react-test-renderer`, que ya está.

## Lo anterior (2026-09-17, duodécima actualización)

**Sesión con el Pixel 10a conectado**, recorriendo V-01…V-17. Todo lo de abajo
se vio en un dispositivo real contra el backend y el core.

### El defecto de dinero

Una transferencia de RD$ 100.00 entre dos cuentas del mismo cliente acreditó
**100.15** al destino y debitó **100.30** del origen, y el comprobante anunciaba
las tres cifras mal. El canal enviaba `transactionAmount = monto + comisión +
impuesto`; **el core calcula el impuesto solo y lo cobra en un movimiento
aparte**, así que interpretaba lo recibido como el monto a transferir.

La regla del banco, fijada en esta sesión: **se envía el monto; el impuesto y el
total a debitar solo se muestran**, y el servicio de comisiones se consulta
siempre porque es él quien dice si corresponde cobrar. Esto **corrige la base de
F-02**: en este punto la app Flutter tenía razón. **El portal Nuxt arrastra el
mismo defecto a producción** (D-19) y no se toca desde aquí.

Verificado tras el arreglo: al destino le llegan 100.00 exactos y del origen
salen 100.15, y los movimientos del core enseñan el impuesto como su propia
línea, «Imp. 1.5 Por 1000 S/Ley 288-04».

### Los otros cinco defectos

1. **V-05 cerrado.** La banda que no aparecía al cancelar la biometría se
   dibujaba **sin ancho**: vive en un contenedor centrado y su columna de textos
   usa `flex: 1`. La instrumentación descartó el remontaje. Corregido en el
   sistema de diseño, donde otras once pantallas usan la misma banda.
2. **El comprobante no se veía como el original.** Nueve diferencias en el de
   transferencias y una más en el de pagos, ninguna en los tokens: medidas que
   el widget Dart escribe a mano. `_receiptRow` pasa a ser `BscReceiptRow`.
3. **El aviso de éxito salía en rojo** bajo «No se pudo completar».
4. **El alta de beneficiarios se quedaba clavada**: el core devuelve el
   documento con guiones y la validación del porte lo rechazaba.
5. **Seguridad no se refrescaba al volver de «Mis dispositivos»**: tras revocar,
   seguía enseñando el interruptor encendido.

### Cinco muñones y reglas nuevas del backend, todas escaladas

Ninguna es trabajo del porte y ninguna se tocó: D-19 (el portal), D-20
(`/beneficiaries/confirm` **no valida el segundo factor** —lo dice su propio
`// TODO`— y aceptó `000000`), D-21 (`/devices/register` no genera ni envía
código), D-22 (el escalón presencial del primer dispositivo, que ninguna
pantalla del móvil puede satisfacer) y D-23 (un dispositivo revocado **no puede
volver a registrarse nunca**, y el banco quiere lo contrario).

### Cómo se completó el enrolamiento, para no repetir el descubrimiento

El código de seis dígitos **no llega por SMS ni por correo y nunca iba a
llegar**. Es un **TOTP** del secreto del cliente, y se obtiene así:

```bash
# 1. El escalón presencial, que el primer dispositivo exige
curl -s -X POST http://localhost:5026/api/v1/devices/complete-step-up   -H "Content-Type: application/json"   -d '{"customerCode":"80191","deviceId":"<el pendiente>","performedBy":"validacion"}'

# 2. El código, que el servicio devuelve en el cuerpo
curl -s -X POST http://localhost:5026/api/v1/tokens/generate   -H "Content-Type: application/json"   -d '{"customerCode":"80191","channelType":2,"operationType":11,"deliveryMethod":1}'
```

El dispositivo pendiente sale de `GET http://localhost:5026/api/v1/devices/80191`.

⚠️ **Un dispositivo revocado no se puede reenrolar** (D-23): hace falta un
identificador nuevo, y hoy eso solo se consigue con `adb shell pm clear
com.bsc.mobile`.

---

## Lo anterior (2026-09-17, undécima actualización)

Todo esto se hizo **sin el teléfono conectado y sin decisiones pendientes**, que
es lo que el banco pidió adelantar.

**La oleada 9 queda cerrada.** `14-revision-mastg.md` recorre los siete grupos
del estándar de OWASP priorizados por riesgo. Conclusión: la aplicación está
sólida donde se mueve el dinero —firma, huella, almacenamiento, red— y le faltan
tres cosas para publicarse, y **las tres son decisiones del banco**: `Enforce`
(D-04), las huellas del pinning (D-02) y la custodia del almacén (D-03).

**El pinning está listo para activarse en una tarde.**
`scripts/calcular-pin-spki.mjs` calcula la huella; el andamiaje está escrito y
comentado en la configuración de red de release. Solo faltan las dos huellas del
banco. `verify` lee el XML **sin comentarios**, así que mientras siga comentado
lo sigue reportando.

**La firma de release ya no depende del repositorio.** Gradle lee
`android/keystore.properties` o las variables `BSC_KEYSTORE_*`, y cae a la llave
de depuración si no hay ninguno. `assembleDebug` verificado tras el cambio.

**Oleada 10 escrita:** runbooks (`15`), plan de piloto y vuelta atrás (`16`) e
informe final (`17`).

**D-18 es nueva y bloquea la publicación.** Salió al escribir los runbooks: el
APK de release **no habla con ningún backend**. `src/app/config.ts` declara
cuatro ambientes pero elige con `__DEV__`, y la URL de producción está vacía a
propósito. Es correcto —una compilación mal configurada debe fallar al arrancar,
no conectarse a donde no debe— y deja pendiente el mecanismo de inyección.

**La matriz de trazabilidad estaba mintiendo.** Decía «Inventariado» para las
trece features ya escritas. Actualizada, y ahora distingue **«Portado»** —escrito
y probado— de **«Verificado»** —visto en un teléfono—, que no es lo mismo y se
estaba mezclando.

### Lo que quedó por hacer de la oleada 10

Las **pruebas por pantalla** y el **rendimiento contra la línea base de Flutter**
que pide el plan. Las primeras exigen `@testing-library/react-native`, que es
dependencia nueva y está bloqueada por D-14. El segundo exige el teléfono.

📌 **Todo lo que espera una decisión, una verificación o una validación está en un solo sitio: [`13-pendientes.md`](./13-pendientes.md).** Ese documento se puede llevar a una reunión tal cual; lo de aquí es el registro del proyecto.

## La huella de operación: resuelta y verificada contra el backend real

**Esto ya no es una incógnita.** El 2026-09-17 se comprobó contra el backend levantado que las tres huellas del porte coinciden carácter por carácter con las que el servidor calcula, y la comprobación **no movió un peso**.

`TransactionAuthorizationGuard` escribe la cadena canónica en la bitácora cuando una operación llega sin autorización utilizable —«sin verla, una huella que no coincide es imposible de depurar», dice su propio comentario—. Se enviaron las tres operaciones con cuentas inexistentes, de modo que el guardián calculara la huella y el manejador rechazara después. Las tres cadenas quedaron fijadas como vectores de prueba:

| Operación       | Cadena que produjo el backend                                 |
| --------------- | ------------------------------------------------------------- |
| Transferencia   | `v1\|2\|80191\|...\|1234.56\|214`                             |
| Pago de tarjeta | `v1\|7\|80191\|...\|987.65\|214` — con el número **completo** |
| Pago de cuota   | `v1\|8\|80191\|...\|543.21\|214`                              |

Las pruebas `transferFingerprint.test.ts` y `paymentFingerprint.test.ts` las comparan contra el cálculo del porte. **Son distintas del resto de las pruebas del archivo**: aquellas contrastan contra una reimplementación del cálculo de C#, y una reimplementación puede estar mal de la misma forma que el original; estas son el servidor hablando.

Lo que sigue pendiente es **la corrección del portal Nuxt**, que comparte el defecto de la moneda. Sin eso, encender `Enforce` rompe el portal aunque el teléfono ya esté bien.

### El hallazgo original, para el banco

La huella de operación es lo que convierte «el cliente digitó el token» en «el cliente autorizó **esta** transacción». El canal la calcula al pedir el token y **el backend la recalcula al ejecutar**, a partir de los campos que recibió; si no coinciden, la transacción no procede aunque el código haya sido válido. Es la protección correcta y hay que conservarla.

**Ninguno de los dos canales existentes la calcula igual que el backend.**

| Operación       | Qué firma el original                     | Qué recalcula el backend                                          | Consecuencia al encender `Enforce`         |
| --------------- | ----------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| Transferencia   | la moneda del **destino**                 | `sourceTransactionCurrency`, la del **origen**                    | falla toda transferencia que cruce monedas |
| Pago de tarjeta | el número **enmascarado** y `finalAmount` | el `CardNumber` completo y `PaymentAmount`, que es `totalDebited` | **falla todo pago de tarjeta**             |
| Pago de cuota   | el número enmascarado y `finalAmount`     | `loanNumber` y `paymentAmount`                                    | **falla todo pago de cuota**               |

El portal Nuxt comparte el defecto de la moneda, y **hay que corregirlo también allí** para que los tres canales coincidan. Hoy nada de esto se ve porque `TransactionAuthorizationSettings.Enforce` está apagado: el guardián del backend deja pasar la operación y la anota en la bitácora con la cadena canónica. Es la peor forma de que un defecto sobreviva hasta producción, porque todo _parece_ funcionar.

**Cómo queda resuelto en el porte.** La huella **se deriva del cuerpo que se va a enviar**, nunca del estado de la pantalla: `transferFingerprint.ts` y `paymentFingerprint.ts` toman la petición y reproducen exactamente los campos y la precedencia del controlador. La orden se compone una vez, se firma esa orden y se ejecuta esa misma orden. Una prueba replica el cálculo de C# con `node:crypto` como oráculo.

## Decisiones del banco

| #      | Decisión                                                                             |
| ------ | ------------------------------------------------------------------------------------ |
| P-01   | React Native **por política de empresa**                                             |
| P-02   | iOS en alcance                                                                       |
| P-03   | **El backend no se modifica**                                                        |
| P-04   | Push, red, QR, gráficos y reporte de fallos: después de la migración                 |
| P-13   | Equipo macOS después de la migración → iOS se escribe **sin verificar**              |
| P-15.1 | La app **nunca llegó a producción**                                                  |
| P-16   | El pipeline de CI se ve después                                                      |
| P-19   | Passkey: se anota para después de la migración                                       |
| P-22   | Todas las categorías de producto se muestran; se corrige después si hace falta       |
| —      | **El diseño y los estilos se preservan tal cual**                                    |
| —      | **Sin PIN.** La autenticación es por biometría y passkey                             |
| —      | **Se itera en el navegador y se valida en el Pixel**, no al revés                    |
| —      | **El PDF del estado de cuenta se entrega con módulo nativo propio**, no con librería |

## Lo construido

### Oleada 0 — Cimientos ✅

Firma con llave en StrongBox **verificada en Pixel real**, cancelación del diálogo biométrico, `packages/bsc-shared`, sistema de diseño portado del Dart, cliente HTTP e interceptor, almacenamiento seguro y gestor de sesión.

### Oleada 1 — Acceso ✅

Pantalla de acceso, hoja de credenciales, entrada por biometría y saludo por nombre recordado. **Sin pantalla de PIN.**

✅ **Completada el 2026-09-17**: «Último acceso: hoy, 3:44 p.m.» y la versión al pie, que faltaban, ya están y se verificaron en el teléfono contra el original.

### Oleada 2 — Cliente y dashboard ✅

Datos, pantalla y paridad visual verificada lado a lado contra la app Flutter en el mismo teléfono.

### Oleada 3 — Detalle de producto ✅

Capa de datos completa de los cinco tipos de producto, las cuatro vistas de detalle, la pantalla propia de tarjeta de crédito con sus siete hojas, los estados de cuenta y el PDF por módulo nativo propio. **Cerrada del todo en esta sesión** con perfil y Mi Oficial de Cuenta.

- **Perfil** — cabecera con avatar e iniciales, datos del cliente que **dicen «No disponible» cuando el core no mandó el campo**, el bloque del oficial, las acciones de sesión y las dos hojas de confirmación destructiva.
- **Mi Oficial de Cuenta** — retrato, cargo, píldora de disponibilidad, información del oficial y tarjeta de contacto que marca y escribe con `Linking` del núcleo.

### Oleada 4 — Beneficiarios ✅

Lista agrupada por destino con sus tres grupos, hoja de detalle y **asistente de alta en cinco pasos**: destino, cuenta, datos, código y listo. Catálogos con caché de sesión y degradación por selector. Segundo factor adelantado de la oleada 7 en lo imprescindible.

### Oleada 5 — Transferencias ✅

Los cinco tipos, el asistente de tres pasos con su indicador, la cotización, las comisiones, el comprobante y **la integración con la firma en StrongBox de la oleada 0**.

- `operationRisk.ts` — cotidiana frente a alto riesgo.
- `authorizeOperation.ts` — la compuerta por la que pasa todo lo que mueve dinero, como función pura y con pruebas de la política completa.
- `deviceBindingService.ts` — reto, firma y verificación.
- El estado «1» del core se distingue de la aplicada.

### Oleada 6 — Pagos ✅

Tarjeta y préstamo, **reutilizando el asistente de la oleada 5** tal como el plan anticipaba. Opciones de monto que no se ofrecen en cero, los dos ciclos de una tarjeta, y el préstamo sin comisión ni impuesto.

### Oleada 7 — Dispositivos y segundo factor ✅

**Lo que faltaba no era la interfaz.** `DeviceBindingService` solo sabía firmar, así que en un teléfono real no había ninguna llave que el banco reconociera: toda operación caía al código y la ganancia de la oleada 5 no existía fuera de las pruebas.

- **Enrolamiento en tres pasos** —registrar, verificar con el código, publicar la llave pública—. La llave se crea **después** de verificar el código: si se creara antes, un enrolamiento abandonado dejaría una llave huérfana y la app creería estar protegida cuando el banco no la conoce.
- **Pantalla de Seguridad**, con el interruptor que enrola de verdad y el detalle de dónde vive la llave.
- **Mis dispositivos**, con la píldora «Este teléfono» y la revocación, que **no exige segundo factor** a propósito.
- **Token para otros canales**, con biometría obligatoria, `FLAG_SECURE` y ocultado automático al minuto.
- **`deviceIntegrity`** con módulo nativo propio en Kotlin, en lugar de `flutter_jailbreak_detection`.
- **TOTP RFC 6238** en `@bsc/shared`, con HMAC-SHA256 propio contrastado contra `node:crypto`.

### Oleada 8 — Complementarias ✅

- **Tasa de cambio**: tabla de compra y venta y conversor a pesos, con las medidas literales del original.
- **Comprobantes fiscales**: lista, filtros de cuenta y período, y hoja de detalle que pide los dos endpoints. El período por defecto es un año, como el original.

### Oleada 9 — Endurecimiento 🔶 empezada

Se hizo **lo que no necesita una decisión del banco**. Lo demás espera.

| Tarea                                                       | Estado                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prohibición de tráfico en claro (T-06)                      | ✅ `configuracion_de_red.xml`, con la excepción del bucle local solo en depuración                                                                                                                                                                              |
| `allowBackup=false` y reglas de extracción (T-12)           | ✅ Incluida la transferencia entre dispositivos de Android 12, que `allowBackup` no cubre                                                                                                                                                                       |
| La versión unificada                                        | ✅ Gradle la deriva de `package.json`; la app la lee del manifiesto                                                                                                                                                                                             |
| Certificate pinning por SPKI (T-03)                         | ⏳ **Necesita las huellas reales del banco y una política de rotación.** Un pin equivocado deja a todos los clientes fuera                                                                                                                                      |
| `applicationId` propio y firma de release custodiada (T-11) | ⏳ Necesita decisión sobre la custodia del almacén de claves                                                                                                                                                                                                    |
| Endurecimiento del bundle (T-07)                            | ✅ Hermes ya estaba; **R8 encendido** con sus reglas, y un plugin propio quita `console.*` de producción. **Verificado sobre el paquete real**: cero `console.log`, `warn`, `info`, `debug`, `table` y `trace`; los 36 `console.error` se conservan a propósito |
| Observabilidad con redacción de PII (T-14)                  | ✅ `Registro` y `redaccion`. La redacción ocurre **en el registro, no en quien llama**                                                                                                                                                                          |
| Escaneo de secretos (T-10)                                  | ✅ Escáner propio en el verificador. **Encontró la dirección interna del banco en cuatro documentos de la migración y en dos comentarios del código**, y se redactaron                                                                                          |
| SCA y SBOM (T-15)                                           | ✅ `npm audit` —que viene con npm— y un inventario propio, los dos en el verificador                                                                                                                                                                            |
| Licencias, SAST y escaneo del sector                        | ⏳ Dependen de P-07 y P-16                                                                                                                                                                                                                                      |
| Revisión MASTG priorizada por riesgo                        | ⏳                                                                                                                                                                                                                                                              |

Todo lo hecho queda **fijado por prueba** en `endurecimientoAndroid.test.ts`, que lee el manifiesto, los dos XML y el `build.gradle`. Esas decisiones viven donde nadie las mira y nada las comprueba: se pierden en un merge o al actualizar una plantilla de React Native, y una aplicación que permite copia de seguridad funciona igual de bien en el día a día. El síntoma aparece en una auditoría, no en el desarrollo.

### Oleada 10 — Verificación y despliegue 🔶 empezada

- **`npm run verify` cubre ahora once pasos**, cuatro más que antes: escaneo de secretos, vulnerabilidades de dependencias, inventario de dependencias y la configuración de release. Los pendientes siguen listados **a propósito** en la salida: una lista que oculta lo que falta da una falsa sensación de cobertura.
- **`scripts/comparar-capturas.mjs`**: compara dos capturas píxel a píxel y señala las bandas. Avisa cuando el resultado es 0,00 %, que **no es una buena noticia** sino la señal de que se comparó una aplicación consigo misma.
- **`docs/13-pendientes.md`**: todo lo que espera decisión, verificación o validación, con identificadores estables que se pueden citar en una reunión.

Falta: pruebas por pantalla, rendimiento contra la línea base de Flutter, informe final, runbooks y plan de piloto y de vuelta atrás.

### Navegación ✅ (P-20 y P-21)

React Navigation con la estructura de `routes.dart`, botón atrás de Android funcionando, mapa de rutas completo y prueba que falla si alguna pantalla del original se quedó sin ruta. Sin enlaces profundos (T-09). **Los parámetros ya viajan**: un beneficiario entra al asistente de transferencias con el destino puesto, y una tarjeta o un préstamo entran al de pagos con su tipo.

## Defectos encontrados y corregidos

| #   | Defecto                                                                                                                                                                                                                                                                                                                                                                            | Dónde                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | **La firma de transacciones de la app Flutter no podía funcionar en un teléfono real**: `Signature.sign()` no dispara el diálogo biométrico                                                                                                                                                                                                                                        | R-20                           |
| 2   | **Las fechas se mostrarían un día antes.** `new Date('2026-05-27')` es medianoche UTC                                                                                                                                                                                                                                                                                              | `formatters.ts`                |
| 3   | El SHA-256 propio emitía suplentes UTF-16 sueltos en crudo                                                                                                                                                                                                                                                                                                                         | `sha256.ts`                    |
| 4   | `do` es palabra reservada en Java/Kotlin                                                                                                                                                                                                                                                                                                                                           | `com.bsc.mobile`               |
| 5   | Los productos con categoría desconocida desaparecían de la pantalla                                                                                                                                                                                                                                                                                                                | `productContracts.ts`          |
| 6   | La app Flutter y el portal difieren al redondear medios en el monto                                                                                                                                                                                                                                                                                                                | `operationFingerprint.ts`      |
| 7   | **El número más grande de la app estaba mal.** «Tu dinero disponible» no es el patrimonio neto                                                                                                                                                                                                                                                                                     | `balanceSummary.ts`            |
| 8   | **La tasa del día se descartaba en silencio**                                                                                                                                                                                                                                                                                                                                      | `balanceSummary.ts`            |
| 9   | **El botón atrás cerraba la app** desde el detalle de un producto                                                                                                                                                                                                                                                                                                                  | P-21                           |
| 10  | **Ninguna consulta de movimientos podía traer datos.** Las fechas viajaban con barras donde la app Flutter manda guiones                                                                                                                                                                                                                                                           | `productDetailRepository.ts`   |
| 11  | **El detalle del producto salía entero en cero.** `obtenerDetalle` devolvía el sobre `Result<T>` en vez de su contenido                                                                                                                                                                                                                                                            | `productDetailRepository.ts`   |
| 12  | `parseCoreDate` no reconocía la fecha con hora separada por un espacio                                                                                                                                                                                                                                                                                                             | `formatters.ts`                |
| 13  | **Se había perdido la consulta a más de 90 días**                                                                                                                                                                                                                                                                                                                                  | `TransactionListSection.tsx`   |
| 14  | **Con «US$» encima, los movimientos seguían siendo los de pesos**                                                                                                                                                                                                                                                                                                                  | `CreditCardDetailScreen.tsx`   |
| 15  | **El número de la tarjeta no era el que el cliente acaba de tocar**                                                                                                                                                                                                                                                                                                                | `creditCardDetailContracts.ts` |
| 16  | **El oficial de cuenta nunca habría aparecido.** El porte leía `OfficerName` y el backend manda `OfficialAccountName`. La prueba del contrato fijaba el nombre equivocado                                                                                                                                                                                                          | `customerContracts.ts`         |
| 17  | **El alta de beneficiarios estaba bloqueada de fábrica.** La validación de cuenta lee `ApiResponse<T>` sobre una respuesta `Result<T>`, así que `isValid` sale siempre falso y la hoja se queda clavada enseñando «Cuenta validada.» como error                                                                                                                                    | `beneficiaryContracts.ts`      |
| 18  | **Los códigos de documento estaban cambiados.** `PASSPORT → 2` y `RNC → 3`, cuando el enumerado del backend dice `RNC = 2` y `Passport = 3`                                                                                                                                                                                                                                        | `beneficiaryContracts.ts`      |
| 19  | **La huella de una transferencia cruzada no coincide con el backend**: el canal firma la moneda del destino y el backend la del origen                                                                                                                                                                                                                                             | `transferFingerprint.ts`       |
| 20  | **La huella de TODO pago no coincide con el backend**: el canal firma el número enmascarado y `finalAmount`; el backend recalcula con el número completo y `totalDebited`                                                                                                                                                                                                          | `paymentFingerprint.ts`        |
| 21  | **Las operaciones del teléfono se registraban como si vinieran del portal.** El canal iba como `BSCLWEB`                                                                                                                                                                                                                                                                           | `paymentRepository.ts`         |
| 22  | El informe de lint no servía: `jest.setup.js` producía diecinueve errores `no-undef` que enmascaraban cualquier error nuevo                                                                                                                                                                                                                                                        | `.eslintrc.js`                 |
| 23  | **El token para otros canales nunca pudo mostrar un código.** La pantalla lee `Base32Secret` de `/two-factor/soft-token/provision` y ese campo **no existe**: `TokenBscProvisionResponse` declara `Success`, `Message`, `AlreadyProvisioned` y `Error`, y nada más. El controlador devuelve ese tipo, así que aunque TokenBSC lo mandara el gateway lo descartaría al deserializar | `soft_token_screen.dart`       |
| 24  | **El original no calcula un TOTP estándar.** Usa el paquete `otp` de Dart con `isGoogle: false`, que **no decodifica el base32**: hace el HMAC sobre los bytes UTF-8 de la cadena, repetidos hasta llenar los 32 bytes. **Confirmado contra el validador real**: `TotpGenerator` de TokenBSC implementa RFC 6238 estricto, así que habría rechazado esos códigos uno por uno       | `soft_token_screen.dart`       |
| 25  | **La fecha «Registrado» de un dispositivo llegaba siempre nula.** El original lee `CreatedAt` y el backend manda `RegisteredAt`. Como esa fila solo se dibuja cuando el dato existe, el fallo se veía como una tarjeta más corta y no como un error. **Verificado corregido en el Pixel**: la fila aparece                                                                         | `deviceContracts.ts`           |

| 26 | **La entrada por huella no podía funcionar.** El porte miraba el token de acceso, que vive minutos, donde el original mira el de refresco | `entradaPorBiometria.ts` |
| 27 | **Y por debajo, la bandera no la escribía nadie.** `setBiometricEnabled` está declarada en el porte **y en `secure_storage.dart` del original**, y ninguna de las dos aplicaciones la llama nunca: la pantalla de acceso lleva desde el principio ofreciendo un botón muerto | `AppRoot.tsx` |
| 28 | **El detalle de producto que no carga se tragaba sin avisar.** El original sustituye la vista entera por «No pudimos cargar la cuenta» con «Reintentar»; un comentario del porte afirmaba lo contrario | `ProductDetailScreen.tsx` |
| 29 | **La moneda y el producto se perdían** al entrar al pago desde el detalle de la tarjeta: el asistente caía en la primera tarjeta y en pesos | `parametrosDePago.ts` |
| 30 | **La confirmación de pago había copiado la estructura de transferencias**: cuatro rótulos ajenos y el desglose de conversión al revés | `PaymentStepConfirmation.tsx` |
| 31 | **El formulario de pago pedía la cuenta antes que el monto**, al revés que el original, y con dos rótulos que no eran los suyos | `PaymentStepForm.tsx` |
| 32 | **Cuatro separaciones mal en las hojas de la tarjeta**: un estilo comodín donde el original escribe tres medidas distintas | `CreditCardSheets.tsx` |
| 33 | Dos palabras de más en el estado vacío del dashboard | `DashboardScreen.tsx` |
| 34 | **El mes sin datos del estado de cuenta** dejaba treinta segundos de silencio y luego «Intenta de nuevo», que invita a repetir lo mismo | `mensajeDeDescarga.ts` |

## Lo que se dejó fuera, y por qué

### De esta sesión (oleadas 7 y 8)

- **La atestación de la llave** (`keyAttestation`) no se envía al registrar. El backend la acepta opcional y verificarla exige una cadena de certificados que el banco todavía no valida. Enviar algo que nadie comprueba daría una falsa sensación de garantía.
- **El token suave no se puede usar**, ni en el porte ni en el original: el backend no devuelve el secreto. La pantalla está escrita y su camino de error es el que el cliente recorre hoy. Escalado.
- **El modo no estándar de TOTP del original** queda implementado y probado en `codigoTotpAlEstiloDelOriginal`, pero **no se usa**: TokenBSC valida con RFC 6238 estricto. Está ahí como documentación ejecutable del hallazgo.
- **Las tasas solo traen dólar y euro.** Lo filtra `GetCurrencyExchangeListQuery` en el backend. La tabla del porte sabría dibujar una tercera moneda si llegara.
- **Los avisos siguen saliendo como banda dentro de la pantalla** y no como el `SnackBar` flotante del original. Es una diferencia visible.
- **No se portó la evaluación de tasa** (`/currency-exchange/evaluate`): el original no la llama desde la pantalla de tasas.

### De sesiones anteriores

- **El pago a la tarjeta de un tercero.** El endpoint `apply-credit-card-beneficiary-payment/execute` existe y su comando declara `DestinationAccountNumber` y `BeneficiaryId`, pero **su manejador no llama al core**: la llamada está comentada bajo un `//TODO : HACER TRANSFERENCIA INTERBANCARIA` y devuelve un éxito fijo —`StatusId = "0"`, `TransactionId = "completado"`—. Conectarlo le diría al cliente que pagó la tarjeta de otra persona sin que se haya movido un peso. La app Flutter tampoco lo usa: define la llamada en su fuente de datos y su bloc nunca la invoca. **Es lo primero que hay que preguntarle al banco de la oleada 6.**
- **Beneficiarios internacionales.** El original tampoco los da de alta: su hoja solo ofrece cuenta del banco y otro banco local.
- **Editar y eliminar un beneficiario.** No están en el original.
- **El catálogo de tipos de documento está vacío en este ambiente.** Sale de una tabla que nadie sembró, así que el selector no aparece y el alta manda siempre cédula (1). El original lo esconde sin decirlo.
- **Preseleccionar la tarjeta o el préstamo concreto** al llegar desde su detalle. Viaja el tipo, no el producto: el asistente parte del primero del cliente.
- **La cuota real de un préstamo** en el asistente de pagos. La lista de productos solo trae el saldo, así que cuando no se conoce la cuota se ofrece únicamente «Otro monto» en vez de inventar un «Pagar cuota RD$ 0.00».

### De antes

- **«Ver número» no enseña el número completo**, ni siquiera tras validar. Es lo que hace el original: no hay endpoint que lo devuelva.
- **La hoja de límites no lleva interruptores.** El original los quitó porque ninguno tiene endpoint.
- **«Simulador» y «Estados» del préstamo** avisan de que llegarán, igual que el original.
- **El estado de cuenta en PDF de una cuenta** está conectado; el del préstamo no existe en el original.
- **iOS entero.** No hay ni un módulo nativo escrito para iOS (P-13).

## Divergencias con el original, anotadas y sin resolver

| Qué                                           | Detalle                                                                                                                                                                                                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **El saludo del dashboard**                   | El original escribe el nombre del titular tal como lo manda el core, ofuscado en este ambiente («MWZ4JP»); el porte escribe el nombre con el que se inició sesión («Ransel»). **Hay que decidir cuál quiere el banco**                                    |
| ~~**Cuánto se debita en una transferencia**~~ | ✅ **Resuelto el 2026-09-17**: el banco decidió seguir al portal. Se debita `totalDebited`. Queda aquí como aviso a quien vuelva a leer el Dart: el original manda solo el monto, y portarlo al pie de la letra reintroduce la divergencia                |
| **El nombre del dispositivo se trunca**       | En «Mis dispositivos», con la píldora «Este teléfono» y un estado largo, al nombre no le queda ancho y sale «Google …». El original tiene la misma estructura; hay que compararlo y decidir, porque es el dato con el que el cliente reconoce su teléfono |
| **`BscSelect` abre una hoja**                 | El original despliega un `DropdownButtonFormField`. React Native no trae menú desplegable y la alternativa era una dependencia nativa de controles. El campo cerrado sí copia al original, así que la diferencia solo se ve mientras está abierto         |
| **Compartir el comprobante**                  | Una hoja del sistema en vez de los cuatro botones de WhatsApp, SMS, correo y más. Dos dependencias menos y un toque más                                                                                                                                   |
| ~~**La versión de la app**~~                  | ✅ **Resuelto el 2026-09-17.** Gradle deriva `versionName` y `versionCode` de `package.json`, y la app lee el manifiesto. Verificado: `versionName="0.1.0"`, `versionCode=100`                                                                            |
| **Tres iconos del dashboard**                 | «Más», «Tasa de cambio» y la alcancía de los productos no son el mismo trazo. La expresa usa una flecha donde el original usa un rayo                                                                                                                     |
| **El número de la tarjeta**                   | La lista entrega una terminada en 7147 y el detalle responde 1032. Cuál es el plástico está sin resolver                                                                                                                                                  |
| **La fecha de pago de la tarjeta**            | Sale anterior a la de corte. Es fiel al original, que lee `FECHA_VENCIMIENTO` para las dos cosas, pero conviene preguntarlo                                                                                                                               |
| **El saldo corrido de los movimientos**       | Llega en cero desde el core y las dos aplicaciones enseñan «RD$ 0.00» en cada fila                                                                                                                                                                        |
| **`Clipboard` de React Native**               | Está marcado como obsoleto en el núcleo. Funciona, y la alternativa es una dependencia nativa más                                                                                                                                                         |
| **Los iconos dibujados a mano**               | El sistema de diseño ya lleva sesenta y un trazos, y su propio comentario decía que pasando de treinta convendría reconsiderarlo. Se mantienen a mano: no añaden dependencia y son auditables, pero conviene revisarlo con el banco                       |

## Cómo se verifica

**Dos etapas, y la segunda no es opcional.**

1. **Iterar en el navegador.** `npm run web` levanta la vista previa en `http://localhost:5273`, con las pantallas dentro de un marco de 360×800 y datos sintéticos. Se puede pedir una pantalla por URL (`?pantalla=pagos`) y esconder el panel lateral para capturar (`&solo=1`).
2. **Validar en el Pixel** al cerrar un bloque de trabajo.

⚠️ **La app Flutter no compila para web** (el compilador de Dart aborta), así que **la comparación contra el original se hace en el Pixel**, donde conviven `com.bsc.mobile` y `com.example.bsc_mobile_app`.

⚠️ **Lo que el navegador no puede verificar nunca**: biometría, llaves en StrongBox, almacenamiento cifrado, `FLAG_SECURE` y el botón atrás de Android.

**El método de paridad**: leer el widget Dart completo, copiar sus medidas literales y comparar.

### Pantallas de la vista previa

`cuenta`, `cuenta-sobregiro`, `cuenta-usd`, `tarjeta`, `tarjeta-contado`, `prestamo`, `certificado`, `perfil`, `perfil-sin-oficial`, `oficial`, `oficial-sin-asignar`, `beneficiarios`, `beneficiarios-vacio`, `beneficiarios-error`, `alta-beneficiario`, `transferencias`, `transferencia-confirmar`, `transferencia-comprobante`, `transferencia-pendiente`, `pagos`, `rango`, `seguridad`, `seguridad-sin-enrolar`, `seguridad-llave-perdida`, `seguridad-sin-soporte`, `mis-dispositivos`, `mis-dispositivos-vacio`, `token-suave`, `token-suave-visible`, `tasa-de-cambio`, `tasa-de-cambio-error`, `comprobantes`, `comprobantes-vacio`.

## Próxima acción exacta

**Las oleadas 0 a 9 están cerradas.** La 10 está escrita salvo dos piezas, y
ninguna de las dos depende de escribir código nuevo.

Lo que queda se agrupa en tres frentes, y **el primero es el único que no exige
ni el teléfono ni una decisión del banco**, así que es por donde empezar si no
hay nada más disponible.

### El entorno quedó montado el 2026-09-17

Para no repetir el arranque, esto ya está hecho y verificado en esta sesión:

- Pixel 10a conectado (`5C121JEA322911`), con **las dos aplicaciones
  instaladas**: `com.bsc.mobile` (el porte) y `com.example.bsc_mobile_app`
  (el original Flutter), en el mismo teléfono.
- Backend en el 5000 y `BSC.TokenBSC.Api` en el 5026 respondiendo 200.
- Túneles `adb reverse` hechos para 5000, 5026 y 8081.
- **APK de depuración recién compilado e instalado, con la instrumentación de
  V-05 dentro.** La sesión sigue viva y el dashboard carga con datos reales.
- Se llegó hasta Perfil → Seguridad. **El enrolamiento (V-01) se quedó ahí
  porque hace falta el código de seis dígitos del usuario.**

⚠️ **Metro tarda unos 40 segundos en servir el primer bundle** (6,8 MB). Si la
app se queda en «Loading from localhost:8081», no está rota: hay que esperar, o
calentar el bundle con
`curl -s -o /dev/null "http://localhost:8081/index.bundle?platform=android&dev=true&minify=false"`
antes de lanzarla.

### 1. Con el Pixel conectado — lo más valioso, y es una tarde

En este orden, porque cada paso desbloquea el siguiente:

1. **Levantar los dos servicios**: el backend en el 5000 y `BSC.TokenBSC.Api` en
   el 5026. **Sin el segundo el enrolamiento devuelve 409** y el mensaje no dice
   por qué. Es el error que más tiempo ha costado en este proyecto.
2. **Completar el enrolamiento pendiente.** El dispositivo del cliente de prueba
   ya está registrado y en `PendingVerification`. **Hay que pedirle al usuario el
   código de seis dígitos**; al confirmarlo se crea la llave en StrongBox. No se
   puede avanzar sin ese código.
3. **Recorrer una transferencia y un pago de punta a punta** con el dispositivo
   ya enrolado. Es lo que demuestra en un teléfono real la ganancia de la
   oleada 5.
4. **Resolver V-05**, la banda que no aparece al cancelar la biometría en la
   pantalla del token. **Ya está instrumentado**: se lee con
   `adb logcat -s ReactNativeJS:V | findstr token-suave`, que registra montaje,
   desmontaje, apertura y respuesta del diálogo. No hay que reproducir el
   defecto a ciegas.
5. **Comparar las oleadas 4 a 6 contra la app Flutter** instalada en el mismo
   teléfono, con `node scripts/comparar-capturas.mjs`. ⚠️ Antes de capturar,
   confirmar el foco con `adb shell dumpsys window | grep mCurrentFocus`:
   `adb install -r` **mata la app que instala** y devuelve el foco a la anterior,
   y eso ya produjo una tanda entera de capturas falsas con una paridad imposible
   del 0,00%.
6. **Medir el rendimiento contra la línea base de Flutter**, que es una de las
   dos piezas que faltan de la oleada 10.

El resto de verificaciones está en [`13-pendientes.md`](./13-pendientes.md) §2,
como V-01…V-17.

### 2. Sin teléfono y sin decisión — lo que se puede hacer ya

Queda poco, y conviene saberlo antes de buscar trabajo:

- **Las pruebas por pantalla** de la oleada 10 están **bloqueadas por D-14**:
  exigen `@testing-library/react-native`, que es dependencia nueva, y la política
  de librerías está sin fijar. No se añade sin autorización.
- **Ejercitar la revocación de dispositivos** contra el backend local. Es el
  único mecanismo de vuelta atrás que actúa en minutos y **nunca se ha probado**.
  El plan de piloto lo señala como requisito previo a la fase 0.

### 3. Decisiones del banco — cinco, y bloquean la publicación

**Ninguna es trabajo de desarrollo.** Están en
[`13-pendientes.md`](./13-pendientes.md) §1.1 con su justificación completa:

|          |                                                                                                |
| -------- | ---------------------------------------------------------------------------------------------- |
| **D-03** | Custodia del almacén de claves. Un almacén perdido = no se puede volver a publicar **nunca**   |
| **D-18** | La URL del backend por ambiente. Hoy **el APK de release no habla con ningún backend**         |
| **D-02** | Las huellas SPKI. El andamiaje y la herramienta están; faltan los dos valores                  |
| **D-04** | Encender `Enforce`. Mientras esté apagado, todo el trabajo de autorización **no protege nada** |
| **D-01** | Corregir la huella del portal Nuxt. **Va antes que D-04**, o encender D-04 rompe el portal     |

**D-01 y D-04 son la pareja peligrosa**: el mismo interruptor que protege al
teléfono rompe al portal si el portal no se corrige primero. El banco respondió
«todavía no» a D-01 el 2026-09-17.

### Decisiones ya tomadas que no se reabren

- **D-16 — el trabajo sin commitear del backend: «no lo toques».** Más de mil
  líneas que solo existen en el árbol de trabajo de una laptop, y diez de esos
  archivos también los toca `origin/feature/search-ncf`. Hay copia de respaldo en
  el scratchpad de la sesión. **No se hace merge, no se commitea, no se
  reorganiza.**
- **P-03 — el backend no se modifica.** Cualquier incompatibilidad se documenta y
  se consulta.

### Cómo levantar el entorno

```bash
# Vista previa en el navegador (lo más rápido para construir pantallas)
cd C:/Projects/BSC.MobileAppRN && npm run web     # http://localhost:5273

# Pruebas y verificación
npm test -- --maxWorkers=2 && npx tsc --noEmit && npm run lint

# --- Dispositivo, para validar al cerrar un bloque ---
# 1. Backend  (OJO: el proyecto está en src/, no en la raíz)
cd C:/Projects/BSC.BSCEnLinea.BackEnd && dotnet run --project src/BSC.EnLinea.API

# 1b. TokenBSC — IMPRESCINDIBLE para dispositivos y segundo factor
cd C:/Projects/BSC.TokenBSC.Api && dotnet run --project src/BSC.TokenBSC.API   # :5026

# 2. Túneles al teléfono (hay que rehacerlos cada vez que se reconecta el cable)
export PATH="$PATH:/c/Users/rceballos/Android/Sdk/platform-tools"
adb reverse tcp:5000 tcp:5000 && adb reverse tcp:8081 tcp:8081

# 3. Metro
cd C:/Projects/BSC.MobileAppRN && npx react-native start

# 4. Compilar e instalar
cd C:/Projects/BSC.MobileAppRN/android
export JAVA_HOME="/c/Program Files/Microsoft/jdk-17.0.20.101-hotspot"
export GRADLE_OPTS="-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT"
./gradlew assembleDebug --no-daemon --max-workers=1 \
  -Dkotlin.compiler.execution.strategy=in-process -Dkotlin.daemon.jvmargs="-Xmx1024m"
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## Lo verificado en dispositivo

**2026-09-17, Pixel 10a, con `BSC.BSCEnLinea.BackEnd` y `BSC.TokenBSC.Api` levantados.**

Antes de nada, un dato de entorno que costó encontrar y ahorra media hora la próxima vez: **el enrolamiento de dispositivos no funciona si `BSC.TokenBSC.Api` no está corriendo**. Vive en `C:\Projects\BSC.TokenBSC.Api`, escucha en el **5026**, y sin él `/devices/register` responde 409 con «No se pudo contactar el servicio de dispositivos». El backend por sí solo no basta.

### Verificado ✅

| Qué                                              | Cómo quedó                                                                                                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Las tres huellas contra el backend real**      | Coinciden carácter por carácter. Ver la sección de la huella; los vectores están fijados en las pruebas                                                  |
| **El registro del dispositivo de punta a punta** | App → gateway → TokenBSC → base de datos. `Device registration created for customer 80191`                                                               |
| **Mis dispositivos con datos reales**            | La lista trae el dispositivo recién registrado, con «Este teléfono», «Pendiente de verificación» y la fecha de registro                                  |
| **La fila «Registrado»**                         | Aparece. Es el defecto 25 corregido y comprobado contra el backend, no contra un doble                                                                   |
| **El mensaje del servidor sobrevive al rechazo** | Con TokenBSC apagado, la pantalla enseñó «No se pudo contactar el servicio de dispositivos», que es del servidor, en vez de un «algo salió mal» genérico |
| **`FLAG_SECURE` del token**                      | La captura de pantalla sale **en negro** y el árbol de vistas sí tiene el contenido: el bloqueo funciona                                                 |
| **El diálogo biométrico del token**              | Aparece con el texto propio, «Verifícate para ver tu token»                                                                                              |
| **Seguridad, Mis dispositivos y Token**          | Dibujadas en el teléfono, con las medidas del original                                                                                                   |
| **TOTP: qué valida TokenBSC**                    | `TotpGenerator` implementa **RFC 6238 estricto**. Confirma que el porte hace lo correcto y que el modo del original habría sido rechazado                |

### Encontrado y sin resolver ⚠️

| Qué                                                                       | Estado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Al cancelar la biometría en la pantalla del token no aparece el aviso** | El botón vuelve a quedar habilitado, así que la promesa **sí** se resuelve y `setOcupado(false)` corre; lo que no aparece es la banda «No pudimos verificarte. El token no se muestra.». El mismo patrón de banda **sí** funciona en la pantalla de Seguridad, que no pasa por el diálogo. La hipótesis es que el `BiometricPrompt` provoca un remontaje que limpia el estado, pero **no está confirmado**: `always_finish_activities` está en 0 y el gestor de sesión no remonta nada. **Hay que terminar de diagnosticarlo con el teléfono delante** |
| **El nombre del dispositivo se trunca a «Google …»**                      | Con la píldora «Este teléfono» y el estado «Pendiente de verificación» en la misma fila, al nombre no le queda ancho. El original tiene la misma estructura, así que probablemente trunque igual, pero **el nombre es justo el dato con el que el cliente reconoce su teléfono**. Hay que compararlo contra la app Flutter y decidir                                                                                                                                                                                                                   |

## La comparación contra la app Flutter, pantalla por pantalla

**2026-09-17, las dos aplicaciones en el mismo Pixel 10a, con la misma sesión y los mismos datos.**

### Cómo se hizo, y una trampa que costó media hora

Comparar a ojo dos pantallas que se parecen mucho es justo donde se cuela un desplazamiento de cuatro puntos. Se escribió `scripts/comparar-capturas.mjs`, que compara dos capturas píxel a píxel y —lo que importa— **señala las bandas**: tramos seguidos de filas donde más del 6 % del ancho difiere. Eso ya no es antialiasing, es una fila movida o un texto distinto.

⚠️ **Un resultado de 0,00 % no es una buena noticia: es la señal de que se comparó una aplicación consigo misma.** Pasó en esta sesión. `adb install -r` mata la app que se está instalando y el foco vuelve a la anterior, así que toda una tanda de capturas «de React Native» eran en realidad de la app Flutter, y las cuatro pantallas dieron paridad perfecta. Lo delató el propio número. **Antes de cada tanda hay que comprobar qué aplicación está delante:**

```bash
adb shell dumpsys window | grep -o "mCurrentFocus=Window{[^}]*}"
```

Y una limitación que conviene saber: **el árbol de vistas de la app Flutter no expone su contenido** —solo construye el árbol de accesibilidad cuando hay un servicio de accesibilidad activo—, así que `uiautomator dump` sirve para la app React Native pero no para el original. Contra el original solo vale la comparación de píxeles.

### Lo que salió igual ✅

| Pantalla           | Resultado                                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Perfil**         | Cabecera, avatar, píldora, las cinco filas de datos del cliente con sus iconos, el bloque del oficial y las seis filas de sesión: mismos textos, mismo orden, mismos iconos |
| **Transferencias** | Los cinco tipos, sus iconos, títulos y subtítulos, y la cabecera. La diferencia medida es ruido de trazado de fuentes, sin bandas anchas                                    |
| **Seguridad**      | Las tres tarjetas, el banner «Cómo funciona» y la cabecera, con las mismas medidas                                                                                          |

### Lo que salió distinto ⚠️

| #   | Qué                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Estado                                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | **La pestaña de Pagos no es la misma pantalla.** El original —`payment_home_body.dart`— abre con la **lista de productos**: «Pagar / Tarjetas de crédito y préstamos», una sección por tipo, y cada tarjeta con su número enmascarado y su balance. El porte abre con un **selector de tipo**: «Pagos / Paga tus tarjetas y tus préstamos» y dos tarjetas, «Tarjeta de Crédito · 4 tarjetas a tu nombre» y «Préstamo · 1 préstamo a tu nombre». Son **un toque más** y el cliente deja de ver los balances de entrada | **Sin corregir.** Es la divergencia más grande encontrada y reabre una pantalla de la oleada 6 |
| 2   | **Chevrons de más en Seguridad.** El porte dibujaba «›» en «Mis dispositivos» y «Token para otros canales»; el original no —`BscListRow` tiene `showChevron = false` por defecto y esa pantalla no lo pasa                                                                                                                                                                                                                                                                                                            | ✅ Corregido                                                                                   |
| 3   | **El pie del perfil no llevaba el número de compilación.** El original escribe «Versión 1.0.0 (1)»; el porte escribía «Versión 0.1.0»                                                                                                                                                                                                                                                                                                                                                                                 | ✅ Corregido: ahora sale del paquete instalado                                                 |
| 4   | **La pantalla de acceso no decía «Último acceso»** ni la versión al pie. Los dos detalles estaban anotados como pendientes de la oleada 1                                                                                                                                                                                                                                                                                                                                                                             | ✅ Corregidos y verificados en el teléfono                                                     |
| 5   | **El interruptor de la biometría es más estrecho** que el de Material, así que en el original el subtítulo de esa tarjeta parte en dos líneas y en el porte cabe en una                                                                                                                                                                                                                                                                                                                                               | Sin corregir. Es el control del sistema; igualarlo exigiría dibujarlo a mano                   |
| 6   | **Las filas de «Datos del cliente» son unos cuatro puntos más bajas** en el porte, y la diferencia se acumula hasta unos veinte puntos en la quinta fila                                                                                                                                                                                                                                                                                                                                                              | Sin corregir. Medido, no estimado                                                              |
| 7   | **El saludo del dashboard** y los **tres iconos** —«Más», «Tasa de cambio» y la alcancía— siguen como estaban                                                                                                                                                                                                                                                                                                                                                                                                         | Ya anotados en «Divergencias»                                                                  |

## Pendientes de verificación en dispositivo

El Pixel se desconectó a mitad de la verificación. Lo de abajo sigue sin verse en el teléfono.

| #   | Qué                                                                              | Por qué importa                                                                                                                                                                                                                                                                                  |
| --- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Completar el enrolamiento con el código**                                      | El dispositivo quedó **registrado y pendiente de verificación** para el cliente 80191. El código es el TOTP del cliente: sale de su aplicación autenticadora o del SMS al `***-***-0274`. **Solo el usuario puede leerlo.** Al confirmarlo se crea la llave en StrongBox y se publica la pública |
| 2   | **El asistente de transferencias de punta a punta con la firma real**            | Depende del punto 1. Es lo que decide si la ganancia de la oleada 5 existe de verdad                                                                                                                                                                                                             |
| 3   | **El asistente de pagos de punta a punta**                                       | Igual que el anterior                                                                                                                                                                                                                                                                            |
| 4   | **La banda que falta al cancelar la biometría**                                  | Ver «Encontrado y sin resolver»                                                                                                                                                                                                                                                                  |
| 5   | **Inscribir una huella nueva** y comprobar que la llave se invalida              | Es la garantía que la pantalla de Seguridad le promete al cliente. Depende del punto 1                                                                                                                                                                                                           |
| 6   | **La revocación de un dispositivo contra el backend**                            | La pantalla está y la lista funciona; falta ejercitar el `DELETE`                                                                                                                                                                                                                                |
| 7   | **El alta de un beneficiario completa**                                          | El paso del código exige el backend y un método de verificación activo                                                                                                                                                                                                                           |
| 8   | **La hoja del segundo factor**                                                   | El campo de seis dígitos, el autorrelleno del SMS y el borrado tras un código rechazado                                                                                                                                                                                                          |
| 9   | Cifrado real del almacenamiento seguro                                           | El módulo está escrito; falta ejercitarlo                                                                                                                                                                                                                                                        |
| 10  | **La descarga del PDF del estado de cuenta**                                     | El módulo nativo compila y está registrado, pero no se ha ejercitado en el teléfono                                                                                                                                                                                                              |
| 11  | **Tasa de cambio y Comprobantes fiscales contra el backend real**                | Las dos pantallas de la oleada 8 solo se han visto con datos sintéticos                                                                                                                                                                                                                          |
| 12  | **Las acciones de cabecera** de cuenta, préstamo y certificado                   | Solo se han visto en el navegador                                                                                                                                                                                                                                                                |
| 13  | Las hojas de la tarjeta, contra las del original                                 | Se han comparado las pantallas, no las hojas                                                                                                                                                                                                                                                     |
| 14  | **Perfil, oficial, beneficiarios, transferencias y pagos contra la app Flutter** | La paridad de esas oleadas está verificada contra el widget Dart leído, no contra el original corriendo. **La app Flutter está instalada en el Pixel** como `com.example.bsc_mobile_app`                                                                                                         |
| 15  | **El botón atrás** en los asistentes de tres pasos                               | En el comprobante no hay flecha a propósito; hay que ver qué hace el botón físico                                                                                                                                                                                                                |
| 16  | **Compartir el comprobante**                                                     | La hoja del sistema no existe en el navegador                                                                                                                                                                                                                                                    |
| 17  | Todo lo de iOS                                                                   | Sin equipo macOS (P-13)                                                                                                                                                                                                                                                                          |

## Preguntas abiertas

Ver `11-open-questions.md`.

### Cerradas el 2026-09-17

| Pregunta                                  | Respuesta                                                                   |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| **La huella del canal**                   | ✅ Verificada contra el backend real. Ya no es una incógnita del teléfono   |
| **Cuánto se debita en una transferencia** | ✅ **Como el portal**: `totalDebited`. Aplicado en `ordenDeLaTransferencia` |
| **`BscSelect` abre una hoja**             | ✅ Aceptado como está                                                       |

### Las que bloquean ahora

1. **El portal Nuxt sigue firmando la moneda del destino.** El teléfono ya está alineado con el backend; el portal no. Encender `Enforce` rompería el portal en las transferencias que cruzan monedas. **Es la única pieza de la huella que queda.**
2. **El pago a la tarjeta de un tercero.** El usuario pidió actualizar el backend a la rama más reciente creyendo que ya estaba resuelto. **No lo está** — ver «El estado del backend» más abajo. Sigue haciendo falta la decisión: ¿se implementa en el backend o sale del alcance?
3. **El secreto del token suave.** El backend no lo devuelve, así que la pantalla del token no puede mostrar un código —ni en el porte ni en el original—. ¿Se expone `Base32Secret` en `TokenBscProvisionResponse`, o la pantalla se retira del alcance?
4. **Los umbrales de riesgo** — los 50.000 pesos que separan una operación cotidiana de una de alto riesgo son un valor por defecto nuestro, y deberían venir de configuración cuando Cumplimiento los fije.
5. **La siembra del catálogo de tipos de documento** — hoy está vacío y el alta manda siempre cédula.
6. **El nombre truncado del dispositivo** en «Mis dispositivos». Ver «Encontrado y sin resolver».

## El estado del backend, y por qué no se actualizó

El usuario pidió: «creo que el backend está desactualizado, lo habíamos trabajado me parece en otra rama, favor actualiza el backend a la última rama más actualizada». Se investigó y **la premisa no se sostiene**, así que no se tocó nada y se dejó la decisión en sus manos.

**Lo que hay:**

- La rama local es `feature/transaction-authorization`, en `fe43495` (15 de mayo).
- La rama remota más reciente con código es **`origin/feature/search-ncf`**, en `9f3c3ca` (4 de septiembre): dos commits por delante, con recuperación de contraseña, servicios IPS y resolución de hallazgos. `origin/main` es solo documentación y `origin/develop` es de febrero.
- **El muñón del pago a tarjeta de terceros sigue siendo un muñón en esa rama.** `PostApplyBeneficiaryCreditCardPaymentCommandHandler` mantiene el `//TODO : HACER TRANSFERENCIA INTERBANCARIA` con la llamada al core comentada y el `StatusId = "0"` fijo. Actualizar **no** desbloquea esa pregunta.

**Por qué no se hizo el merge, y esto es lo importante:**

El árbol de trabajo local tiene **más de mil líneas sin commitear** que no existen en ninguna rama, y son justamente las de este trabajo: `DevicesController.cs`, `TransactionAuthorizationGuard.cs`, `OperationFingerprint.cs`, `TwoFactorService.cs` (+229), `TokenBscClient.cs` (+279), `SecurityAlertService.cs`, `ISmsSender` y sus pruebas. **Diez de esos archivos también los toca `origin/feature/search-ncf`**, incluidos `TokenBscDtos.cs`, `TokenBscClient.cs`, `TwoFactorService.cs`, `Program.cs` y `DependencyInjection.cs`. Un merge conflictaría en todos ellos.

Dicho de otra forma: **el checkout local está por delante del remoto en todo lo que importa para las oleadas 5, 6 y 7.** Traer la rama remota encima es una operación que hay que hacer con cuidado y con el usuario mirando.

**Lo que sí se hizo:** una copia de seguridad completa del trabajo sin commitear, por si acaso — el parche de lo modificado y un archivo con lo no rastreado, en el directorio temporal de la sesión. No sustituye a commitearlo, que es lo que conviene hacer cuanto antes.

**Lo que hay que decidir:** si se commitea primero el trabajo local en su propia rama y luego se hace el merge, o si el trabajo local ya está recogido en otra parte y se puede descartar. Esa es una llamada del usuario, no nuestra.

Las de antes: P-14 (aceptación de seguridad), P-15.3 (autorización ya consumida), P-07 (política de librerías), el saludo del dashboard, cuál de los dos números es el plástico de la tarjeta, y la fecha de pago anterior a la de corte.

## Notas de entorno

- **Compilar Android exige** `JAVA_HOME` al JDK 17 de Microsoft y `GRADLE_OPTS=-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT`.
- **El compilador de Kotlin agota la memoria de la laptop** si arranca su propio proceso. Hay que compilarlo dentro de Gradle: `-Dkotlin.compiler.execution.strategy=in-process` con `--max-workers=1`.
- Solo `arm64-v8a` en desarrollo.
- **No ejecutar Jest y Gradle a la vez**, y pasar `--maxWorkers=2` a Jest.
- `flutter` en `C:\Users\rceballos\flutter\bin`; `adb` en `C:\Users\rceballos\Android\Sdk\platform-tools`. Ninguno en el PATH.
- **En Git Bash hay que exportar `MSYS_NO_PATHCONV=1`** antes de usar `adb` con rutas del teléfono.
- El puerto 5173 lo ocupa el portal Nuxt; la vista previa usa el **5273**.
- **Para capturar sin Playwright**: Edge en modo headless sirve — `msedge.exe --headless=new --screenshot=<ruta> --window-size=420,900 --virtual-time-budget=9000 <url>`. ⚠️ **Hay que darle un `--user-data-dir` propio a cada captura**: encadenando varias con el mismo perfil, algunas salen en blanco o no salen.
- **`BSC.TokenBSC.Api` hay que levantarlo aparte** para todo lo de dispositivos y segundo factor: `dotnet run --project src/BSC.TokenBSC.API`, escucha en el **5026**. Sin él, `/devices/register` responde 409 y el enrolamiento no arranca. No estaba anotado en ningún sitio y costó encontrarlo.
- `BSC.MobileAppRN` **no tiene remoto configurado** todavía.
