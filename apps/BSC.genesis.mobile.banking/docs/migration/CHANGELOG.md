# Changelog — Migración BSC.MobileApp → React Native

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Solo se registran cambios relevantes de la migración. **No se registran secretos, credenciales ni datos de clientes.**

---

## [No publicado]

### 2026-09-18 (21) — V-16 y V-06 cerradas: el release con R8 y la revocación

Las dos últimas verificaciones en dispositivo del alcance inicial, hechas en el
Pixel 10a con el **APK de release**, no con el de depuración.

#### V-16: la aplicación entera con R8, y cero caídas

Estaba bloqueada por D-18 y se desbloqueó al resolverse el mecanismo. El APK se
compiló con `assembleRelease -PbscBaseUrl=http://localhost:5000` y se instaló
**encima del de depuración sin borrar datos**: comparten llave de firma mientras
D-03 siga abierta, así que el almacén cifrado y el enrolamiento sobrevivieron.

| Qué se recorrió                       | Resultado                                            |
| ------------------------------------- | ---------------------------------------------------- |
| Acceso por huella                     | ✅ el diálogo del sistema dice ya «Banco Santa Cruz» |
| Dashboard                             | ✅ 18 productos con saldos reales del core           |
| Tasa de cambio                        | ✅ USD 62,25/63,75 · EUR 72,40/77,11                 |
| Perfil, Seguridad, Mis dispositivos   | ✅                                                   |
| Pagos                                 | ✅ las cuatro tarjetas con sus balances              |
| Transferencias, hasta la confirmación | ✅ comisión e impuesto consultados al servicio       |

**`adb logcat -b crash` no tiene una sola entrada de `com.bsc.mobile`.**

Lo que esto demuestra y **no se veía en depuración**: los siete módulos nativos,
el cliente HTTP, el parseo de contratos y `getAppBuild()` sobreviven a la
minificación. El pie del perfil lo dice solo: «Banco Santa Cruz · Versión 0.1.0
(100)», y ese número entre paréntesis sale del manifiesto a través del puente
nativo.

#### V-06: la revocación, verificada contra el backend

Hecha desde la aplicación. La hoja avisa con claridad —«Es el teléfono que estás
usando. Al revocarlo dejarás de autorizar con tu rostro o huella y volverás al
código de verificación»— y tras confirmar responde «Google Pixel 10a fue
revocado».

**La comprobación que vale no es la pantalla:**

```
GET /api/v1/devices
  antes   → { DeviceId: bsc-f796871f-1a0b16d4d27, Status: "Active" }
  después → { "Devices": [] }
```

La pantalla de Seguridad ofrece ahora «Registra este dispositivo para autorizar
sin código», que es el estado correcto: **un dispositivo revocado debe poder
volver a registrarse**.

⚠️ **El Pixel queda sin dispositivo enrolado.** Cualquier prueba futura que
necesite firmar una operación —una transferencia real, un pago— exige volver a
enrolarlo primero desde Perfil → Seguridad.

---

### 2026-09-18 (20) — La flecha que faltaba siete veces, el aviso de sesión que nadie escuchaba y D-18

Cuatro hallazgos encadenados, y los tres primeros salieron uno del otro. El
primero se pudo ver **porque V-04 dejó la llave de firma invalidada**, que es la
única condición en la que aparece la `TwoFactorSheet` — la hoja que dos traspasos
dieron por imposible de medir sin desenrolar el teléfono.

#### La `TwoFactorSheet`, por fin medida

Se llegó a ella con una transferencia entre cuentas propias de RD$ 1.00, y **se
canceló sin ejecutar**. Comprobado contra el core, no contra la pantalla: las dos
cuentas quedaron en 416 280,71 y 353 190,05, idénticas a antes del intento.

La hoja coincide con el original en todo menos en una cosa: su botón «Enviar
código» **no llevaba la flecha**.

#### La flecha de avance: faltaba en los siete

El original pone `trailingIcon: Icons.arrow_forward_rounded` en **siete** botones,
siempre el que lleva al paso siguiente. `BscButton` del porte declaraba `leading`
y **nada para el otro lado**: la capacidad no existía, así que los siete salían
sin flecha y ningún documento lo decía.

Se confirma en las capturas que ya había: el original dibuja «Continuar →» en el
paso 1 del asistente de transferencia y el porte dibujaba «Continuar» a secas.

| Dónde                                   | Botón                            |
| --------------------------------------- | -------------------------------- |
| El acceso                               | «Continuar»                      |
| La hoja del beneficiario                | «Transferir a este beneficiario» |
| El alta de beneficiario, paso «destino» | «Continuar»                      |
| Paso 1 de transferencia y de pago       | «Continuar»                      |
| La hoja de pagar tarjeta                | «Continuar con el pago»          |
| El segundo factor                       | «Enviar código»                  |

⚠️ **Las dos confirmaciones de los asistentes NO la llevan**, aunque compartan
`PieDelAsistente` con los pasos 1. Por eso viaja como propiedad y no como valor
fijo del componente. **Es la tercera vez que este patrón muerde.**

De paso, el botón de la hoja de acceso decía **«Entrar» donde el original dice
«Continuar»**, sin nota en ninguna parte.

#### Las notas al pie: faltaban dos de siete

`BscSheet` acepta un `footnote` y el original lo usa en siete hojas. El porte
tenía cinco.

La primera que faltaba es **un aviso antifraude** —«Nunca compartas tus
credenciales. BSC jamás te las pedirá por teléfono o correo»— y faltaba por un
motivo que conviene dejar escrito: **la hoja de acceso del porte está hecha a
mano y no usa `BscSheet`**, así que no heredó el pie. Es el mismo motivo por el
que llevaba su propia copia del cálculo del teclado en V-19. Una pantalla que
copia un componente compartido en vez de usarlo se queda fuera de cada mejora
que el componente reciba.

#### La segunda que faltaba: la pantalla entera no existía

Al buscar «Cerramos la sesión por seguridad cuando no hay actividad» apareció que
**el porte no tiene el aviso de sesión**. El original tiene `session_guard.dart`:
una hoja con cuenta atrás, titulada «Tu sesión está por cerrarse», con un botón
«Seguir conectado».

`SessionManager` **ya lo traía todo**: `onWarning`, `onWarningResolved`,
`timeRemainingMs` para la cuenta regresiva y un `extend()` cuyo propio comentario
dice «"Seguir conectado" en el aviso». **Nadie los llamaba fuera de las
pruebas.** La sesión se bloqueaba de golpe, sin los sesenta segundos que el banco
publica en `session.warning.before.timeout.seconds` y que el porte sí le pide al
backend desde la entrada 16.

Lo que el cliente perdía no es el aviso: es el formulario a medio llenar que
desaparecía con él.

⚠️ **Tercera vez con el mismo patrón** —`applyPolicy` y `setBiometricEnabled`
fueron las otras dos—: **una capacidad construida y sin conectar no la ve ninguna
prueba unitaria ni se ve leyendo la pantalla**, porque el defecto vive justo en
el hueco entre las dos.

#### D-18: el mecanismo de inyección de la URL

Autorizado por el banco, y separado en dos: _cómo_ se pone la URL es ingeniería y
está hecho; _cuál_ es la de producción sigue siendo decisión suya.

Gradle escribe `BSC_BASE_URL` en `BuildConfig` desde `-PbscBaseUrl` o desde la
variable de entorno; `DeviceIntegrityModule` la expone como **constante
síncrona** —tiene que serlo, porque el cliente HTTP se arma en el primer render—
y `config.ts` la lee en release. **Sin dependencia nueva y sin módulo nativo
nuevo.**

Sigue **sin respaldo escrito en el código**, que es lo que importa, y una prueba
lo vigila: si aparece una URL que no sea `localhost`, se pone en rojo.

Verificado sobre el artefacto:

```
assembleRelease -PbscBaseUrl=http://localhost:5000
  classes.dex            → contiene http://localhost:5000
  index.android.bundle   → 0 apariciones
```

La URL vive en la configuración nativa de la compilación, no en el JavaScript.
**Con esto V-16 deja de estar bloqueada.**

#### Y dos trampas de prueba que quedan escritas

La prueba de las notas al pie dio por perdida una que **sí estaba**, dos veces
seguidas y por motivos distintos: un texto largo llega **partido con `+`** en el
código, así que hay que normalizar el pajar igual que la aguja; y las tildes
pueden venir **precompuestas o descompuestas**, que se leen igual y no son la
misma cadena.

---

### 2026-09-18 (19) — La transferencia expresa que el original no dibuja, y la etiqueta vacía que ocupaba sitio

El pendiente decía «2 píxeles del botón Validar». Medido en el Pixel contra la
app Flutter instalada resultaron ser dos defectos mayores, uno en cada lado.

#### El original no dibuja la fila «Destino»

Barrido de píxeles sobre la captura de la app Flutter, en la sección «Destino»
de la transferencia expresa:

| Qué debería haber                | Qué hay medido                            |
| -------------------------------- | ----------------------------------------- |
| Campo «Número de cuenta destino» | **5 px de ancho (1,9 dp)**, solo el borde |
| Botón «Validar», `#00A651`       | **cero píxeles en toda la pantalla**      |

La causa, leída en el Dart y confirmada por la medida:
`BscPrimaryButton` lleva `expanded: true` por defecto, que dentro del componente
es `width: double.infinity`; un `Row` entrega a sus hijos no flexibles un ancho
**no acotado**, así que ese infinito no tiene contra qué resolverse. El botón se
lleva todo y al `Expanded` del campo no le queda nada.

**Es el único de los 32 usos del botón en toda la aplicación que no se acota.**
Los diez que van dentro de un `Row` los envuelve en `Expanded(...)`, y el único
que va suelto —`today_section.dart:211`— pasa `expanded: false` a mano. Esa
asimetría es lo que convierte esto en un descuido y no en una decisión.

**Consecuencia: en el original no se puede escribir la cuenta destino.** La
transferencia expresa de la app Flutter no se puede usar.

**Decisión: no reproducirlo.** Copiar el defecto sería entregar una pantalla
muerta. El porte dibuja lo que el original _quiso_ escribir, leído de sus
propias medidas: alto **50** —el del `SizedBox` que lo envuelve, que en Flutter
pisa el `height: 48` de dentro y por eso el 48 nunca llega a aplicarse—, ancho
**intrínseco** con los 24 de relleno lateral que el componente aplica cuando no
se expande, y la fila **centrada**, que es lo que `Row` hace por defecto y el
porte había escrito como `alignItems: 'flex-start'`. Queda como **D-30**.

#### La etiqueta vacía, que es el hallazgo que más lejos llega

Al poner las dos pantallas lado a lado el botón del porte quedaba **24,2 dp más
alto** que el centro del campo. La causa no estaba en la fila.

`BscTextField` dibujaba su etiqueta **también cuando venía vacía**, y un
`<Text>{''}</Text>` reserva su línea igual: 18 puntos de `titleSmall` más los 4
del margen, **22 en total**. Las **seis** pantallas que pasan `label=""` lo
hacen justamente porque dibujan su propio rótulo de sección encima.

Medido en dos sitios independientes, que es lo que lo cierra:

| Dónde                                         | Original | Porte antes |
| --------------------------------------------- | -------- | ----------- |
| Desfase del botón «Validar» respecto al campo | —        | 22,10 dp    |
| Separación entre «MONTO (DOP)» y su campo     | 9,9 dp   | 31,2 dp     |

La estructura del porte era correcta —`separacionGrande: 24` y
`etiqueta.marginBottom: 8` son el `SizedBox(height: 24)` y el
`SizedBox(height: 8)` del original—. La intrusa era la etiqueta. Corregido en el
sistema de diseño, como la banda de error de la entrada 13, porque el defecto no
era de una pantalla sino del componente que usan todas.

#### Y debajo del campo había otros 18 dp que tampoco son del original

Con la etiqueta quitada el botón seguía descolocado **9,71 dp**, ahora por
debajo. La causa estaba al otro lado de la caja: `BscTextField` dibujaba
**siempre** un `<Text>` bajo el campo —2 de margen más 16 de alto mínimo— «para
que el formulario no salte».

**El original no reserva nada.** Su `InputDecoration` no declara `errorText` ni
`helperText`, y Flutter solo deja sitio para esa línea cuando se le da una. En
todo el Dart **no hay un solo `errorText`**: los tres del alta de beneficiario
son un widget propio que se dibuja únicamente cuando hay error. Los errores van
en una banda al pie del formulario —que el porte también tiene—, así que el porte
los reservaba **además** de la banda, bajo cada uno de los once campos.

De paso apareció el tercero: **la caja medía 52 donde el original dibuja 50**,
que son los dos rellenos de 14 del decorador más la línea de texto. Es el mismo
caso que el botón primario, que medía 52 donde el original mide 54. Dos puntos no
se ven revisando el código, y el campo está en todos los formularios del banco.

**Verificado en el Pixel después del arreglo**, en la sección del monto:

| Qué                           | Original | Porte antes | Porte ahora  |
| ----------------------------- | -------- | ----------- | ------------ |
| Del rótulo al campo           | 9,52 dp  | 31,2 dp     | **8,76 dp**  |
| Alto de la caja               | 49,90 dp | 51,81 dp    | **49,90 dp** |
| Del campo al rótulo siguiente | 27,43 dp | 46,10 dp    | **27,05 dp** |
| Desfase entre botón y campo   | —        | 24,2 dp     | **0,00 dp**  |

El campo y el botón «Validar» ocupan ahora exactamente la misma caja. Las
medidas y sus porqués, en `medidasDelCampo.ts`.

#### Una prueba que pasó en falso, y por qué se deja escrito

La primera versión de la regresión comprobaba que el árbol no tuviera la cadena
vacía. **Pasó, y el defecto seguía ahí**: `<Text>{''}</Text>` no deja ningún nodo
de texto en `toJSON()`, así que buscar el texto no prueba nada sobre si el
elemento se dibuja. Hay que **contar elementos**, no textos. La versión buena
mira el primer hijo del nodo raíz, y falló antes del arreglo como debía. El
aviso queda en el propio archivo de prueba.

