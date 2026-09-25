# Runbooks operativos

**Alcance:** `BSC.MobileAppRN`, Android · **Estado:** escritos, ejecutados solo en la laptop de desarrollo

Un runbook es un procedimiento que alguien que **no** escribió el código debe
poder ejecutar leyéndolo. Por eso aquí los comandos van completos, se dice qué
tiene que salir, y —sobre todo— **qué hacer cuando no sale eso**.

Todo lo de abajo está verificado en la máquina de desarrollo salvo donde diga lo
contrario. Lo que no se ha ejecutado nunca en un servidor de integración está
marcado ⚠️, porque un runbook que nadie ha corrido es una intención, no un
procedimiento.

---

## RB-01 · Levantar el entorno de desarrollo

**Para quién:** alguien que acaba de clonar el repositorio.

```bash
npm install                       # instala también los workspaces
adb devices                       # el teléfono debe aparecer como "device"
adb reverse tcp:5000 tcp:5000     # backend
adb reverse tcp:5026 tcp:5026     # TokenBSC
npm start                         # Metro, en su propia terminal
npm run android                   # compila e instala
```

**Por qué `adb reverse` y no la IP de la laptop.** El teléfono y la laptop están
en subredes distintas de la red del banco, y el teléfono levanta una VPN. La IP
de la laptop no es alcanzable desde el teléfono; el cable sí. `adb reverse` abre
un túnel que hace que `localhost:5000` **dentro del teléfono** sea el puerto 5000
de la laptop.

**Los dos servicios hay que levantarlos aparte**, desde
`C:\Projects\BSC.BSCEnLinea.BackEnd`:

| Servicio             | Puerto | Sin él                                                                       |
| -------------------- | -----: | ---------------------------------------------------------------------------- |
| `BSC.BSCEnLinea.Api` |   5000 | No hay sesión: la app no pasa del acceso                                     |
| `BSC.TokenBSC.Api`   |   5026 | **El enrolamiento de dispositivo devuelve 409** y el mensaje no dice por qué |

Ese 409 costó una sesión entera de diagnóstico. Si el enrolamiento falla, lo
primero que hay que mirar es si el 5026 está arriba.

**Si Metro no conecta:** `adb reverse tcp:8081 tcp:8081`. Si la app arranca en
blanco, casi siempre es Metro, no la app.

---

## RB-02 · Compilar una release

```bash
npm run verify                    # NO continuar si falla
npm run build:android             # gradlew.bat assembleRelease
```

El APK sale en `android/app/build/outputs/apk/release/`. Hoy pesa **21 MB** con
R8 y Hermes.

**`npm run verify` es la puerta, no un trámite.** Corre formato, lint, tipos de
la app y del paquete compartido, las dos baterías de pruebas con sus umbrales,
la configuración de release, el escaneo de secretos, las vulnerabilidades de
dependencias y el SBOM. Devuelve distinto de cero ante cualquier fallo, a
propósito: existe porque la app Flutter llegó a tener a la vez tráfico en claro,
el identificador de la plantilla, la release firmada con la llave de depuración y
una IP interna escrita en el código, y **las cuatro compilaban perfectamente**.

**Hoy `verify` falla con dos hallazgos, y eso es correcto:**

```
✖ Release no se firma con la llave de depuración [T-11]    → D-03
✖ Certificate pinning configurado [T-03]                    → D-02
```

No se silencian. Son las dos decisiones que faltan para poder publicar, y el
comando está para que no se olviden.

⚠️ **La release de hoy no es publicable**, por tres cosas además de esas dos:

1. Se firma con la llave de depuración, que es pública (RB-03).
2. No hay pinning.
3. **`baseURL` está vacío en producción** — D-18. Es deliberado: una compilación
   mal configurada falla al arrancar en vez de conectarse a donde no debe. Pero
   significa que **hoy el APK de release no habla con ningún backend**.

---

## RB-03 · Firmar una release

**Precondición: D-03.** Hoy no existe el almacén de claves del banco.

El mecanismo ya está escrito. Gradle lee, en este orden:

1. `android/keystore.properties` — no versionado, ignorado por git.
2. Las variables `BSC_KEYSTORE_FILE`, `BSC_KEYSTORE_PASSWORD`,
   `BSC_KEY_ALIAS`, `BSC_KEY_PASSWORD` — para el servidor de integración, donde
   no debe haber archivos con contraseñas.

Si no encuentra ninguno, **cae a la llave de depuración** y `verify` lo reporta.
Copiar `android/keystore.properties.ejemplo` y rellenarlo es todo lo que hace
falta; la plantilla está en el repositorio, el archivo real nunca.

**Lo que hay que decidir, y no es técnico:** quién custodia el almacén, dónde
vive, quién puede firmar y qué pasa si se pierde. **Un almacén perdido significa
que no se puede volver a publicar la app nunca**: Google Play exige que las
actualizaciones vayan firmadas con la misma clave. No hay recuperación, no hay
soporte que lo arregle. Con Play App Signing el riesgo baja, porque Google
custodia la clave de firma y el banco solo guarda la de subida, que sí se puede
reemplazar. Conviene decidirlo antes de generar nada.

