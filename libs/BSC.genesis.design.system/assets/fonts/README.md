# Google Sans Flex

La fuente del sistema de diseño (`family/primary` en Figma). Licencia SIL Open
Font License 1.1: ver `OFL.txt`.

Google la publica solo como fuente variable. React Native en Android no elige
bien los pesos de una fuente variable, así que aquí van **cortes estáticos**,
uno por peso que usa la app: 400, 500, 600, 700 y 800. Los cinco se registran
con la familia «Google Sans Flex», de modo que `fontFamily` + `fontWeight`
elige el corte real en todas las plataformas.

## Dónde se registran

Estos archivos son el original. Las apps llevan copias:

- iOS: `ios/<App>/Fonts/`, en el grupo `Fonts` del proyecto de Xcode (fase
  *Copy Bundle Resources*) y en `UIAppFonts` de `Info.plist`.
- Android: `android/app/src/main/res/font/google_sans_flex_*.ttf`, más
  `google_sans_flex.xml` (la familia) y
  `ReactFontManager.addCustomFont(this, "Google Sans Flex", R.font.google_sans_flex)`
  en `MainApplication`.
- Vista previa web: `web/fuentes.css` usa estos mismos archivos.

## Cómo se generaron

A partir de `GoogleSansFlex[GRAD,ROND,opsz,slnt,wdth,wght].ttf` de
[google/fonts](https://github.com/google/fonts/tree/main/ofl/googlesansflex),
con fontTools 4.60.1 (`fontTools.varLib.instancer`). Cada eje queda fijo en su
valor por defecto (`opsz` 18, `wdth` 100, `GRAD` 0, `ROND` 0, `slnt` 0) salvo
`wght`. La tabla de nombres usa la familia tipográfica «Google Sans Flex»
(IDs 16/17) y el nombre PostScript `GoogleSansFlex-<Peso>`.

Figma ajusta el tamaño óptico (`opsz`) al tamaño del texto; estos cortes lo
fijan en 18, así que en títulos grandes el trazo puede verse un poco distinto
que en Figma.