Es la tercera vez en esta migración que una comprobación mira la forma en vez del
hecho, y la primera en que se coge en el acto.

---

### 2026-09-18 (18) — El icono del banco, el arranque deja de ser una pantalla en blanco y la app pasa a llamarse «Banco Santa Cruz»

#### D-25: el icono ya no dibuja las iniciales

Hasta hoy el icono de la aplicación eran las letras «BSC» sobre un cuadrado
azul: un marcador de posición puesto a propósito y anotado como tal, porque el
único archivo de marca del repositorio es el **logotipo completo con el texto**
y recortarle el símbolo a ojo habría producido algo que nadie del banco aprobó.
En los teléfonos anteriores a Android 8 ni siquiera eso: salía el icono de la
plantilla de React Native.

El banco entregó el isotipo, y resultó **coincidir exactamente con el símbolo
que ya vivía dentro de `logo-bsc.svg`**. Eso cambia la naturaleza del trabajo: en
vez de copiar una imagen, `scripts/generar-iconos.mjs` **extrae el símbolo del
archivo de marca por programa** —separa las rutas del símbolo de las del texto,
las mide y las encaja en la zona segura— y escribe de una vez las trece piezas:

| Pieza                                     | Para qué                                              |
| ----------------------------------------- | ----------------------------------------------------- |
| Las tres capas del icono adaptativo       | Android 8 en adelante, con la monocroma de Android 13 |
| Diez PNG en cinco densidades              | Android 7 y anteriores, que la app admite (minSdk 24) |
| `ic_launcher-playstore.png`, 512 sin alfa | La ficha de Google Play                               |
| `AppIcon-1024.png`, sin alfa              | iOS                                                   |

El generador **no añade dependencias**: interpreta el SVG, rasteriza por su
cuenta y comprime con `node:zlib`. La ventaja no es ahorrarse una librería, es
que el día que el banco cambie el logotipo se sustituye un archivo, se ejecuta
`npm run iconos` y las trece piezas vuelven a cuadrar entre sí. A mano, alguna se
queda atrás y nadie lo nota hasta ver el teléfono.

Dos decisiones que conviene dejar escritas:

- **El fondo del icono es blanco**, no el azul institucional. El isotipo lleva el
  azul de la marca: sobre azul, la mitad del símbolo desaparece.
- **La capa monocroma usa relleno par-impar.** Solo admite un tono, así que las
  separaciones blancas del logotipo no se pueden pintar; con esa regla, las
  zonas donde dos piezas del símbolo se solapan se convierten en hueco, que es
  justo donde el original lleva la separación.

#### El arranque: el logotipo antes y después de que exista React Native

Era el otro detalle que delataba una aplicación a medio hacer. Al abrir, el
cliente veía **un rectángulo blanco** —la ventana de Android ya abierta y React
Native todavía sin montar— y después **un indicador de carga girando sobre el
fondo gris del sistema** mientras la aplicación lee el nombre recordado y valida
contra el banco el token guardado, que es un viaje de red.

Ahora son dos dibujos iguales que se relevan:

1. `AppTheme.Arranque` pone como fondo de la ventana el degradado de marca con
   el logotipo blanco centrado. Se pinta **antes de que exista JavaScript**, así
   que tiene que estar escrito en XML; por eso el logotipo existe también como
   `drawable/logo_bsc_blanco.xml`. `MainActivity` devuelve el tema normal en
   `onCreate`, para que ese dibujo no se quede detrás de toda la aplicación.
2. `PantallaDeArranque` repite el mismo degradado —ya con sus facetas— y el
   mismo logotipo, y añade el indicador de carga debajo.

Los dos usan el logotipo a **64 dp**, y ese es el único punto donde se pueden
desajustar: si se cambia en uno y no en el otro, el logotipo salta al entregarse
el relevo. **Hay una prueba que compara las dos medidas** y falla si divergen.

#### El icono se dibujó demasiado grande, y se corrigió el mismo día

La primera versión puso el símbolo a **65 dp** sobre el lienzo de 108. Cumplía
la línea maestra circular de Material —66 dp— y aun así llenaba la máscara de
borde a borde: en la pantalla de inicio del Pixel se veía desproporcionado al
lado de los demás iconos. **No se recortaba**; lo que le faltaba era margen. Lo
detectó el usuario mirando el teléfono, que es donde se ve.

Corregido a **52 dp**, el 72 % del área que la máscara deja ver. Dos cosas
cambiaron además del número:

- **El tamaño se mide ahora por el círculo que envuelve al símbolo**, no por su
  caja. La máscara del lanzador es redonda, así que un dibujo puede caber en el
  cuadro de 72 dp y asomar por las esquinas del círculo. Aquí da casi igual
  —el isotipo es casi circular— pero la regla queda escrita en términos que
  siguen valiendo si el símbolo cambia de forma.
- **Las piezas de tienda se separaron, a 62 dp.** La ficha de Google Play y el
  icono de iOS son cuadrados y nadie les aplica máscara circular; con el tamaño
  del lanzador el símbolo se veía perdido en medio del cuadro.

Queda fijado por prueba: se leen las coordenadas de la capa de frente, se
calcula el radio del dibujo desde el centro y se falla si el diámetro supera los
66 dp. **Se comprobó que la prueba puede fallar** volviendo el icono a su tamaño
anterior antes de darla por buena.

#### D-29: la aplicación ya se llama «Banco Santa Cruz»

Abierta y cerrada el mismo día. El nombre bajo el icono era `BSCMobileAppRN`, el
identificador del proyecto —la app Flutter arrastra el mismo defecto, dice
`bsc_mobile_app`—. El banco eligió **«Banco Santa Cruz»**: es la marca y es lo
que el cliente teclea al buscar. Se descartó «BSC en Línea», que es el nombre del
portal web y en un teléfono se lee como otro producto.

Aplicado en `values/strings.xml` y en `CFBundleDisplayName`. **Hay dos nombres y
solo se cambió el visible**: el `name` de `app.json`, que
`MainActivity.getMainComponentName()` repite, es con lo que `AppRegistry` publica
el componente raíz, y cambiarlo deja la aplicación con una pantalla roja cuyo
error no menciona el archivo donde está la causa. Los dos quedan fijados por
prueba.

#### Lo que no se verificó

- **No se probó en el teléfono.** El cajón de aplicaciones, los iconos temáticos
  de Android 13 y el arranque en frío exigen el Pixel. Los pasos están en
  [`18-icono-de-la-aplicacion.md`](./18-icono-de-la-aplicacion.md).
- **iOS queda escrito y sin compilar**, como todo lo de iOS: no hay equipo macOS.

### 2026-09-18 (17) — La llave que se invalida sola, el beneficiario que bloqueaba su propia cuenta y V-16 reclasificada

#### V-04: la huella nueva invalida la llave, y la app se entera sin que el cliente lo descubra tarde

El usuario inscribió una segunda huella en los ajustes del Pixel. La medida no
es de la aplicación sino del sistema: `dumpsys fingerprint` pasó de
`"prints":[{"id":0,"count":1}]` a `"count":2`.

La pantalla de Seguridad respondió sola, sin reiniciar la aplicación:

| Qué                       | Antes     | Después                                                                                 |
| ------------------------- | --------- | --------------------------------------------------------------------------------------- |
| «Autorizar con tu huella» | Encendido | **Apagado**, con el subtítulo «Necesita volver a registrarse»                           |
| Banda de aviso            | Ninguna   | **«La llave dejó de ser válida · Suele pasar cuando cambia la biometría del teléfono»** |

Esto es lo que valida el diseño de `hasUsableKey()` en `DeviceKeyModule.kt`, y
su comentario lo había anticipado: **una llave invalidada sigue cargando del
Keystore sin dar error**, y solo `initSign` la rechaza con
`KeyPermanentlyInvalidatedException`. Comprobar que la llave _exista_ habría
dado el interruptor por bueno y el cliente se habría enterado a mitad de una
transferencia, con la pantalla de Seguridad diciéndole que todo estaba bien y
sin ninguna forma de arreglarlo. **V-04 cerrada.**

#### D-28: cancelar un alta de beneficiario bloquea volver a registrar esa cuenta

La sesión anterior dejó un beneficiario a medias —la cuenta 11042010013953,
registrada para llegar al paso del segundo factor y cancelada sin confirmar—.
Al ir a limpiarlo salió que no era solo basura de prueba.

El registro queda en `PendingVerification`, y la lista pide **solo los activos**
—igual que el original, y con razón: ofrecer para transferir algo que el backend
va a rechazar sería peor—. Así que el cliente **no lo ve**. Pero
`ExistsByAliasAsync` cuenta todos los no borrados, y el alias que se le asignó es
el nombre del titular que devuelve el core.

Medido contra el BFF real, sin crear nada nuevo porque la petición se rechaza:

```
POST /api/v1/beneficiaries/add-internal-bank   → 400
  "Ya existe un beneficiario con el alias 'MWZ4JP 2J9WPPN4 XWM2SJZW'"
```

El cliente queda sin poder registrar esa cuenta, con un mensaje que nombra algo
que no aparece en ninguna pantalla: no puede ni corregirlo ni borrarlo. Está en
`ExistsByAliasAsync`, del backend, así que **afecta igual al original y al
portal**; no es una divergencia del porte. Queda como **D-28**, con la
recomendación de que el alta reutilice el registro pendiente del mismo cliente y
la misma cuenta en vez de rechazarlo. El registro huérfano se borró —borrado
lógico— y la lista bajó de 35 a 34.

⚠️ **Quedan diecinueve registros `PendingVerification` más**, de enero y del
sembrado de datos. No se tocaron: no son de esta migración.

#### V-16 no estaba pendiente por falta de tiempo: está bloqueada por D-18

El APK de release se reconstruyó con R8 —3 m 49 s, 21 979 487 bytes— con los
arreglos de V-19 y la política de sesión dentro. Y entonces la comprobación
sobre el artefacto, no sobre el código:

```
unzip -p app-release.apk assets/index.android.bundle | grep -c localhost:5000
  → 0
```

**El paquete de release no lleva ninguna URL de backend.** `config.ts` elige con
`__DEV__` y la rama de producción deja `baseURL` vacía a propósito (T-10), así
que un release instalado hoy **no pasa de la pantalla de acceso**. Recorrer la
aplicación entera con R8 activo —que es lo que V-16 pide— no se puede hacer
hasta que exista el mecanismo de inyección de la URL.

Lo que sí se pudo comprobar del artefacto es que **R8 no se lleva los módulos
nativos**: los siete de `com.bsc.mobile.security` aparecen en `mapping.txt`
mapeados a sí mismos, sin renombrar. Lo que no se puede comprobar sin ejecutarlo
es el resto, y por eso V-16 sigue abierta.

**Recomendación:** separar D-18 en dos. _Cuál_ es la URL de producción es
decisión del banco y puede esperar; _cómo se inyecta_ es mecanismo, hoy no
existe, y sin él V-16 no se cierra ni ahora ni antes de publicar. Se puede
resolver con un `buildConfigField` de Gradle leído por el módulo nativo que ya
existe, **sin dependencia nueva**.

#### El botón «Validar» de la expresa es más que dos píxeles

Venía anotado como una diferencia de 2 puntos de alto. Al recorrer los **32**
usos de `BscPrimaryButton` en el Dart aparece algo mayor. El componente lleva
`expanded: true` por defecto, que es `width: double.infinity`, y dentro de un
`Row` Flutter da ancho **no acotado**, así que ese infinito no tiene contra qué
resolverse. El original lo evita siempre:

| Dónde                                       | Cómo acota el ancho          |
| ------------------------------------------- | ---------------------------- |
| Los diez botones que van dentro de un `Row` | Envueltos en `Expanded(...)` |
| `today_section.dart:211`                    | `expanded: false` a mano     |
| **`transfer_step_form.dart:257`**           | **Ninguna de las dos**       |

Es el único de toda la aplicación. Y el porte, por su parte, le puso
`botonExpreso: { width: 104 }`, un número **sin equivalente en el original** y
sin justificación escrita en ninguna parte. Lo que hay que medir en el teléfono,
entonces, no es una altura: son el alto, el ancho y si la fila desborda. Pendiente
de la comparación contra la app Flutter instalada.

---

### 2026-09-18 (16) — La barra de navegación que faltaba, la política que nadie pedía y el pie de los asistentes

Tres frentes: cerrar V-19 en el teléfono —donde resultó que el arreglo anterior
se quedaba corto—, portar la política de sesión que el porte nunca pedía, y
pasar los asistentes de transferencia y de pago por el método de las medidas
literales.

#### V-19: el arreglo anterior no bastaba, y los números lo dicen

La sesión anterior dejó la hoja descontando el teclado. Verificándolo en el
Pixel con la hoja de alta de beneficiario abierta, el botón «Validar cuenta»
seguía **21 píxeles por debajo del borde del teclado**, y el relleno inferior
del pie no se veía en absoluto.

`dumpsys window displays` dio la causa sin margen de duda:

| Qué                                    | Píxeles |
| -------------------------------------- | ------- |
| Pantalla (`wm size`)                   | 2424    |
| Teclado real (`InsetsSource type=ime`) | 965     |
| Barra de navegación (`navigationBars`) | 63      |
| Lo que la hoja había reservado         | 902     |

**965 − 902 son exactamente los 63 de la barra de navegación.** La causa son dos
sistemas de coordenadas distintos: `keyboardDidShow` mide el teclado contra la
**ventana de la aplicación**, que no incluye la barra de navegación, y un
`Modal` con `statusBarTranslucent` se dibuja sobre la **pantalla entera**.
Reservar lo que React Native reporta deja sin cubrir justo esa banda, y ahí es
donde cae el final de la hoja: los 16 puntos de relleno del pie y los 8 últimos
del botón de 54.

