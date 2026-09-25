# El icono, la pantalla de arranque y el nombre de la aplicación (D-25, D-29)

**Estado:** ✅ **Resuelto el 2026-09-18.** El icono es el isotipo de Banco Santa
Cruz y el arranque muestra el logotipo sobre el degradado de marca.
**Última actualización:** 2026-09-18

---

## Qué había antes

Dos cosas distintas, y las dos de plantilla:

- **El icono** dibujaba las iniciales «BSC» en blanco sobre un cuadrado azul.
  Era un marcador de posición puesto a propósito, y como tal estaba anotado. En
  los teléfonos anteriores a Android 8 ni siquiera eso: salía el icono de la
  plantilla de React Native.
- **El arranque** era un indicador de carga girando sobre el fondo gris del
  sistema, y antes de eso —mientras Android abría la ventana y React Native aún
  no existía— un rectángulo blanco.

---

## Qué hay ahora

### El icono: el isotipo, recortado del logotipo de marca

El repositorio tiene un solo archivo de marca,
`src/design-system/assets/logo-bsc.svg`, que es el **logotipo completo**: el
símbolo —el rombo azul y verde— y el texto «BANCO SANTA CRUZ» al lado, en un
lienzo de 256×100.

El texto no sirve en un icono: se ve a unos 48 puntos de pantalla, donde las
letras son una mancha, y la máscara de Android se come los extremos de un
dibujo apaisado. Lo que sí sirve es el **isotipo**: el símbolo solo. El banco lo
entregó como referencia el 2026-09-18 y coincide exactamente con el símbolo que
ya vivía dentro del SVG de marca, así que **no hubo que dibujar nada nuevo ni
recortar a ojo**: se extrae del archivo original por programa, y el resultado se
puede comparar con el asset del banco.

El fondo del icono es **blanco**. No es una elección estética sino una
consecuencia: el isotipo lleva el azul y el verde corporativos, y sobre el azul
institucional la mitad del símbolo desaparecería. Es además el fondo sobre el
que el banco lo entregó. Vive en `values/ic_launcher_background.xml` como
recurso propio, así que cambiarlo no obliga a tocar el dibujo.

### El arranque: el logotipo sobre el degradado de marca

Se dibuja **dos veces**, y hay que entender por qué:

1. **Antes de que exista React Native.** Entre el toque en el icono y el primer
   componente pasan unas décimas de segundo en las que Android ya abrió la
   ventana y no hay nada que pintar. Lo que se ve ahí es el `windowBackground`
   del tema, que por defecto es blanco. Ahora es
   `drawable/fondo_de_arranque.xml`: el degradado de marca con el logotipo
   blanco centrado.
2. **Ya con React Native**, mientras la aplicación lee el nombre recordado, la
   marca del último acceso y la versión instalada, y valida contra el banco el
   token guardado —que es un viaje de red, y en mala conexión se nota—. Eso es
   `src/app/PantallaDeArranque.tsx`: el mismo degradado, ahora con sus facetas,
   el mismo logotipo y un indicador de carga debajo.

Las dos usan el logotipo a **64 dp de alto**, y ese es el único punto donde se
pueden desajustar: si se cambia en una y no en la otra, el logotipo da un salto
al entregarse el relevo. Hay una prueba que lo impide
(`endurecimientoAndroid.test.ts`, «el logotipo nativo y el de la aplicación
miden lo mismo»).

---

## Cómo se regenera

Todas las piezas salen de un mismo comando:

```
npm run iconos
```

Que ejecuta `scripts/generar-iconos.mjs`. **Los archivos que genera no se editan
a mano**: llevan una cabecera que lo dice. Si el banco entrega un logotipo nuevo,
se sustituye `src/design-system/assets/logo-bsc.svg`, se ejecuta el comando y las
trece piezas vuelven a cuadrar entre sí.

El generador no usa ninguna dependencia: interpreta el SVG, rasteriza por su
cuenta y escribe los PNG con la compresión que ya trae Node. Añadir una librería
de imágenes al proyecto por archivos que se regeneran una vez al año no se
sostiene, y además habría que sostenerla en el análisis de licencias (P-07).

| Archivo                                          | Qué es                                     |
| ------------------------------------------------ | ------------------------------------------ |
| `drawable/ic_launcher_foreground.xml`            | El isotipo, capa de frente                 |
| `drawable/ic_launcher_monochrome.xml`            | La silueta de Android 13                   |
| `values/ic_launcher_background.xml`              | El color de fondo                          |
| `drawable/logo_bsc_blanco.xml`                   | El logotipo completo, blanco, para la ventana de arranque |
| `mipmap-*/ic_launcher.png` y `_round.png`        | Android 7 y anteriores, cinco densidades   |
| `ic_launcher-playstore.png`                      | La ficha de Google Play, 512×512 sin alfa  |
| `Images.xcassets/AppIcon.appiconset/AppIcon-1024.png` | iOS, 1024×1024 sin alfa               |

Y a mano, porque no son dibujo sino composición:
`mipmap-anydpi-v26/ic_launcher.xml` y `ic_launcher_round.xml` —que apilan las
tres capas—, `drawable/fondo_de_arranque.xml` y el tema `AppTheme.Arranque` de
`values/styles.xml`.

---

## Qué es un «icono adaptativo», en dos párrafos