---

## RB-04 · Activar el certificate pinning

**Precondición: D-02.**

```bash
node scripts/calcular-pin-spki.mjs certificado-del-banco.pem
```

La herramienta imprime la línea `<pin digest="SHA-256">…</pin>` lista para pegar,
y **avisa si el certificado está por vencer**, porque fijar una clave que caduca
en dos meses es programar una caída.

El andamiaje está en
`android/app/src/main/res/xml/configuracion_de_red.xml`, comentado y
documentado. Descomentar y sustituir tres valores: el dominio, la fecha de
`expiration` y las dos huellas.

**Tres cosas que hay que hacer bien o el pinning es peor que no tenerlo:**

- **Dos huellas, no una.** La de la clave en uso y la de la clave de respaldo que
  el banco guarda sin usar. Android acepta la conexión si **cualquiera** coincide,
  así que con la de respaldo ya confiada una rotación de emergencia no exige
  publicar una versión nueva —que en una tienda tarda días—. Fijar una sola es el
  error clásico, y su consecuencia es que **nadie puede entrar**.
- **Se fija la clave pública (SPKI), no el certificado.** Así una renovación que
  conserve la clave no rompe nada.
- **`expiration` hay que ponerla y renovarla en cada versión.** Pasada esa fecha
  Android deja de exigir el pinning. Es la red de seguridad para el día en que
  las dos claves queden inservibles; sin ella, un error de rotación deja la app
  inutilizable para siempre.

**Antes de publicar con pinning, probarlo con un proxy:** levantar mitmproxy con
su certificado instalado como autoridad del sistema. Sin pinning el tráfico se
ve; con pinning la app debe **fallar la conexión**. Si el tráfico sigue viéndose,
el pinning no está activo aunque el XML diga que sí. ⚠️ No ejecutado.

---

## RB-05 · Instalar en un dispositivo de prueba

```bash
adb install -r app-release.apk
```

⚠️ **Trampa verificada.** `adb install -r` **mata la aplicación que está
instalando**, y el foco vuelve a la que estuviera antes. Una tanda entera de
capturas etiquetadas «rn-\*» resultó ser la app Flutter, y dio una paridad
perfecta del 0,00% que es imposible entre dos motores de renderizado distintos.

Antes de capturar nada, confirmar quién tiene el foco:

```bash
adb shell dumpsys window | grep mCurrentFocus
```

`scripts/comparar-capturas.mjs` avisa cuando el resultado es 0,00%, por esto
mismo.

---

## RB-06 · Comparar el diseño contra la app Flutter

```bash
node scripts/comparar-capturas.mjs <flutter.png> <rn.png>
```

Compara píxel a píxel y detecta bandas —franjas donde la diferencia se concentra,
que suelen ser un desplazamiento vertical, no un color mal puesto—.

**Las dos apps tienen que estar en el mismo teléfono.** Comparar contra una
captura de otro dispositivo mide densidades de pantalla, no diseño.

**`uiautomator dump` sirve para la app React Native y no sirve para la Flutter.**
Flutter solo construye su árbol de accesibilidad cuando hay un servicio de
accesibilidad activo, así que el volcado sale vacío y parece un fallo de la
herramienta. Para el original hay que medir sobre la captura.

---

## RB-07 · Diagnosticar en el dispositivo

```bash
adb logcat -s ReactNativeJS:V
adb logcat -s ReactNativeJS:V | findstr token-suave    # instrumentación de V-05
```

El registro **redacta antes de escribir**, y la redacción vive en el registro, no
en quien llama: así un `Registro.debug` escrito con prisa no puede filtrar un
número de cuenta.

**En el paquete de producción no hay nada de esto.** El plugin de Babel propio
sustituye `console.log/warn/info/debug/table/trace` por `void 0`; se conserva
`console.error`. Verificado sobre el paquete real: **cero** de los primeros, 36
de `console.error`.

---

## RB-08 · Rotar la URL del backend

**Precondición: D-18.** Hoy **no existe** el mecanismo.

`src/app/config.ts` tiene cuatro ambientes declarados —desarrollo, qa, piloto,
producción— pero la selección se hace con `__DEV__`, así que en la práctica solo
hay dos, y la de producción tiene la URL vacía a propósito.

Lo que falta es inyectar el valor en compilación: una variante de Gradle por
ambiente que escriba un `BuildConfig`, o un archivo de configuración leído en el
arranque. **Lo que no debe hacerse es volver a escribir la URL en el código**: la
app Flutter la traía como respaldo, y eso hacía que una compilación mal
configurada apuntara en silencio a un servidor de desarrollo en vez de fallar
(T-10).

---

## RB-09 · Vuelta atrás

Ver [`16-plan-de-piloto-y-vuelta-atras.md`](./16-plan-de-piloto-y-vuelta-atras.md).