Es **la misma trampa que la del 0,92**: el número copiado era correcto y el
resultado seguía estando mal, porque el marco lo interpreta en otra escala. Y es
la segunda vez en dos sesiones que muerde en el mismo componente.

`espacioQueTapaElTeclado`, en `altoDeLaHoja.ts`, reúne la reserva y la usan las
dos hojas: `BscSheet` y la de acceso, que llevaba su propia copia del cálculo.
La prueba de regresión se escribió antes del arreglo, con las medidas del
sistema como constantes en vez de números elegidos.

✅ **Verificado en el Pixel en las tres hojas** —acceso, segundo factor y alta de
beneficiario—: el pie termina en 1417 y el teclado empieza en 1459, y los 42
píxeles de diferencia son los 16 puntos de relleno del pie. **V-19 cerrada.**

#### La política de sesión: el porte nunca se la pedía al banco

El porte tenía `applyPolicy` en el gestor de sesión y **nadie lo llamaba** fuera
de las pruebas, así que usaba siempre los diez minutos de
`DEFAULT_SESSION_POLICY`. El original sí lo hace: `SessionPolicyService.fetch()`
con un `_loadPolicy()` que lo aplica al autenticarse.

Backend leído completo antes de portar —controlador, DTO **y manejador**—, y el
manejador resultó **real, no un muñón**: `SystemSettingService` lee las filas por
categoría y cae a sus mismos valores si la tabla falla. Leído del BFF levantado:

```
GET /api/v1/configuration/public/Session
  session.timeout.inactivity.minutes       10
  session.warning.before.timeout.seconds   60
```

**La omisión no se veía porque hoy los dos números coinciden**: el backend
responde diez minutos, que es justo el valor por defecto del porte. Se vería el
día que el banco cambie la política, que es el día en que importa. La prueba deja
esa coincidencia escrita, para que nadie la confunda con que funcionaba.

`politicaDeSesion.ts` porta la tolerancia de nombres del original —la clave del
DTO y su versión con la primera en minúscula, números como texto— y descarta una
inactividad de cero o negativa, que dejaría la sesión cayéndose sin parar. Un
fallo no interrumpe a nadie: se conserva la política por defecto y el cliente
entra igual. `darSesionPorIniciada` reúne el marcado y la carga en los tres
puntos de `AppRoot` donde se da la sesión por autenticada.

#### Los asistentes, por el método de las medidas literales

Dos diferencias, cada una con su prueba de regresión escrita antes del arreglo.

| Dónde                          | Qué                                                                                                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Los cuatro pasos del asistente | **Los botones del pie medían 54.** El original escribe `height: 50` a mano en los cuatro `_bottomBar`, pisando el 54 por defecto de `BscPrimaryButton`                 |
| Formulario de transferencia    | **«Cargando beneficiarios…» iba sin indicador.** El original pone un `CircularProgressIndicator` de 18 con trazo 2 y 12 de separación; el porte solo escribía el texto |

El del pie merece una nota, porque es el patrón que más se repite en esta
migración: **quien mira solo el componente compartido porta el valor por defecto
y no se entera de que la pantalla lo pisa**. Aquí lo pisaban las cuatro
—formulario y confirmación de transferencia, y los dos de pago—, así que el mismo
error salía cuatro veces y justo en el botón más grande de cada pantalla. Los
cuatro pies eran además el mismo marcado copiado; ahora son `PieDelAsistente`, y
**la prueba renderiza ese componente y mira el alto que los botones acaban
aplicando**, en vez de buscar el número en el código.

El indicador de 18 ya estaba declarado en `DIAMETROS_DE_CARGA` como «junto a un
campo del formulario de transferencia» y no lo usaba nadie: la medida estaba bien
y el sitio donde tenía que ir se había quedado sin ella.

⚠️ **Un 48 no siempre es un botón.** El `height: 48` de los comprobantes es el
círculo de un icono de acción, no un control, y cambiarlo habría estropeado la
fila de «Compartir». Se comprobó leyendo el widget, no buscando el número.

**Las tres vistas de detalle —cuenta, préstamo y certificado— pasaron por el mismo
método y no apareció ninguna diferencia**: el anillo de 120, el 22 y el 10 del
certificado, los rellenos de 16 y el remate de 32 al final ya coincidían.

#### D-27: el cajón de navegación no está portado

Salió al ir a aplicarle el método: **`bsc_drawer.dart` no existe en el porte**, y
ningún documento lo decía. En el original, tocar el avatar del dashboard lo abre;
en el porte ese mismo toque lleva a la pestaña Perfil.

Ningún destino queda inalcanzable: los **siete activos** del cajón se llegan por
las pestañas inferiores y la hoja de Acciones, que son las mismas del original.
Lo que falta es la superficie, las **cuatro entradas «Próximamente»** —las cuatro
`enabled: false` en el original— y la cabecera con el logotipo, cuyo código de
cliente y sucursal **sí están** en la pantalla de Perfil del porte.

La recomendación del equipo es **no portarlo**: dos superficies de navegación
para los mismos destinos es navegación redundante, lo único exclusivo del cajón
son cuatro entradas que no funcionan, y no es un camino de dinero. Queda en
`13-pendientes.md` como **D-27**, para Producto, y es reversible.

**La matriz de trazabilidad estaba mintiendo otra vez**: daba CT-11 por
«Verificado» sin cubrir esta superficie. Corregida a «Portado», con la omisión
dicha.

#### Y `verify` no fallaba con dos hallazgos, sino con tres

El traspaso venía diciendo que `npm run verify` falla con **dos** hallazgos y que
eso es correcto. **Fallaba con tres.** El paso de formato ya estaba en rojo en
`ed2c8e3`, el commit con el que empezó esta sesión, y con **42 archivos**: se
comprobó restaurando ese árbol y corriendo `format:check` sobre él.

La diferencia importa porque los otros dos —D-03 y D-02— son **decisiones del
banco**, y este no: es un defecto del porte, y se arregla corriendo el
formateador. Corregido, sin una sola línea de lógica tocada; la mayoría eran
importes que caben en una línea y estaban partidos en varias.

**1076 pruebas: 1069 en verde y 7 omitidas.** 79 suites. TypeScript estricto y
ESLint sin errores. `npm run verify` deja ahora **9 en verde, 1 fallido y 7
pendientes**, y el único fallido es «Configuración de release», que son D-03 y
D-02. Eso sí es lo correcto.

### 2026-09-18 (15) — Las ocho pantallas que faltaban, la sesión que se bloquea y el botón que no se veía

Sesión de tres frentes: la paridad de las pantallas que quedaban sin pasar por
el método, la decisión del banco sobre D-26, y dos defectos encontrados en el
Pixel —uno de ellos reportado por el usuario mientras se probaba otra cosa—.

#### Paridad: ocho diferencias más en las ocho pantallas que faltaban

Beneficiarios, seguridad, token, mis dispositivos, tasa de cambio, comprobantes
fiscales, perfil y oficial de cuenta. La comparación de textos no había
encontrado nada en ellas; las medidas sí. Cada diferencia con su prueba de
regresión escrita **antes** del arreglo.

| Dónde                        | Qué                                                                                                                                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Comprobantes fiscales        | El encabezado «Comprobantes» salía **pegado al borde**: se dibujaba sin estilo, y `BscSectionHeader` del porte no trae el relleno que el original sí trae de serie                                 |
| Dashboard                    | Enseñaba un círculo girando donde el original monta **una silueta de lo que va a llegar**, para que la página no dé un salto al aterrizar los datos. Portada con `Animated`, sin dependencia nueva |
| Toda la aplicación           | **Los indicadores de carga medían 20** —el valor por defecto de React Native— donde el original escribe 24, 26, 28 o 36                                                                            |
| Toda la aplicación           | **El botón medía 52 de alto y 16 de relleno lateral**; el original dice 54 y 20                                                                                                                    |
| Tasa de cambio               | La vista de error no es el estado vacío genérico: el original tiene **una propia**, con el icono en rojo a 48 y sin círculo ni título                                                              |
| Seguridad y Mis dispositivos | El separador dentro de una tarjeta iba **sangrado 16 a cada lado**, donde el original escribe un `Divider` a todo el ancho                                                                         |
| Seguridad y Mis dispositivos | El texto de las hojas de confirmación, a 14 sin interlínea, donde el original hereda `bodyMedium`: **13.5 con interlínea 1.45**                                                                    |
| Comprobantes y Perfil        | El botón «Consultar» perdía el `height: 48` del original, y Perfil tenía un indicador de carga que el original no tiene                                                                            |

**Los indicadores merecen una nota**, porque es el hallazgo más extendido:
`ActivityIndicator` de React Native mide **20×20** cuando no se le dice nada, y
`CircularProgressIndicator` de Flutter **nunca baja de 36**. Casi todos los
indicadores del porte medían poco más de la mitad que los del original, y en una
pantalla que solo enseña un círculo girando sobre fondo vacío eso es toda la
pantalla. El 36 no está escrito en el repositorio del banco —es la constante
`_kMinCircularProgressIndicatorSize` del SDK—, así que **la prueba lo lee del
propio SDK de Flutter** en vez de fiarse de un número copiado a mano.

Tres módulos de medidas nuevos: `medidasDeLosIndicadoresDeCarga.ts`,
`medidasDeLosControles.ts` y `medidasDeLasOchoPantallas.ts`, cada uno con su
prueba de dos mitades.

**Y una lección sobre el propio método.** El primer intento escribió **16** para
el relleno lateral del encabezado de sección, porque casi todo lo demás de esa
pantalla va a 16; `BscSpacing.gutter` son **20**. La prueba estaba en verde
porque solo comprobaba que el original mencionara los _nombres_ de los tokens.
Ahora lee sus **valores** de `bsc_spacing.dart`. Una comprobación que mira la
forma y no el hecho se rompe en silencio, y esta vez se rompió a favor del error.

#### D-26: el canal no compensa, y se escala al core

El usuario decidió: **«respetemos lo que trae el bus de servicios desde el core y
mostremos lo que viene de allá. Voy a indicar que hagamos lo correcto en core si
está mal»**.

Se recorrió el camino completo del dato para poder escalarlo. El BFF copia
`Minimum_payment_tc_rd` y `Minimum_payment_tc_us` **uno a uno** en
`ProductDto.GetProduct`, líneas 43-44, y no hay ninguna otra asignación de esos
campos en todo el backend. Los tres canales los leen tal cual. La inversión está
en el servicio de listado del core o en su mapeo en el bus App Connect; el
servicio de detalle del mismo core los entrega bien.

Se descartó que el dashboard pidiera el detalle de cada tarjeta: **añade una
llamada por tarjeta a la pantalla de entrada**, que es la que más veces se abre.

Todo en [`19-d26-pago-minimo-invertido.md`](./19-d26-pago-minimo-invertido.md),
escrito para el equipo del core. Sale además **un cuarto efecto que no estaba
registrado**: «Para hoy» decide qué tarjetas listar mirando el campo cambiado,
así que una tarjeta con mínimo en pesos y sin mínimo en dólares **no aparece**
entre los pendientes. No enseña una cifra mal: no avisa.

#### La entrada por huella: faltaba la mitad grande

La sesión anterior corrigió **qué token se mira**. Probándolo en el Pixel el
botón seguía sin funcionar: respondía «Tu sesión expiró» **sin llegar a pedir el
dedo**, que es la comprobación previa diciendo que no hay token de refresco. Lo
que faltaba era que ese token **siguiera existiendo**. Dos capas:

1. **El porte llamaba a `auth.logout()`** al vencer la inactividad, y esa llamada
   hace `POST /auth/logout`, que invalida el token de refresco **en la base de
   datos del backend**. El original no la hace: `session_guard.dart` dispara
   `SessionExpired`, que solo limpia en local, mientras que cerrar sesión sí pasa
   por el repositorio. Paridad pura.
2. **El borrado local se llevaba el token de refresco** — también en el original,
   cuyo `clearSession` borra los tres tokens pese a que su comentario dice que
   sirve para «keep device binding & biometric config». La huella no obtiene
   credenciales nuevas del banco: lo único que hace es reanudar con el token de
   refresco, al que el backend da **siete días** (`JwtTokenService.cs:17`). Sin
   él, el botón llevaba desde el principio prometiendo algo imposible, en las dos
   aplicaciones.

La segunda capa era decisión del banco porque cambia la postura de seguridad, y
se decidió: **la inactividad bloquea, no cierra**. Se tira el token de acceso y
se conserva el de refresco; pasados los siete días, o si el servidor lo rechaza,
se piden credenciales. `finDeSesion.ts` reúne los cuatro finales y qué hace cada
uno; `lockSession` es el bloqueo, y `clearSession` se queda para los finales que
sí se llevan la llave.

✅ **Verificado de punta a punta en el Pixel, y es la primera vez que esta
función se ve funcionar en todo el proyecto.** Sesión a las 10:56, bloqueo
automático por inactividad a las 11:13:36, pantalla de acceso, «Entrar con tu
huella», el diálogo del sistema abrió y verificó, y entró al dashboard con datos
reales. Las dos mediciones que lo demuestran: el almacén cifrado bajó de **10 a
8** entradas —el bloqueo se llevó el token de acceso y su caducidad y **dejó el
de refresco**— y **el diálogo llegó a abrirse**, donde antes salía «Tu sesión
expiró» sin pedir el dedo.

⚠️ **Sale de aquí una omisión aparte:** el porte **nunca pide la política de
sesión al backend**. El original tiene `SessionPolicyService.fetch()` y un
`_loadPolicy()` que la aplica al autenticarse; el porte tiene `applyPolicy` en
el gestor de sesión y **nadie lo llama** fuera de las pruebas, así que siempre
usa los diez minutos por defecto. El backend publica el suyo bajo la clave
`session.timeout.inactivity.minutes`. Si el banco cambia la política, la app
móvil no se entera.

#### El botón de la hoja no se veía con el teclado abierto

Lo reportó el usuario probando en el Pixel: en la hoja de acceso, «Entrar» queda
por debajo del borde de la pantalla con el teclado abierto.