Desde Android 8 el icono **no es una imagen**: son **dos capas** —un fondo y un
frente— que el sistema apila y luego recorta con una máscara. Cada fabricante
elige su máscara, y por eso el mismo icono sale redondo en un Pixel y con
esquinas redondeadas en un Samsung. Al mover la pantalla de inicio, el sistema
además desplaza las dos capas a distinta velocidad, que es el efecto de
profundidad que se ve al deslizar.

La consecuencia práctica es la **zona segura**. Cada capa mide 108×108 dp, pero
**solo los 72 dp centrales están garantizados**: los 18 dp de cada borde son
zona de recorte y de parallax, y pueden desaparecer.

### De qué tamaño se dibuja el símbolo, y por qué

El isotipo se dibuja con un **diámetro de 52 dp** sobre el lienzo de 108, es
decir ocupando el **72 % del área que la máscara deja ver**.

Se mide por el **círculo que envuelve al símbolo** y no por su caja, porque la
máscara del lanzador también es redonda: un dibujo puede caber holgado en el
cuadro de 72 dp y aun así asomar por las esquinas del círculo. En este caso da
casi igual —el isotipo de BSC es casi circular: su círculo envolvente mide 99.40
unidades y su caja 99.09 de alto— pero la regla queda escrita en términos que
seguirán valiendo si el símbolo cambia de forma.

Material marca dentro de esos 72 dp sus **líneas maestras**: 66 dp para un
dibujo circular y 57 dp para uno cuadrado. Conviene entender que son **topes, no
objetivos**. La primera versión de este icono se dibujó a 65 dp —cumplía el tope
y aun así llenaba la máscara de borde a borde—, y en la pantalla de inicio se
veía desproporcionado al lado de los demás iconos. No llegaba a recortarse; lo
que le faltaba era margen.

Hay una prueba que lo fija (`endurecimientoAndroid.test.ts`, «el símbolo cabe
holgado dentro de la máscara del lanzador»): lee las coordenadas de la capa de
frente, calcula el radio del dibujo desde el centro y falla si su diámetro
supera los 66 dp. Deja margen a propósito para que un retoque de diseño no la
rompa; lo que no permite es volver a llenar la máscara.

**Las piezas de tienda son la excepción, y se dibujan a 62 dp.** La ficha de
Google Play y el icono de iOS son cuadrados y nadie les aplica una máscara
circular: como mucho les redondea las esquinas. Ahí el margen del lanzador sobra
y el mismo 52 haría que el símbolo se viera perdido en medio del cuadro.

Android 13 añadió una tercera capa, la **monocroma**: una silueta en un solo
tono que el sistema recolorea con la paleta del fondo de pantalla del cliente,
para que el icono acompañe al tema del teléfono. Sin ella, la aplicación del
banco se ve como la única ajena entre las demás del cajón.

Esa capa tiene una limitación propia que conviene conocer: **admite un solo
tono**, así que las separaciones blancas que el logotipo tiene entre sus piezas
no se pueden pintar. Se consiguen con la regla de relleno **par-impar**, que
convierte en hueco toda zona donde dos piezas del símbolo se solapan — que es
justo donde el original lleva la separación. El resultado no es idéntico al
icono a color, pero conserva la forma reconocible en vez de quedar en una mancha.

---

## Cómo se comprueba que quedó bien

Los cuatro primeros pasos exigen el teléfono; ninguno se puede dar por bueno
desde el navegador.

1. `npm run build:android` y `adb install -r`.
2. Mirar el icono en el cajón de aplicaciones **y** en la pantalla de inicio, y
   que debajo se lea **«Banco Santa Cruz»**. Buscar «Banco» en el cajón tiene
   que encontrarla.
3. Ajustes → Fondo de pantalla y estilo → **iconos temáticos**, encenderlo y
   comprobar que el icono del banco cambia de color con los demás. Si se queda
   con sus colores, falta la capa monocroma.
4. Deslizar la pantalla de inicio y ver que el isotipo **no se sale** de la
   máscara.
5. **Matar la aplicación y volver a abrirla** (`adb shell am force-stop
   com.bsc.mobile`). El arranque en frío es el único momento en que se ve el
   fondo nativo; con la aplicación ya cargada o al recargar desde Metro, no
   aparece. Lo que hay que mirar es que **el logotipo no salte** al entrar React
   Native.

La pantalla de arranque de React Native sí se revisa en el navegador: está en la
vista previa, la primera de la lista (`npm run web`, pantalla «Arranque»).

---

## Lo que queda abierto

- **La ficha de Google Play** se genera aquí, pero **se sube en la consola**, no
  va dentro del paquete. Cuando llegue el momento de publicar, el archivo está
  en `android/app/src/main/ic_launcher-playstore.png`.
- ~~El nombre que se lee debajo del icono~~ ✅ **Resuelto el 2026-09-18: «Banco
  Santa Cruz»** (D-29). Conviene saber que hay **dos** nombres y que solo se
  cambió uno: el visible, en `values/strings.xml` y en `CFBundleDisplayName`. El
  otro —el `name` de `app.json`, que `MainActivity.getMainComponentName()`
  repite— es el identificador con el que React Native encuentra el componente
  raíz, sigue siendo `BSCMobileAppRN`, y cambiarlo deja la aplicación con una
  pantalla roja al arrancar. Hay una prueba que fija los dos.
- **iOS** recibe el icono de 1024 y su `Contents.json`, pero **no se ha
  compilado nunca**: no hay equipo macOS (P-13). Queda escrito y sin verificar.
