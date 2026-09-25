# @bsc/i18n

El sistema de traducción de las apps de BSC: [i18next](https://www.i18next.com/)
con [react-i18next](https://react.i18next.com/), y tres decisiones encima:

- **El español es el idioma de origen**, y hoy el único. Todo texto se escribe
  primero en español.
- **El idioma lo elige el cliente dentro de la app** (un selector), no se toma
  del teléfono.
- **Las fechas no usan `Intl`**: Hermes no trae los datos de
  internacionalización en todas las compilaciones. Los nombres de mes y el
  «a. m.»/«p. m.» salen de las traducciones (`@bsc/i18n/calendario`). Los montos
  no cambian con el idioma (español dominicano e inglés agrupan igual:
  `1,234.56`).

## Escribir un texto nuevo

1. Añádelo al archivo de su funcionalidad, en español:
   `apps/BSC.genesis.mobile.banking/src/locales/es/<funcionalidad>.json`. La clave va en
   inglés y describe la función, no el texto: `login.signIn`, no
   `login.iniciarSesion` ni el texto entero.
2. Úsalo:
   - en una pantalla: `const { t } = useTranslation('auth');` y `t('login.signIn')`;
   - fuera de React (almacenes, mensajes de error): `t('auth:errors.timeout')`.
3. Variables con `{{nombre}}`: `"switchAccount": "¿No eres {{name}}? Cambiar cuenta"`
   y `t('login.switchAccount', { name })`. **Nunca se concatenan frases**: en
   otro idioma el orden de las palabras cambia.

Una clave mal escrita o que no existe es un **error de `typecheck`**
(`src/i18n/tipos.ts`). Una funcionalidad ya migrada que vuelva a tener texto a
mano en el JSX es un **error de lint** (`i18next/no-literal-string`, en
`.eslintrc.js`).

## Una funcionalidad nueva

1. Crea `src/locales/es/<funcionalidad>.json`.
2. Regístralo en `RECURSOS` (`src/i18n/index.ts`) y en los tipos
   (`src/i18n/tipos.ts`). La prueba `traducciones.test.ts` falla si un archivo
   de `locales/es` no está registrado.
3. Cuando la funcionalidad no tenga ya textos a mano, añádela a la lista de la
   regla `i18next/no-literal-string` en `.eslintrc.js`.

## Añadir inglés

1. `en: { nombre: 'English' }` en `IDIOMAS` (`src/idiomas.ts`). El nombre va en
   su propio idioma: así lo reconoce quien no entiende el idioma actual.
2. `libs/shared-i18n/src/locales/en/common.json` y `instancia.ts` (`PROPIOS`).
3. `apps/BSC.genesis.mobile.banking/src/locales/en/*.json`, uno por archivo de `es`, y su
   entrada en `RECURSOS`.
4. `traducciones.test.ts` comprueba que `en` tenga **las mismas claves y las
   mismas variables** que `es`. Lo que falte se ve en español, nunca como clave.
5. Textos del sistema operativo, que siguen el idioma **del teléfono**, no el de
   la app:
   - iOS: `en.lproj/InfoPlist.strings` con `NSFaceIDUsageDescription`, y `en`
     en las regiones del proyecto de Xcode.
   - Android: no hay textos de permisos que traducir hoy.

## El selector de idioma

El sistema ya está listo para él; falta la pantalla. Lo que la pantalla usa:

```ts
import { IDIOMAS, cambiarIdioma, idiomaActual } from '@bsc/i18n';
import { almacenDeIdioma } from '../i18n';

// Las opciones: Object.entries(IDIOMAS) → [['es', { nombre: 'Español' }], …]
await cambiarIdioma('en', almacenDeIdioma); // toda la app cambia al instante
```

El idioma elegido se guarda (`SecureKeys.language`), sobrevive al cierre de
sesión y se aplica al arrancar (`restaurarIdioma` en `AppRoot`).

## Textos en código nativo

Los diálogos biométricos reciben sus textos **desde JavaScript**, ya
traducidos (`NativeBiometric.authenticate(motivo, titulo, cancelar)`): un texto
escrito en Kotlin o Swift saldría en el idioma del teléfono, no en el elegido
en la app.

Pendiente: el diálogo de firma de `DeviceKey` («Autoriza la operación») aún
escribe sus textos en Kotlin y en Swift; se pasan a JavaScript al migrar las
funcionalidades que firman (transferencias y pagos).