Es una diferencia entre Flutter y React Native que no se ve leyendo el porte,
porque el porte había copiado el número correcto. El original limita la hoja a
`media.size.height * 0.92`, pero **en Flutter las restricciones del padre mandan
sobre las del hijo**: la hoja vive dentro de un `Padding(bottom:
viewInsets.bottom)` que ya le quitó el alto del teclado, y
`BoxConstraints.enforce` recorta ese 0,92 al espacio que de verdad queda. En
React Native no hay tal recorte: el 92 % se mide contra la pantalla entera y el
sobrante se sale por abajo. Lo que se sale es el final de la hoja, que es donde
está el botón.

El arreglo va en `BscSheet`, no solo en la pantalla de acceso: la hoja del
sistema de diseño **no miraba el teclado en absoluto**, así que alcanzaba a todas
las hojas con campos —el segundo factor, el alta de beneficiario, el rango de
fechas—. De paso, la hoja de acceso tenía **0,90** escrito a mano donde el
original dice **0,92**.

**1027 pruebas: 1020 en verde y 7 omitidas.** 77 suites. TypeScript estricto y
ESLint sin errores. `npm run verify` sigue con **dos hallazgos, D-03 y D-02**,
que es lo correcto.

### 2026-09-18 (14) — Paridad pantalla por pantalla, y la huella que no entraba nunca

Sesión de dos mitades: primero sin teléfono, aplicando a toda la aplicación el
método que ya había encontrado diez diferencias en los comprobantes; después con
el Pixel conectado, verificando lo corregido.

#### El defecto más grave: la entrada por huella no funcionó nunca

Lo encontró el usuario al probarla en el teléfono. La huella se acepta —el
diálogo del sistema confirma la identidad— y acto seguido la pantalla responde
«Tu sesión expiró». Siempre. Son **dos defectos encadenados**:

1. **El token equivocado.** El porte comprobaba el de **acceso**, que vive
   minutos, donde el original comprueba el de **refresco**, que es el de larga
   vida (`biometric_login_usecase.dart`). Con el de acceso caducado —es decir,
   casi siempre— la condición fallaba aunque el banco siguiera reconociendo al
   cliente.
2. **La bandera que no escribía nadie.** `setBiometricEnabled` está declarada en
   el almacén seguro del porte **y en `secure_storage.dart` del original**, y
   ninguna de las dos aplicaciones la llama nunca. Con la bandera siempre en
   falso, `BiometricLoginUseCase` del original devuelve «Autenticación biométrica
   no configurada» **siempre**: la pantalla de acceso lleva desde el principio
   ofreciendo un botón que no podía llevar a ninguna parte, en las dos
   aplicaciones.

Corregido: la bandera se activa tras un inicio de sesión con credenciales
aceptado —el único momento en que el cliente está autenticado y hay tokens que
guardar—, se **apaga** si el teléfono ya no tiene biometría utilizable, y la
comprobación se hace **antes** de pedir el dedo, no después.

**Este defecto no se veía en el navegador ni en una sesión recién abierta**, que
es donde se venía probando: con el token de acceso fresco funcionaba. Solo
aparece al volver a la aplicación un rato después, que es como se usa de verdad.

#### D-26: el pago mínimo llega invertido entre monedas

Perseguido desde una sospecha del usuario —«el 174 coincide con el mínimo en
pesos»— y confirmado contra el ambiente real:

| Fuente                                 | \*\*\*\*7147 en RD$ | \*\*\*\*7147 en US$ |
| -------------------------------------- | ------------------: | ------------------: |
| `products/get-products-by-customer-id` |              174.04 |            2,311.41 |
| `products/details`                     |            2,311.41 |              174.04 |

**Cuál es el bueno se decide sin preguntar**: el detalle es coherente consigo
mismo y el listado no. En la tarjeta \*\*\*\*7473 el listado afirma un mínimo de
**US$ 1,351.82** sobre un saldo al corte en dólares de **US$ 122.34** — once
veces lo que se debe. El detalle coloca esa cifra en pesos, donde el corte es
RD$ 22,347.33 y el mínimo sale al 6 %.

**Ni el porte, ni el portal Nuxt, ni la app Flutter invierten nada**: los tres
leen `MinimumPaymentTcRd` y `MinimumPaymentTcUs` tal cual, y el BFF los copia uno
a uno desde `CoreBankingProduct`. El origen es el core y no se corrige desde el
canal (P-03). **El banco decidió que la aplicación pida el detalle** de la
tarjeta que se va a pagar y use su cifra; se usa el mismo repositorio que la
pantalla de detalle, sin endpoint ni dependencia nuevos.

⚠️ **Sigue sin compensar en dos sitios**, y se ve en el teléfono: el dashboard
anuncia «Pago mínimo: RD$ 174.04» para la \*\*\*\*7147 y la pestaña de Pagos lo
lista igual. Los dos leen el listado. Anotado, no corregido: compensar en cada
pantalla multiplica el parche, y lo que corresponde es arreglar el origen.

#### La moneda y el producto se perdían al entrar al pago desde la tarjeta

El original compone `/payments?type=creditCard&product=…&currency=DOP|USD`. El
porte navegaba **solo con el tipo**, así que al abrir el pago desde una tarjeta
con el ciclo en US$ delante, el asistente caía en la primera tarjeta del cliente
y en pesos — sin selector de moneda, porque esa primera tarjeta no tiene ciclo en
dólares. El cliente había dicho dos cosas y el asistente no recibía ninguna.

**Verificado en el Pixel**: el asistente abre con «MONEDA · US$», «Pago Mínimo
US$ 174.04» y «Se aplicará a \*\*\*\*7147».

#### Paridad: siete diferencias más con el original

Todas encontradas leyendo el widget Dart, ninguna visible revisando el porte, y
cada una con su prueba de regresión escrita **antes** del arreglo.

| Dónde                         | Qué                                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hojas del detalle de tarjeta  | **Cuatro separaciones**: un único estilo `bloque` con `marginTop: md` hacía de comodín donde el original escribe `lg`, `sm` y `xxs`                    |
| Formulario de pago (paso 1)   | El **orden** —pedía la cuenta antes que el monto— y dos rótulos: «Cuenta a Debitar» por «Cuenta Origen», «Moneda del ciclo» por «Moneda»               |
| Formulario de pago (paso 1)   | La separación antes del bloque de moneda era 12 donde el original escribe 24                                                                           |
| Confirmación de pago (paso 2) | Había **copiado la estructura de transferencias**: «Detalles» por «Detalles del Pago», la cuenta antes del monto, y el desglose de conversión al revés |
| Confirmación de pago (paso 2) | El primer renglón decía «Monto a Aplicar» donde el original escribe **el nombre de la opción elegida** —«Pago Mínimo»—                                 |
| Detalle de producto           | **El detalle que no carga se tragaba sin avisar.** El original sustituye la vista entera por «No pudimos cargar la cuenta» con «Reintentar»            |
| Dashboard                     | Dos palabras de más en el estado vacío: «Cuando abras una cuenta **con nosotros** aparecerá aquí»                                                      |

El aviso del detalle de producto merece una nota: un comentario del código
afirmaba que tragarse el fallo era «lo que hace el original», y no lo era. Es la
**segunda vez** que un comentario de ese tipo resulta falso —la otra es la
biometría—, así que la afirmación se verifica leyendo el Dart, no se hereda del
comentario.

#### Lo demás

- **El mes sin datos deja de callarse.** El estado de cuenta de un mes sin
  movimientos agota los treinta segundos y caía en «Intenta de nuevo», que invita
  a repetir lo mismo. Ahora la fila dice «Preparando el documento…» mientras
  espera, y el mensaje distingue el banco que **no contestó** del banco que
  contestó que no.
- **Icono de la aplicación (D-25)**: andamiaje completo del icono adaptativo
  —dos capas, color de fondo como recurso propio y la variante monocroma de
  Android 13, que es la que más se olvida—. La capa de frente es un **marcador de
  posición declarado**, no un intento de icono.
  [`18-icono-de-la-aplicacion.md`](./18-icono-de-la-aplicacion.md) dice
  exactamente qué archivo hace falta y con qué medidas. Verificado con `aapt2`
  **sobre el APK**, no sobre el código.
- **Dos suites de componente** con `react-test-renderer`, que ya estaba
  declarado: `HojaDePago` y `PaymentStepForm`. Sin dependencias nuevas.
- **`verify.mjs` decía algo que ya no era cierto**: anunciaba las pruebas de
  componentes como bloqueadas por `@testing-library/react-native`. Ahora nombra
  lo que de verdad falta: poder **pulsar** un control y esperar el efecto.
- **Matriz de trazabilidad**: diez filas decían «Inventariado» para cosas
  escritas y verificadas, y los identificadores de «diferencias deliberadas»
  **colisionaban** con los de las decisiones del banco. Pasan a `DD-xx`.

#### Verificado en el Pixel 10a en esta sesión

- La moneda y el producto viajando al asistente de pagos, con el mínimo del
  detalle.
- Los rótulos y el orden del paso 1 y del paso 2, contra el original.
- Las hojas de la tarjeta con las separaciones corregidas.
- **V-12 cerrada**: las cuatro acciones de cabecera que faltaban —«Simulador» y
  «Estados» del préstamo, «Compartir» y «Cuenta de abono» del certificado—.
- El icono adaptativo dentro del APK.

**957 pruebas: 950 en verde y 7 omitidas.** 71 suites. TypeScript estricto y
ESLint sin errores. `npm run verify` sigue con **dos hallazgos, D-03 y D-02**,
que es lo correcto.

### 2026-09-17 (13) — Validación en el Pixel: cinco defectos, uno de dinero

Sesión con el teléfono conectado, recorriendo las verificaciones V-01…V-17 de
[`13-pendientes.md`](./13-pendientes.md) §2. Lo que sigue **se vio en un
dispositivo real contra el backend y el core**, no en el navegador.

#### El defecto de dinero, y por qué el comprobante no lo delataba

Una transferencia de RD$ 100.00 entre dos cuentas del mismo cliente acreditó
**100.15** al destino y debitó **100.30** del origen. El comprobante anunciaba
las tres cifras mal: 100.00 acreditados, 100.15 debitados y un saldo nuevo que
no era el real.

La causa: el canal enviaba `transactionAmount = monto + comisión + impuesto`.
**El core calcula el impuesto de forma intrínseca y lo cobra en un movimiento
aparte** —«Imp. 1.5 Por 1000 S/Ley 288-04», verificado en el listado de
movimientos del core—, así que interpreta lo que recibe como el monto a
transferir: acredita de más y recalcula el impuesto sobre la cifra inflada. En
una transferencia a un tercero eso significa **mandarle al beneficiario más
dinero del que el cliente escribió**.

La regla del banco, confirmada en esta sesión: **se envía el monto; el impuesto
y el total a debitar solo se muestran**, y el servicio de comisiones se
consulta siempre, porque es él quien dice si corresponde cobrar.

Esto **corrige la base de F-02**. Se había cerrado seguir al portal ante la
divergencia sobre cuánto debitar; la medición demuestra que en este punto **la
app Flutter tenía razón**. El portal Nuxt manda `store.totalDebited`
(`useTransferExecution.ts:55`) y además calcula el saldo nuevo en el cliente,
así que su pantalla siempre cuadra consigo misma y el error no se ve: **el
portal arrastra el defecto a producción**. Queda levantado como hallazgo y no
se toca desde aquí.

Verificado tras el cambio en las mismas dos cuentas: al destino le llegan
100.00 exactos y del origen salen 100.15.

#### V-05 cerrado: la banda que no aparecía era una banda sin ancho

La instrumentación puesta para esto respondió en el teléfono que **la hipótesis
del remontaje era falsa** —un solo montaje, la promesa resuelta y el aviso
escrito— y que el nodo sí se dibujaba: medía 152 píxeles y dentro solo llevaba
el icono. La banda vive dentro de un contenedor con `alignItems: 'center'`, que
encoge a sus hijos al tamaño de su contenido; como su columna de textos usa
`flex: 1`, se quedaba en cero y el texto desaparecía.

Se corrige en el sistema de diseño, porque **otras once pantallas usan la misma
banda**. La prueba usa `react-test-renderer`, que ya estaba declarado: no añade
dependencia y no toca D-14.

#### El comprobante no se veía como el original

Nueve diferencias en el de transferencias y una más en el de pagos, **ninguna
de ellas en los tokens de diseño**: son valores que el widget Dart escribe a
mano. La más visible, que el original dibuja el icono de cada fila dentro de
una caja de 36×36 y el porte lo pintaba suelto. El de pagos, además, había
sustituido las dos filas con icono por renglones sueltos.

`_receiptRow` pasa a ser una sola pieza, `BscReceiptRow`, en el sistema de
diseño, y las medidas quedan en `medidasDelComprobante.ts` con una prueba de
paridad que **lee los dos widgets Dart** y comprueba además que la hoja de
estilos las usa: sin esa segunda mitad, alguien podría volver a escribir un 12
a mano y la prueba seguiría en verde.

#### El aviso de éxito que se anunciaba como fallo

Al completar el enrolamiento, la pantalla de Seguridad enseñaba la banda roja
«No se pudo completar» sobre el texto «Dispositivo registrado». El tono viaja
ahora con el mensaje, en una función pura con pruebas.

#### El alta de beneficiarios se quedaba clavada

El core devuelve el documento del titular **con guiones** y el porte lo escribía
tal cual en el campo, donde su propia validación lo rechazaba después. La app
Flutter no prellena ese campo y nunca se topó con esto.

### Lo que se dejó fuera, y por qué

- **El portal Nuxt no se corrige aquí.** Comparte el defecto del impuesto y es
  código en producción de otro canal: se documenta y se escala.
- **El backend no se toca** (P-03), aunque esta sesión encontró dos muñones
  nuevos suyos: `POST /beneficiaries/confirm` **no valida el segundo factor**
  —lo dice su propio `// TODO: Verificar el token 2FA aquí`— y
  `POST /devices/register` **no genera ni envía ningún código**.
- **V-08 queda a medias**: el borrado de las casillas tras un código rechazado
  no se puede comprobar porque, con ese muñón, **ningún código se rechaza**.
- **V-04 y V-16** quedan como estaban al cierre de la sesión; ver el traspaso.
- **Un dispositivo revocado no puede volver a registrarse** (D-23). Se descubrió
  al cerrar V-06: tras revocar, el interruptor de Seguridad ya no vuelve a
  activarse. El banco quiere lo contrario, y como la revocación es el mecanismo
  de vuelta atrás del piloto, hoy esa marcha atrás es un billete de ida.

---

### 2026-09-17 (12) — Pinning listo para activar, firma de release externalizada, revisión MASTG y oleada 10

Trabajo sin teléfono y sin decisión pendiente, que es lo que el banco pidió
adelantar mientras el Pixel estaba desconectado.

#### T-03 · Certificate pinning: todo menos las huellas

`scripts/calcular-pin-spki.mjs` calcula la huella SPKI de un certificado y
escribe la línea `<pin digest="SHA-256">…</pin>` lista para pegar. Sin
dependencias: `node:crypto` sabe leer un X.509 y exportar su clave pública en
DER. Se fija **la clave pública y no el certificado**, para que una renovación
que conserve la clave no deje a nadie fuera. Avisa si el certificado está por
vencer, porque fijar una clave que caduca en dos meses es programar una caída.

El andamiaje quedó en la configuración de red de release, **comentado a
propósito y documentado**, con la explicación de por qué hacen falta **dos**
huellas —la en uso y la de respaldo— y por qué `expiration` no es opcional.
`npm run verify` lee el XML **sin sus comentarios**: un comentario no protege
nada, así que mientras siga comentado lo reporta como hallazgo. Es D-02.

#### T-11 · La firma de release deja de depender del repositorio

Gradle lee el almacén de `android/keystore.properties` —ignorado por git— o de
las variables `BSC_KEYSTORE_*`, para un servidor de integración donde no debe
haber archivos con contraseñas. Si no encuentra ninguno cae a la llave de
depuración y `verify` lo dice. Hay plantilla `.ejemplo` versionada; el archivo
real, nunca. `assembleDebug` verificado tras el cambio.

**La comprobación de `verify` se reescribió porque estaba dando un falso OK.**
Buscaba `signingConfig signingConfigs.debug` en el bloque de release, y en
cuanto esa línea pasó a ser una condición, empezó a pasar sin que nada mejorara.
Ahora mira si **existe** `android/keystore.properties`. Una comprobación que
mira la forma del código en vez del hecho se rompe en silencio, que es la peor
manera de romperse.

#### Revisión MASTG (cierra la oleada 9)

[`14-revision-mastg.md`](./14-revision-mastg.md): los siete grupos del estándar
de OWASP, priorizados por riesgo en vez de recorridos de arriba abajo. El
resultado en una frase: **la aplicación está sólida donde se mueve el dinero**
—firma, huella, almacenamiento, red— y le faltan tres cosas para publicarse, y
**las tres son decisiones del banco, no trabajo pendiente**: `Enforce` (D-04),
las huellas (D-02) y la custodia del almacén (D-03).

Se registra también lo que la revisión **no** cubre: iOS entero, las pruebas
dinámicas con proxy, la ingeniería inversa real del APK y el backend.

#### Oleada 10 — runbooks, piloto y vuelta atrás, informe final

- [`15-runbooks.md`](./15-runbooks.md) — nueve procedimientos escritos para que
  los ejecute alguien que no escribió el código. Incluyen las trampas que
  costaron sesiones: que `adb install -r` mata la app que instala y devuelve el
  foco a la anterior, que `uiautomator dump` no sirve contra Flutter, que el
  enrolamiento devuelve 409 si TokenBSC no está levantado. Lo no ejecutado nunca
  va marcado ⚠️: un runbook que nadie ha corrido es una intención.
- [`16-plan-de-piloto-y-vuelta-atras.md`](./16-plan-de-piloto-y-vuelta-atras.md)
  — tres fases y cuatro niveles de vuelta atrás. La limitación que lo ordena
  todo: **en Android no se puede desinstalar una app a distancia**, así que la
  vuelta atrás real es por servidor —revocar los dispositivos— y es la que
  **nunca se ha probado**.
- [`17-informe-final.md`](./17-informe-final.md) — 844 pruebas, 13 features,
  31 → 12 dependencias, y los nueve defectos del original que el porte corrige.

#### D-18, que salió al escribir los runbooks

**El APK de release no habla con ningún backend.** `src/app/config.ts` declara
cuatro ambientes pero elige con `__DEV__`, y la URL de producción está vacía a
propósito para que una compilación mal configurada falle al arrancar en vez de
conectarse a donde no debe. Es lo correcto, y deja pendiente el mecanismo de
inyección. Bloquea la publicación igual que D-02 y D-03.

#### Otros

- **La matriz de trazabilidad estaba desfasada:** decía «Inventariado» para las
  trece features ya escritas, que es justo lo que la definición de terminado
  prohíbe. Actualizada con implementación y número de pruebas por feature, y
  distinguiendo «Portado» —escrito y probado— de «Verificado» —visto en un
  teléfono—, que no es lo mismo y se estaba mezclando.
- **V-05 instrumentado.** La pantalla del token suave registra montaje,
  desmontaje, apertura y respuesta del diálogo biométrico, legible con
  `adb logcat -s ReactNativeJS:V | findstr token-suave`. La próxima sesión con
  el Pixel resuelve el defecto en vez de reproducirlo.

`npm run verify`: 844 pruebas en verde, formato, lint y tipos limpios. Los dos
hallazgos de configuración que quedan son **D-03 y D-02**, y no se silencian.

### 2026-09-17 (11) — Pagos como el original, endurecimiento y un solo sitio para los pendientes

**La pestaña de Pagos vuelve al modelo del original, con una mejora.** Abría con
un selector de tipo —«Tarjeta de Crédito · 4 tarjetas a tu nombre»— y ahora abre
con **la lista de productos**, cada uno con su número enmascarado y su balance,
como `payment_home_body.dart`. La comparación contra la app Flutter en el mismo
teléfono lo destapó.

El porqué, además de que es lo que hace el original: _reconocer en vez de
recordar_ —«Tarjeta •••• 7147 · RD$ 62,377.35» le dice al cliente cuál es, «4
tarjetas a tu nombre» le obliga a acordarse—; _coherencia con el propio inicio_,
que ya enseña «Para hoy · Tarjeta •••• 7147 · Pago mínimo RD$ 174.04»; y que un
nivel de jerarquía se añade cuando hay amplitud que ordenar. El portal tiene
**siete** categorías de pago y por eso allí sí hay un menú; la aplicación móvil
implementa dos.

**La mejora que el banco aprobó:** se enseña también el **pago mínimo**, que es
lo que el cliente viene a resolver. Solo cuando hay uno: una tarjeta de contado
manda cero, y «Mín. RD$ 0.00» le inventaría una obligación que no tiene. La
fecha límite no se muestra y **no es un olvido**: no viene en el listado de
productos, sale del detalle de cada tarjeta, y pedir cuatro detalles para dibujar
una lista la volvería lenta. Queda escalado.

#### Endurecimiento (oleada 9)

**T-07 · El paquete.** Hermes ya estaba; se enciende **R8** con sus reglas
—cada `keep` existe porque sin él algo deja de funcionar _solo en release_— y un
plugin propio de treinta líneas quita `console.*` de producción. `console.error`
se conserva: es lo que un informe de fallos recoge, y quitarlo mientras no exista
la observabilidad sería cambiar una fuga por una ceguera. **Verificado sobre el
paquete de producción real**: cero `console.log`, `warn`, `info`, `debug`,
`table` y `trace`; los 36 `console.error` siguen ahí. Y `assembleRelease`
termina: 21 MB.

**T-14 · Observabilidad.** `Registro` y `redaccion`. La regla es que **lo que se
registra se redacta en el propio registro, no en quien llama**: confiar en que
cada punto de llamada redacte es confiar en que nadie tenga prisa nunca. Se
conservan a propósito los últimos cuatro dígitos de una cuenta y el orden de
magnitud de un monto, porque «falló una transferencia» no se puede investigar y
«falló una de una cuenta \*\*\*\*3953 por un monto de cuatro cifras» sí. Lo que no
está clasificado por su nombre se juzga por su forma, que es lo que atrapa el
campo nuevo que nadie clasificó.

**T-10 · Escaneo de secretos.** Escáner propio, afinado a lo que este proyecto
puede filtrar. **Encontró la dirección interna del banco reproducida en cuatro
documentos de la migración y en dos comentarios del código** —los mismos que
describían ese defecto—. Redactados. Y encontró que una prueba que yo acababa de
escribir llevaba la credencial de prueba real.

**T-15 · Dependencias.** `npm audit`, que viene con npm, y un inventario propio
en `docs/sbom.json` que el verificador comprueba que esté al día.

#### La cobertura del paquete compartido, y por qué costó

El umbral del 100 % fallaba y el informe señalaba **una línea en blanco**. No era
un hueco de pruebas: `tsconfig.json` tenía `"sourceMap": false`, así que
`ts-jest` instrumentaba el JavaScript compilado y la cobertura atribuía las
sentencias a líneas equivocadas. Con los mapas activados el informe señaló la
sentencia de verdad —la regla `c`+`n` de `acentoPara`, que `informaci¿n` no
recorre porque sus letras vecinas son `i` y `n`— y cubrirla dejó el paquete **al
100 % sin bajar ningún umbral**.

#### Oleada 10

- `npm run verify` cubre cuatro pasos más.
- `scripts/comparar-capturas.mjs` compara dos capturas píxel a píxel.
- **`docs/migration/13-pendientes.md`**: todo lo que espera una decisión, una
  verificación o una validación, en un solo documento con identificadores
  estables que se pueden citar en una reunión.

---

### 2026-09-17 (10) — La oleada 9 empieza por lo que no necesita permiso

Se hizo la parte del endurecimiento que **no depende de una decisión del banco
ni del teléfono conectado**. El resto espera, y espera a propósito: un pin de
certificado escrito a ojo deja a todos los clientes fuera.

**Tráfico en claro (T-06).** `configuracion_de_red.xml` prohíbe el tráfico sin
cifrar y confía solo en las autoridades del sistema. El complemento de Gradle de
React Native ya ponía `usesCleartextTraffic=false` en release, pero **depender
del valor por defecto de una herramienta de terceros no es una política**: puede
cambiar al actualizarla y nadie se enteraría hasta que una compilación de
producción hablara en claro. La única excepción es el bucle local, dentro de
`debug-overrides`, que Android ignora en release; es lo que necesita
`adb reverse`. **Ninguna dirección del rango privado entra en el archivo**, ni
siquiera el alias del emulador: la app Flutter traía una dirección interna del
banco escrita en el código (T-10) y una aquí sería la misma fuga, habilitada
además en claro. Los certificados que el cliente instale solo se confían en
depuración.

**Copia de seguridad y transferencia entre dispositivos (T-12).** `allowBackup`
y `fullBackupContent` apagan la copia; `reglas_de_extraccion.xml` cubre la
transferencia directa que Android 12 introdujo, que `allowBackup` no alcanza.
No se excluye nada porque **no se transfiere nada**: si el `deviceInstallId` y
la marca de enrolamiento llegaran a un teléfono nuevo sin la llave —que se queda
en el Keystore del viejo—, el cliente quedaría encerrado, con la app creyendo
que puede firmar y el servidor rechazando cada intento.

**La versión, que era una deuda anotada.** Gradle la deriva de `package.json` y
calcula el `versionCode`; el pie del perfil y el enrolamiento la leen **del
manifiesto**. Estaban desalineadas —la app decía «0.1.0» y el manifiesto «1.0»—,
así que la aplicación se contradecía a sí misma y soporte no podía saber qué
compilación tenía delante al recibir un reporte. Verificado en el manifiesto
fusionado: `versionName="0.1.0"`, `versionCode=100`.

**Todo fijado por prueba.** `endurecimientoAndroid.test.ts` lee el manifiesto,
los dos XML y el `build.gradle`. Estas decisiones viven donde nadie las mira y
nada las comprueba: se pierden en un merge o al actualizar una plantilla, y una
aplicación que permite copia de seguridad funciona igual de bien en el día a
día. El síntoma aparece en una auditoría, no en el desarrollo.

La propia prueba encontró algo mientras se escribía: prohibía las direcciones
privadas mirando el archivo entero y falló contra su propio comentario, que
citaba la dirección del defecto T-10. Ahora mira las directivas y no los
comentarios — la documentación tiene que poder citar el defecto que evita.

794 pruebas (7 omitidas), 51 suites. Compilación de Android verificada.

---

### 2026-09-17 (9) — Oleadas 7 y 8: el enrolamiento del dispositivo, y la última pantalla marcadora

Con esto **las oleadas 0 a 8 quedan cerradas y no queda ninguna pantalla
marcadora en la aplicación**.

**Lo que faltaba de la oleada 7 no era la interfaz.** `DeviceBindingService`
solo sabía firmar, así que en un teléfono real no había ninguna llave que el
banco reconociera: toda operación caía al código de verificación y la ganancia
de la oleada 5 —que el cliente ponga el dedo y no teclee nada— no existía fuera
de las pruebas. El enrolamiento es lo que cierra ese círculo.

#### Decisiones del banco aplicadas en esta sesión

| Pregunta abierta                                              | Decisión                                                     | Qué se hizo                                                                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Cuánto se debita en una transferencia                         | **Como el portal**: monto convertido más comisión e impuesto | `ordenDeLaTransferencia` manda `totalDebitado` en `transactionAmount`. Un solo sitio; la huella lo siguió sola porque se deriva del cuerpo |
| Pago a la tarjeta de un tercero                               | Actualizar el backend a la rama más reciente                 | Ver «Lo que no se pudo cerrar»                                                                                                             |
| `BscSelect` abre una hoja donde el original despliega un menú | Se acepta                                                    | Sin cambios; queda anotada como divergencia conocida                                                                                       |

#### Agregado — oleada 7, dispositivos y segundo factor

- **Enrolamiento completo en tres pasos**: registrar, verificar con el código y
  publicar la llave pública. **La llave se crea después de verificar el código,
  nunca antes**: si se creara primero, un enrolamiento abandonado dejaría una
  llave huérfana en el teléfono que el banco no conoce, `estado()` respondería
  «listo», y cada operación gastaría un diálogo biométrico para terminar en un
  rechazo que el cliente no sabría interpretar.
- **Pantalla de Seguridad**, con el interruptor que enrola —no uno que solo
  pregunta «¿huella válida?»—, el detalle de dónde vive la llave, y los tres
  estados que llevan a sitios distintos: sin enrolar, llave inválida y teléfono
  sin soporte.
- **Mis dispositivos**, con su lista, la píldora «Este teléfono» y la
  revocación. Revocar **no exige segundo factor**, y es deliberado: es lo que un
  cliente necesita justo cuando perdió el teléfono, y exigir una verificación
  sobre el dispositivo que ya no tiene haría la revocación imposible en el único
  momento en que urge.
- **Token para otros canales**, con sus tres decisiones de seguridad: exige
  biometría aunque la sesión esté abierta, bloquea capturas con `FLAG_SECURE`
  mientras está visible, y se oculta solo al cabo de un minuto.
- **`deviceIntegrity` con módulo nativo propio en Kotlin** —binarios `su`,
  aplicaciones de root y compilación firmada con claves de prueba— en lugar de
  `flutter_jailbreak_detection`. Menos de cien líneas auditables en la ruta por
  la que el banco entrega un secreto. El veredicto lo produce el cliente, así
  que protege al caso honesto y deja constancia del resto; no es una garantía.
- **TOTP RFC 6238 en `@bsc/shared`**, con HMAC-SHA256 escrito a mano y
  contrastado contra `node:crypto`. `sha256` expone ahora el digest sobre bytes.

#### Agregado — oleada 8, complementarias

- **Tasa de cambio**: tabla de compra y venta con las medidas literales del
  original y conversor a pesos, que arranca con «1» y con la tasa de venta
  elegida —la que le cobran al cliente cuando compra divisa—.
- **Comprobantes fiscales**: lista, filtros de cuenta y período, y hoja de
  detalle que pide los dos endpoints y dibuja lo que llegue. El período por
  defecto es **un año**, como el original: los NCF se emiten solo cuando se
  cobra una comisión, así que un trimestre vuelve vacío con frecuencia en
  cuentas que sí tienen comprobantes.
- Se retiran `PENDIENTES` y `PantallaPendiente`. La prueba de paridad de rutas
  es la que sigue vigilando que no falte ninguna pantalla del original.

#### Defectos encontrados en el original

| #   | Defecto                                                                                                                                                                                                                                                                                                                                                                                                                                     | Dónde                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 23  | **El token para otros canales nunca pudo mostrar un código.** La pantalla lee `Base32Secret` de `/two-factor/soft-token/provision` y ese campo **no existe**: `TokenBscProvisionResponse` declara `Success`, `Message`, `AlreadyProvisioned` y `Error`, y nada más. Como el controlador devuelve ese tipo, aunque TokenBSC lo mandara el gateway lo descartaría al deserializar. El cliente siempre ha visto «No pudimos preparar tu token» | `soft_token_screen.dart` |
| 24  | **El original tampoco calcula un TOTP estándar.** Usa el paquete `otp` de Dart con `isGoogle: false`, que **no decodifica el base32**: hace el HMAC sobre los bytes UTF-8 de la propia cadena, repetidos hasta llenar los 32 bytes del bloque. Un verificador estándar rechazaría esos códigos                                                                                                                                              | `soft_token_screen.dart` |

Se implementa el TOTP estándar, que es lo que necesita el servidor que valida, y
el modo del original queda disponible y probado en
`codigoTotpAlEstiloDelOriginal` para poder compararlos si el banco confirma qué
hace TokenBSC.

#### Lo que se dejó fuera, y por qué

- **La atestación de la llave** (`keyAttestation`) no se envía al registrar. El
  backend la acepta opcional y verificarla exige una cadena de certificados que
  el banco todavía no valida. Enviar algo que nadie comprueba daría una falsa
  sensación de garantía.
- **El token suave no se puede probar de punta a punta** mientras el backend no
  devuelva el secreto. La pantalla está escrita y su camino de error es el que
  el cliente recorre hoy.
- **El backend solo devuelve dólar y euro** en las tasas:
  `GetCurrencyExchangeListQuery` filtra por `CurrencyExchangeISOCode`. Si el
  core mandara una tercera moneda, la app no la vería. No se toca el backend
  (P-03); la tabla del porte sí sabría dibujarla si llegara.
- **Los avisos siguen saliendo como banda dentro de la pantalla** y no como el
  `SnackBar` flotante del original. Es una diferencia visible y está anotada
  entre las divergencias.

#### Lo que no se pudo cerrar

- **El pago a la tarjeta de un tercero sigue sin poder conectarse.** Ver la
  sección del traspaso: el muñón sigue siendo un muñón en la rama más reciente
  del backend.

772 pruebas (7 omitidas), 50 suites. TypeScript estricto y ESLint sin errores.

---

### 2026-09-16 (8) — Oleadas 4, 5 y 6, y la huella de operación alineada con el backend

Tres oleadas encadenadas, más las dos pantallas que quedaban de la 3. Con esto
**las oleadas 0 a 6 quedan cerradas**.

**Lo más importante de esta sesión no es lo que se construyó, sino lo que se
encontró.** La huella de operación —lo que convierte «el cliente digitó el
token» en «el cliente autorizó ESTA transacción»— **no coincidía con la del
backend en ningún canal**. El backend la recalcula al ejecutar a partir de los
campos que recibe, y si no coincide no ejecuta; hoy no se nota porque
`TransactionAuthorizationSettings.Enforce` está apagado y el guardián deja pasar
la operación anotándola en la bitácora. En cuanto se encienda:

| Operación       | Qué firma el original                     | Qué recalcula el backend                                          | Consecuencia                               |
| --------------- | ----------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| Transferencia   | la moneda del **destino**                 | `sourceTransactionCurrency`, la del **origen**                    | falla toda transferencia que cruce monedas |
| Pago de tarjeta | el número **enmascarado** y `finalAmount` | el `CardNumber` completo y `PaymentAmount`, que es `totalDebited` | **falla todo pago de tarjeta**             |
| Pago de cuota   | el número enmascarado y `finalAmount`     | `loanNumber` y `paymentAmount`                                    | **falla todo pago de cuota**               |

El portal Nuxt comparte el defecto de la moneda. **El backend no se toca (P-03):
el canal se alinea con el backend**, que es quien decide si el dinero se mueve, y
lo del portal queda escalado.

La corrección de fondo es de diseño: **la huella se deriva del cuerpo que se va a
enviar**, no del estado de la pantalla. La orden se compone una vez, se firma esa
orden y se ejecuta esa misma orden, así que no hay forma de firmar una cosa y
enviar otra sin cambiar esa función. Una prueba replica el cálculo de C# con
`node:crypto` como oráculo y compara carácter por carácter, incluida la
precedencia del destino —`creditAccountNumber ?? beneficiaryId ??
targetProduct.Number`—, que rompe justo los flujos con beneficiario.

**Agregado — perfil y Mi Oficial de Cuenta (cierre de la oleada 3)**

- Las dos pantallas con las medidas literales de `profile_screen.dart` y
  `account_officer_screen.dart`.
- **Defecto corregido: el oficial de cuenta nunca habría aparecido.** El porte
  leía `OfficerName`, y el backend declara `OfficialAccountName` en
  `BusCompatibleCustomerProfile`. El bloque «Mi oficial de cuenta» del perfil no
  se habría dibujado jamás y la pantalla del oficial habría respondido siempre
  «aún no tienes un oficial asignado», sin un solo error. La prueba del contrato
  fijaba el nombre equivocado, que es lo que lo dejó pasar.
- `CustomerRepository` con caché de sesión en el contenedor: el perfil, el
  oficial y el dashboard leen el mismo objeto. El original quitó una segunda
  fuente de datos por esta misma razón.
- El punto verde «Disponible» del oficial se porta **sin la animación**: el
  `_PulseDot` del original tiene un `AnimationController` que repite en bucle y
  cuyo `builder` no usa el valor de la animación. El latido no existe.

**Agregado — oleada 4, beneficiarios**

- Lista agrupada por destino, hoja de detalle y asistente de alta en cinco
  pasos: destino, cuenta, datos, código y listo.
- **Defecto corregido, y es el que impedía usar la feature entera:** la
  validación de cuenta no podía dar por válida ninguna cuenta.
  `/beneficiaries/validate-account` devuelve `Result<AccountValidationDto>`
  —`{ Value: { Client, Products } }`— y el repositorio de la app Flutter lo lee
  como `ApiResponse<T>` buscando `IsValid` y `AccountHolderName`, que no existen
  ahí. El cliente escribe una cuenta buena y la hoja se queda clavada enseñando
  «Cuenta validada.» como si fuera un error.
- **Defecto corregido: los códigos de documento estaban cambiados.** El original
  mapea `PASSPORT` a 2 y `RNC` a 3; el enumerado del backend dice `RNC = 2` y
  `Passport = 3`. Un beneficiario dado de alta con pasaporte quedaba guardado y
  mostrado como RNC.
- `core/network/envelopes.ts`: los dos sobres del backend con nombre propio.
  Confundirlos no da error, da datos en blanco, y ya había pasado tres veces.
- El segundo factor (`twoFactor`), que es de la oleada 7, se adelanta en lo
  imprescindible: sin pedir y verificar un código no se puede terminar un alta.

**Agregado — oleada 5, transferencias**

- Los cinco tipos, el asistente de tres pasos, la cotización, las comisiones, el
  comprobante y la integración con la firma en StrongBox de la oleada 0.
- `operationRisk.ts`: cotidiana frente a alto riesgo, con los umbrales del
  original. ⚠️ **Los umbrales son del banco, no nuestros**, y siguen sin fijar.
- `authorizeOperation.ts`: la compuerta por la que pasa todo lo que mueve dinero,
  escrita como función pura sobre firmar y pedir código, **sin tocar la
  interfaz**. Esa es la diferencia con el original, que recibe un `BuildContext`
  y no se puede probar sin levantar la aplicación. Su regla más importante tiene
  prueba propia: **si el cliente cancela la biometría no se le ofrece un código**,
  porque eso lo entrenaría a esquivar la verificación que acaba de rechazar.
- `deviceBindingService.ts`: reto, firma y verificación. Es la pieza que hace que
  la llave del StrongBox verificada en la oleada 0 sirva para transferir.
- El estado «1» del core —recibida y pendiente de aprobación— **se distingue de
  la aplicada** con otro icono, otro color y otro título. Tratarlo como fallo
  haría que el cliente reintentara una transferencia que ya está en curso.

**Agregado — oleada 6, pagos**

- Tarjeta y préstamo, reutilizando el asistente de la oleada 5 tal como el plan
  anticipaba: lo que aporta esta oleada es el formulario, no una arquitectura.
- **Una opción de monto en cero no se ofrece.** Un «Pago Mínimo RD$ 0.00» en una
  tarjeta de contado se lee como que no hay nada que pagar, cuando lo que pasa
  es que esa tarjeta no tiene mínimo y hay que saldar el ciclo.
- Una tarjeta lleva **dos ciclos a la vez** y el selector de moneda cambia los
  tres montos, no una etiqueta. Es el mismo defecto que apareció en la oleada 3
  con los movimientos.
- Un préstamo se paga siempre en su moneda y **no paga comisión ni impuesto**: el
  aviso de la Norma 04-04 no se muestra en préstamos.
- **Corregido: el canal viaja como `BSCMOVIL`.** El original manda `BSCLWEB`, el
  de la banca en línea, así que las operaciones hechas desde el teléfono
  quedaban registradas en el core como si vinieran del portal.
- La navegación ya lleva el tipo: desde el detalle de una tarjeta o de un
  préstamo, y desde la hoja de acciones rápidas, el asistente entra directo.
  Cierra la deuda que la oleada 3 dejó anotada.

**Dejado fuera, y por qué**

- **El pago a la tarjeta de un tercero.** El endpoint existe, pero su manejador
  en el backend **no llama al core**: la llamada está comentada bajo un
  `//TODO : HACER TRANSFERENCIA INTERBANCARIA` y devuelve un éxito fijo
  —`StatusId = "0"`, `TransactionId = "completado"`—. Conectarlo le diría al
  cliente que pagó la tarjeta de otra persona sin que se moviera un peso. La app
  Flutter tampoco lo usa: define la llamada y su bloc nunca la invoca.
- **Beneficiarios internacionales**: el original tampoco los da de alta.
- **Editar y eliminar un beneficiario**: no están en el original.
- **El catálogo de tipos de documento** sale de una tabla vacía en este
  ambiente, así que el selector no aparece y el alta manda siempre cédula. El
  original lo esconde sin decirlo.
- **Preseleccionar la tarjeta concreta** al llegar desde su detalle: viaja el
  tipo, no el producto. La pantalla parte de la primera tarjeta del cliente.

**Divergencias deliberadas, anotadas para que el banco decida**

- `BscSelect` abre una hoja donde el original despliega un
  `DropdownButtonFormField`. React Native no trae menú desplegable y la
  alternativa era una dependencia nativa de controles. **El campo cerrado sí
  copia al original** —mismo borde, mismo radio, misma altura, mismo signo de
  desplegar—, así que la diferencia solo se ve mientras está abierto.
- Los comprobantes se comparten con la hoja del sistema en vez de los cuatro
  botones de WhatsApp, SMS, correo y más del original: dos dependencias menos y
  un toque más. El texto compartido lleva **solo los últimos cuatro dígitos** de
  las cuentas, igual que se hizo con el nombre del PDF en la oleada 3.
- La versión de la aplicación sale de `package.json` y no del manifiesto, así que
  puede divergir de `versionName` en `android/app/build.gradle`, que hoy dice
  «1.0». Hay que unificarlas antes de publicar.

**Pregunta abierta nueva:** el portal cobra `totalDebited` —monto más comisión e
impuesto— como monto de la transacción, y la app móvil cobra solo el monto. Son
dos respuestas distintas a «cuánto se debita» y la diferencia es dinero. Aquí se
porta el comportamiento del original.

**Otros**

- Diseño: `BscPageHeader`, `BscEmptyState`, `BscRadio`, `BscSelect` y
  `BscOtpInput`, con las medidas literales del original, más catorce iconos.
- `.eslintrc.js` declara el entorno de Jest: `jest.setup.js` producía diecinueve
  errores `no-undef` que enmascaraban el informe de lint, de modo que «ESLint sin
  errores» no significaba nada.
- La vista previa web gana once pantallas: perfil con y sin oficial, oficial
  asignado y sin asignar, beneficiarios en sus tres estados, el alta abierta,
  transferencias, sus pasos 2 y 3 —aplicada y pendiente— y pagos.

**Estado: 700 pruebas, 693 en verde y 7 omitidas por requerir el backend.** 45
suites. TypeScript estricto y ESLint sin errores.

### 2026-09-16 (7) — Tarjeta de crédito, estados de cuenta y validación en el Pixel

Con esto **la oleada 3 queda cerrada**.

**Agregado — vista de tarjeta de crédito**

- Portada de `credit_card_detail_view.dart`, 995 líneas y la pantalla más grande del original. Va **aparte de `ProductDetailScreen`**: una cuenta o un préstamo tienen un saldo y una lista de movimientos, mientras que una tarjeta lleva dos ciclos a la vez —uno en pesos y otro en dólares—, pestañas propias, cuatro hojas de acción y su propio estado de cuenta.
- Selector de moneda en la cabecera, que cambia la pantalla entera; tarjeta de resumen con el anillo de uso del límite (62 de diámetro, trazo de 7, naranja sobre 75 % y rojo sobre 90 %), las dos mini-cifras con su línea de 1×30 y el aviso de pago; acciones de marca; pestañas de resumen y actividad con barra inferior de cinco entradas, tres de las cuales abren hoja y nunca se dibujan seleccionadas.
- Pestaña de resumen: desglose de consumos por la categoría que ya devuelve el core —no una taxonomía inventada—, movimientos destacados y la ficha de detalles del ciclo.
- Siete hojas: beneficios, datos de la tarjeta, pagar, límites, la que elige entre ver el ciclo y descargar el PDF, el estado de cuenta del ciclo y la lista de meses cerrados.

**Agregado — estados de cuenta**

- Los meses cerrados que se pueden pedir. **El mes en curso no se lista**: su ciclo no ha cerrado, el core devuelve un PDF vacío y el cliente descargaría un archivo en blanco sin entender por qué. Tampoco los anteriores a la apertura del producto.
- El contrato del ciclo de `credit-card-management/statement`, que sabe lo que el detalle no sabe: compras y avances del ciclo, base del cargo financiero y puntos del mes.
- Las cuatro formas en que el sobre `Result<T>` puede traer el PDF en base64.

**Agregado — entrega del PDF al teléfono, sin dependencias**

- `StatementFileModule.kt`, un módulo nativo propio en la línea de los otros cuatro de esta app. Escribe el base64 en la caché y abre la hoja de compartir por un `FileProvider` con permiso de lectura de un solo uso. **Borra lo anterior en cada descarga**, para no dejar en el teléfono un histórico de los movimientos del cliente, y recorta el nombre a su último segmento.
- Se pide con `TurboModuleRegistry.get` y no con `getEnforcing`: en iOS el módulo no existe todavía y `getEnforcing` tumbaría la aplicación entera al arrancar, no solo la descarga.

**Defecto corregido, heredado de la app Flutter: los movimientos no cambiaban de moneda**

- El bloc fija el código de moneda en `214` al abrir la tarjeta y **no lo toca al mover el selector**, así que con «US$» encima la pantalla enseñaba los balances en dólares junto a los movimientos en pesos, y el total de «Consumos del período» salía de esos movimientos pero escrito con el símbolo del dólar. Aquí cada ciclo se consulta por separado, que es lo que son.

**Defecto corregido, detectado en el Pixel: el número de la tarjeta no era el que el cliente tocó**

- El detalle enseñaba el `NUM_TARJETA` que reporta el core, y en el ambiente de prueba **no coincide con el de la lista de productos**: se toca una tarjeta terminada en 7147 y se abría una que decía 1032. El original enseña el de la lista —su modelo calcula el del detalle pero la tarjeta de resumen lee `widget.maskedCardNumber`—, y así queda. El del core se conserva en `numeroDelCore`. **Cuál de los dos es el plástico sigue sin resolver con el banco.**

**Capacidad recuperada: las acciones de cabecera de cuenta, préstamo y certificado**

- Comparando el Pixel contra la app Flutter apareció que **faltaban enteras**. El original abre la cuenta con cuatro —Transferir, Pagar, Estados, Compartir—, el préstamo con tres —Pagar cuota, Simulador, Estados— y el certificado con dos o tres según tenga cuenta de abono. El porte no dibujaba ninguna, y el handoff no lo decía.
- «Compartir» y «Cuenta de abono» copian al portapapeles y avisan; «Estados» de una cuenta abre la lista de meses en PDF, que ya existía y no estaba conectada a nada; las que llevan a un flujo sin migrar avisan de que llega, como hace el original.
- La lista vive en una función pura con pruebas, para que una que falte vuelva a fallar sola.

**Dos divergencias deliberadas con el original, las dos de seguridad**

- **El nombre del archivo del estado de cuenta lleva solo los últimos cuatro dígitos.** El original escribe el número completo de la tarjeta, y ese nombre viaja a la hoja de compartir, al almacenamiento del teléfono y a cualquier aplicación a la que el cliente lo mande.
- **Un PDF ausente devuelve indefinido, no cadena vacía**, que se guardaría como un archivo de cero bytes que ningún lector abre. Y se comprueba que lo recibido sea base64: cuando un intermediario de la red responde con una página de error, el original guardaría el HTML con extensión `.pdf`.

**Verificado en el Pixel, contra la app Flutter corriendo en el mismo teléfono**

- **Los movimientos con datos reales funcionan.** Cierra el pendiente que venía de la corrección del formato de fecha: la consulta devuelve los movimientos agrupados por día con la regla de signo correcta. Los períodos de 30, 60 y 90 días salen vacíos **porque el ambiente de prueba tiene datos hasta el 20 de enero de 2026** y hoy es septiembre; con el rango personalizado de «Este año» aparecen todos.
- El botón atrás de Android vuelve al dashboard desde la tarjeta, no cierra la aplicación.
- Cuenta, préstamo y certificado coinciden con el original en cifras, textos y disposición.

**Diferencias con el original que quedan anotadas y sin resolver**

- **El saludo del dashboard.** El original escribe el nombre del titular tal como lo manda el core, ofuscado en este ambiente; el porte escribe el nombre con el que se inició sesión. Hay que decidir cuál quiere el banco.
- Tres iconos del dashboard no son el mismo trazo: «Más», «Tasa de cambio» y la alcancía de los productos.
- El saldo corrido de los movimientos llega en cero desde el core y las dos aplicaciones lo enseñan igual.

**Otros**

- `formatInteger` en el paquete compartido. Hermes no trae los datos de internacionalización, así que `Intl.NumberFormat` no agrupa bien los puntos de la tarjeta.
- Sistema de diseño: `BscSegmented`, `BscProgressRing`, `BscBanner`, `BscMeterBar`, `BscOptionCard` y `BscToast`, portados con las medidas literales del original, más once iconos.
- La vista previa web gana `?pantalla=tarjeta` y `?pantalla=tarjeta-contado`.

**Estado: 541 pruebas, 534 en verde y 7 omitidas por requerir el backend.** 34 suites. TypeScript estricto y ESLint sin errores.

### 2026-09-16 (6) — Consulta a más de 90 días, vistas de detalle y vista previa web

**Capacidad recuperada: la consulta a más de 90 días**

- El banco señaló que la app Flutter permitía consultar movimientos de más de noventa días y que el porte no. Tenía razón, y el alcance era mayor de lo que decía este documento: el filtro del original no tiene tres píldoras sino **cuatro**, y la cuarta —«Personalizado»— abre una hoja con seis atajos (30, 60 y 90 días, este mes, mes pasado y este año) y un calendario mes a mes. **El techo real es de un año hacia atrás**, no de noventa días.
- Se había omitido a conciencia y estaba anotado en el código como deuda, pero este documento solo decía «períodos de 30, 60 y 90 días» y la pérdida quedó sin rastro. Lección: **cuando se deja algo fuera, el handoff tiene que decir qué se dejó fuera**, no solo qué se hizo.
- **El backend no impone ningún límite de rango**: `GetAccountTransactionQuery` es un `record` de paso y el controlador reenvía las fechas al core tal cual. Restaurar la consulta amplia no exigió tocarlo (P-03).

**Defecto corregido: ninguna consulta de movimientos podía traer datos**

- La app Flutter compone las fechas con `DateFormat('dd-MM-yyyy')` y el porte usaba `formatDateShort`, que produce `27/05/2026` **con barras**. Como «no se encontraron registros» se traduce a lista vacía, la pantalla salía en blanco sin ningún error visible. Es muy probablemente la causa real del pendiente de verificación que decía que la cuenta de prueba no tenía movimientos en noventa días. Se separa `formatDateForCore` de `formatDateShort` para que no vuelvan a confundirse; **las pruebas del repositorio fijaban el formato equivocado** y se corrigieron.

**Defecto corregido: el detalle del producto salía entero en cero**

- `obtenerDetalle` devolvía el sobre `Result<T>` del backend en vez de su contenido, así que quien leía `SAL_DISPONIBLE` buscaba en el sobre, no lo encontraba, y la conversión tolerante devolvía cero. **La pantalla quedaba perfecta y con todos los saldos a cero**, sin un solo error.

**Defecto corregido en el paquete compartido**

- `parseCoreDate` no reconocía la fecha con hora separada por un espacio —`2026-01-08 00:00:00`—, que es una de las formas que manda el core. La pantalla habría mostrado la marca de tiempo cruda donde la app Flutter muestra «08/01/2026». De paso se separa el caso con zona horaria explícita, donde el desplazamiento sí es intencional, del caso sin zona, que se interpreta en hora local.

**Agregado — oleada 3**

- **Capa de datos completa del detalle por tipo de producto**: los cuatro contratos —cuenta, préstamo, certificado y tarjeta— con sus pruebas, más `coreFields.ts` con la lectura tolerante que comparten.
- **Vista de cuenta**: «Resumen de Balance», «Información de Cuenta» y «Sobregiro y tránsito», que **se oculta entera** cuando la cuenta no tiene ninguno de los dos en vez de imprimir seis ceros.
- **Vista de préstamo**: progreso con barra, próximo pago y detalles.
- **Vista de certificado**: resumen de inversión con anillo de avance, rendimiento e información.
- `BscDateRangeSheet`, `BscDetailSection` y `BscDetailRow` en el sistema de diseño, con las medidas literales del original.

**Reglas del original que fallan en silencio y ahora tienen prueba propia**

- **En los préstamos activos el core devuelve `SALDO_ACTUAL` en cero** y lo que el cliente debería pagar para saldar vive en `SALDO_CANCELACION`. Abrir con «RD$ 0.00» encima se leería como que no debe nada.
- **Una tarjeta que se cobra de contado no tiene pago mínimo**: el core manda cero y lo que hay que pagar es el total del ciclo.
- **Una tarjeta lleva dos saldos a la vez**, en pesos y en dólares, con dos ciclos y dos pagos mínimos. No se consolidan: sumarlos con una tasa daría una cifra que no aparece en ningún estado de cuenta.
- El último pago de capital y el de intereses **distinguen «cero» de «no vino»**: un préstamo recién desembolsado no ha pagado nada.
- Los intereses pendientes de un certificado **nunca son negativos**: tras una renovación el core puede reportar más pagado que ganado.

**Cambiado**

- Donde la app Flutter devuelve cadena vacía para un campo que no vino, aquí se devuelve indefinido. La pantalla compara contra nulo para decidir si dibuja la fila, y la cadena vacía no es nula: el original imprime una fila con la etiqueta y el valor en blanco.
- «30 días» significa **treinta días contando hoy** en los dos caminos. En la app Flutter la píldora restaba treinta días completos —treinta y uno de rango— y el atajo «30 días» de su propia hoja restaba veintinueve, aunque su comentario decía que quería que coincidieran.
- El número de certificado se muestra **completo**, sin enmascarar, que es lo que hace el original.

**Agregado — vista previa en el navegador**

- A petición del banco, para agilizar: las pantallas se montan en el navegador dentro de un marco del tamaño del Pixel, y el ciclo pasa de varios minutos —backend, túneles, Metro, Gradle, instalación— a una recarga. **No deroga la validación en dispositivo, la reordena**: se itera en web y se valida en el teléfono al cerrar un bloque.
- Los datos son sintéticos y viven en `web/datosSimulados.ts`, que imita la forma cruda del core para que la vista previa ejercite también los contratos.
- ⚠️ **Lo que el navegador no puede verificar**: biometría, llaves en StrongBox, almacenamiento cifrado, `FLAG_SECURE` y el botón atrás de Android.

**Dependencias nuevas, todas de desarrollo y ninguna en el paquete del teléfono**

- `vite` y `@vitejs/plugin-react` como servidor; `react-native-web`, que es el proyecto con el que la propia documentación de React Native cubre el navegador; `react-native-web-linear-gradient`, porque el degradado es un módulo nativo sin implementación web; `react-dom` alineado con la versión exacta de `react`; y `@react-native/assets-registry`, que `react-native-svg` importa al cargar.

**Estado: 470 pruebas, 463 en verde y 7 omitidas por requerir el backend.** 29 suites. TypeScript estricto y ESLint sin errores.

### 2026-09-16 (5) — Paridad visual, navegación y botón atrás

**Paridad visual verificada lado a lado contra la app Flutter**

- El banco señaló que las pantallas no se veían iguales aun teniendo los mismos tokens. Lo que faltaba no eran colores: era la **composición** y las medidas que el original escribe a mano. El método pasa a ser leer el widget Dart completo, copiar sus medidas literales y comparar la captura del Pixel contra la app Flutter corriendo en el mismo teléfono.

**Defecto corregido: el número más grande de la app estaba mal**

- «Tu dinero disponible» **no es el patrimonio neto**. Es el saldo de las cuentas en pesos más el crédito disponible de las tarjetas: los certificados quedan fuera porque el cliente no puede disponer de ellos sin cancelarlos, y el crédito **suma** porque es poder de compra, no deuda. El porte anterior mostraba RD$ 7,967,305.22 donde la app Flutter muestra RD$ 1,400,880.34. Ahora coinciden el total y su desglose.

**Defecto corregido: la tasa del día se descartaba en silencio**

- `/currency-exchange/rates` responde `{ Value: [ { Currency, Sales } ] }` y el porte solo reconocía `rates`/`sellRate`, así que todos los saldos en dólares se consolidaban con la tasa de respaldo sin que nadie se enterara. La tarjeta «Tu balance» ahora dice con qué tasa consolidó, y lo avisa en naranja cuando es la de respaldo.

**Defecto corregido: el botón atrás cerraba la aplicación (P-21)**

- No había pila de navegación: el detalle de un producto se mostraba cambiando una variable de estado, así que Android no tenía a dónde volver.

**Agregado**

- Navegación con React Navigation reproduciendo la estructura de `routes.dart`: el acceso fuera del navegador, un contenedor con la barra inferior y sus cuatro destinos, y los detalles apilados encima a pantalla completa. **Sin enlaces profundos**, igual que el manifiesto de Flutter (T-09).
- Mapa de rutas **completo desde ahora**, con pantalla marcadora para lo no migrado, y prueba que lee `routes.dart` y falla si alguna pantalla del original se quedó sin ruta.
- Sección «Tu balance» del dashboard, que faltaba por completo: posición consolidada, barra partida, lo que el cliente tiene frente a lo que debe, y la tasa con la que se consolidaron los dólares.
- Hoja de «¿Qué deseas hacer?» con sus dos grupos y sus siete acciones, abierta por el diamante de la barra y por el botón «Más».
- Hoja modal compartida en el sistema de diseño, más `BscIconTile`, `BscListRow`, `BscRowDivider`, `BscPill` y `BscScreenHeader`: el original las comparte entre todas sus pantallas y tenerlas repetidas era la vía segura a que cada pantalla acabara con su propia medida.
- Detalle de producto con la cabecera del original y la lista de movimientos agrupada por día, con períodos de 30, 60 y 90 días.

**Cambiado**

- Los montos se escriben `RD$ 1,234.56` y `US$ 1,234.56`, con espacio y con las dos letras del dólar, que es lo que compone la app Flutter en todas sus pantallas. En República Dominicana el peso también usa el signo de dólar, y un monto marcado solo con él es ambiguo justo donde más caro sale confundirse.
- La lista de productos del dashboard se recorta a cuatro con «Ver todos», como el original: sin el corte, los dieciocho productos empujaban la sección de balance fuera de la pantalla.
- El nombre del producto se unifica en `nombreDeCategoria` y recupera las mayúsculas del original («Cuenta de Ahorros»).

**Dependencias nuevas**

- `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs` y `react-native-screens`. Todas del mismo monorepo mantenido por la comunidad, licencia MIT, y la alternativa —una pila de navegación propia— habría tenido que reimplementar el botón atrás, la gestión del gesto de retroceso y el estado por pestaña.

**Estado: 357 pruebas, 350 en verde y 7 omitidas por requerir el backend.** 23 suites. TypeScript estricto y ESLint sin errores.

### 2026-09-16 (4) — Oleada 0 completada

**Verificado en dispositivo real (Pixel 10a)**

- **La firma en hardware funciona.** Llave EC P-256 en **StrongBox**, con verificación de usuario obligatoria e invalidación al cambiar la biometría. La firma se validó **fuera del teléfono** con la llave pública, reproduciendo lo que hace `TransactionAuthorizationGuard` en .NET, incluida la comprobación de que deja de verificar si se altera un byte de la operación.
- **Cancelar el diálogo devuelve `user_not_authenticated`**, que la capa de negocio traduce a _no ofrecer el código por SMS_. Cancelar la biometría no abre un camino más débil.
- Evidencia completa en `archive/00-cimientos/evidencia-hardware.md`.

**Defecto corregido, heredado de la app Flutter (R-20)**

- `DeviceKeyPlugin.kt` documenta que `Signature.sign()` dispara el diálogo biométrico del sistema. **No lo hace.** Android exige firmar con un objeto criptográfico ya autenticado mediante `BiometricPrompt.CryptoObject`. Sin eso el Keystore rechaza la operación con `Key user not authenticated` y el cliente no ve nada. **La firma de transacciones de la app Flutter no podía funcionar en un teléfono real**; como nunca llegó a producción, nadie lo detectó.

**Agregado**

- `src/core/network/authInterceptor.ts` — **13 pruebas**: las 8 portadas de `auth_interceptor_test.dart` más cinco casos límite. Renovación 60 s antes del vencimiento, _single-flight_, reintento único, rotación del token de renovación.
- `src/core/network/endpoints.ts` — las 45 rutas, con prueba de paridad que lee `api_endpoints.dart`. Incluye la errata `retrive` que el backend escribe así.
- `src/core/network/apiClient.ts` — **exige URL base explícita**: la app Flutter traía una dirección interna del banco en claro como valor de respaldo.
- `SecureStorageModule.kt` sobre `EncryptedSharedPreferences` + `src/core/security/secureStorage.ts` — las mismas 13 claves, con paridad verificada. Cerrar sesión es una transacción única y **no borra lo que pertenece al teléfono**, para no obligar al cliente a re-enrolar cada vez.
- `src/core/security/sessionManager.ts` — **25 pruebas** con reloj inyectado. Cubre además el paso a segundo plano, que en React Native se observa con `AppState` y no con el ciclo de vida de Flutter.
- `src/core/security/deviceKey.ts`, `signingOutcome.ts`, `signingPayload.ts`, `tokenStore.ts`.
- `SecurityCheckScreen` y `scripts/verify-device-signature.mjs`.

**Estado: 170 pruebas en verde, 11 suites.** TypeScript estricto sin errores.

---

### 2026-09-16 (3) — Gate A cerrado · comienza la oleada 0 (Cimientos)

**Decidido**

- **P-04:** las capacidades que hoy no existen —push, detección de red, QR, gráficos, reporte de fallos— quedan **fuera** de la migración. Paridad estricta.
- **P-13:** el equipo macOS llega después de la migración. En consecuencia, el código de iOS se escribe preparado pero **queda sin verificar**; solo Android puede cerrar los Gates C y D.
- **`BSC.MobileApp` nunca llegó a producción.** Se cierra R-03 y desaparecen la convivencia entre apps, el re-enrolamiento de clientes, el despliegue gradual sobre parque instalado y la vuelta atrás.
- **Implementación autorizada.**

**Agregado — proyecto**

- Proyecto React Native 0.87.1 creado con Community CLI, TypeScript en modo estricto completo (`noUncheckedIndexedAccess` incluido).
- `packages/bsc-shared`: paquete de lógica pura compartida con el portal. **62 pruebas, 100% de líneas, ramas y funciones.**
  - `operationFingerprint` — produce el mismo hash que el backend en C# y la app en Dart, verificado con el vector compartido `a455a04b…01ea`.
  - `operationRisk` — clasificación de riesgo portada literalmente.
  - `sha256` — implementación propia sin dependencias (ver `adr/0004`).
- Módulos nativos de seguridad portados a `com.bsc.mobile.security`: `DeviceKeyModule` (StrongBox, EC P-256, biometría obligatoria) y `SecureScreenModule` (`FLAG_SECURE`), con interfaces tipadas por codegen en `src/specs/`.
- `src/core/security/signingPayload.ts` — composición del contenido a firmar (reto + huella), **15 pruebas** contrastadas contra `Buffer`.
- `scripts/verify.mjs` — comando orquestador; lista explícitamente los pasos aún no conectados en vez de omitirlos.
- `scripts/verify-config.mjs` — comprueba los cuatro defectos de configuración reales de la app Flutter: tráfico en claro, `applicationId` de plantilla, release firmada con llave de depuración, e IP interna en el código.
- `adr/0004-paquete-compartido-y-sha256-propio.md`.

**Corregido durante la implementación**

- **`do` es palabra reservada en Java/Kotlin**, así que `do.com.bsc.mobile` (dominio invertido de `bsc.com.do`) no es un paquete válido y el generador creó una jerarquía de carpetas mal formada. Identificador definitivo: **`com.bsc.mobile`** (P-10).
- La implementación propia de SHA-256 emitía suplentes UTF-16 sueltos en crudo, mientras que `TextEncoder` —que usa el portal— los sustituye por U+FFFD. Habría producido huellas distintas entre canales. **Lo detectó la prueba contra OpenSSL; se corrigió la implementación, no la prueba.**
- Registrado que la app Flutter y el portal difieren al redondear medios en el monto (`1.005` → `"1.00"` en Dart, `"1.01"` en el portal y en C#). La implementación compartida sigue al portal, que es quien coincide con el backend.

**Entorno — obstáculos encontrados y resueltos**

- La plantilla de React Native no se pudo descargar desde GitHub (bloqueada); se obtuvo desde el registro de npm.
- **La red del banco intercepta TLS con una CA propia que el JDK no reconoce.** Toda descarga de Gradle fallaba con `unable to find valid certification path`. Resuelto en la máquina de desarrollo con `-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT`. **Para el pipeline de CI sobre Linux hace falta otra solución: nueva pregunta P-16.**
- El plugin de Android de RN 0.87 exige Gradle **9.4.1 como mínimo**; las versiones en caché de las compilaciones de Flutter (8.12 y 9.1.0) no sirven (P-17).

---

### 2026-09-16 (2) — Respuestas del banco: P-01, P-02 y P-03 cerradas

**Decidido**

- **P-01:** se migra a React Native **por política de empresa**. `adr/0001` pasa a **Aceptado** con justificación institucional explícita; supersede a `ANALISIS-STACK-TECNOLOGICO.md` §1.1.
- **P-02:** **iOS entra en alcance.** Estimación 144 → ~195 puntos.
- **P-03:** **el backend no se modifica**; la app nueva funciona contra los contratos existentes.

**Agregado**

- `adr/0003-paridad-de-firma-en-ios.md` — paridad de la firma en Secure Enclave; identifica una única brecha (iOS no expone el nivel de respaldo de la llave) y la resuelve sin tocar el backend.
- P-13 (equipo macOS, cuenta de Apple, iPhone de pruebas), P-14 (aceptación formal de T-07 y T-15) y P-15 (idempotencia) en `11-open-questions.md`.
- P-04 reformulada capacidad por capacidad, en lenguaje no técnico, con recomendación e impacto en puntos.
- T-19 en el modelo de amenazas y R-19 en el registro de riesgos.
- Desglose del esfuerzo de iOS en `08-migration-plan.md`.

**Verificado en el backend (sin modificar nada)**

- **Swagger está habilitado** (Swashbuckle 6.5.0, servido en la raíz, en todos los ambientes). Resuelve el procedimiento de obtención del contrato.
- **La autorización de transacciones es de un solo uso** (`ConsumeAuthorizationAsync`), y cubre los tres controladores que mueven dinero. Riesgo R-10 rebajado de Medio a Bajo.
- ⚠️ **`"Enforce": false` en `appsettings.json:19`**: una transacción sin autorización válida **se ejecuta igual** y solo se registra. Toda la cadena de firma está en modo observación. Registrado como T-19 / R-19.
- `NotificationController` envía correos y plantillas, no avisos push.

**Pendiente**

- P-04 — única pregunta que bloquea el cierre del Gate A.

---

### 2026-09-16 — Fase 1, Gate 0 → Gate A abierto

**Agregado**

- Repositorio `BSC.MobileAppRN` creado con la estructura de documentación de la migración.
- Documentos `00` a `12`, `CHANGELOG.md` y `SESSION-HANDOFF.md`.
- `adr/0001-eleccion-de-stack-react-native.md` — propuesto, pendiente de P-01.
- `adr/0002-certificate-pinning.md` — propuesto.
- Carpeta `archive/` para congelar specs aprobados y evidencia por ciclo.
- Entrada del repositorio en `BSC.BSCEnLinea.FrontEnd.code-workspace`.

**Verificado (sin modificar nada)**

- `BSC.MobileApp` en commit `305d39e`, rama `feature/transaction-authorization`.
- `flutter analyze`: 390 avisos, **0 errores, 0 advertencias**.
- `flutter test`: **77 pruebas, todas en verde** (17 s).
- Inventario: 150 archivos Dart, 29.671 líneas, 13 features, ~30 superficies visuales, 45 endpoints, 2 módulos nativos Kotlin.
- Ausencia de proyecto iOS confirmada.
- 8 de 30 dependencias declaradas sin usar; push, QR, gráficos y modo sin conexión **no implementados**.

**Pendiente**

- 4 preguntas bloqueantes del Gate A (P-01 a P-04) sin responder.
- **No se ha generado ningún código de React Native.** El esqueleto técnico depende de las decisiones D-01 a D-12, que a su vez dependen del Gate B.
