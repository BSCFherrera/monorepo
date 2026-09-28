# Dependencias compartidas entre las apps móviles

Las apps React Native del monorepo (`apps/BSC.genesis.mobile.banking` y las que
se agreguen, como `apps/BSC.genesis.conversational`) usan **las mismas
dependencias y en la misma versión**. Así un componente de `libs/shared-ui-native`
o una utilidad de `libs/shared-utils` se comporta igual en todas, y un módulo
nativo nunca existe en dos versiones dentro del workspace.

## Cómo funciona

La fuente única de versiones es el **catálogo de pnpm**, en
[`pnpm-workspace.yaml`](../../pnpm-workspace.yaml):

```yaml
catalog:
  "react": "19.2.3"
  "react-native": "0.87.1"
  "react-native-svg": "^15.15.5"
  # …
```

Cada `package.json` de `apps/**` y `libs/**` referencia la entrada en vez de
escribir la versión:

```json
"dependencies": {
  "react": "catalog:",
  "react-native": "catalog:",
  "@bsc/ui-native": "workspace:*"
}
```

pnpm resuelve **una sola versión por entrada** para todo el workspace y la
registra en la sección `catalogs:` de `pnpm-lock.yaml`. Cambiar una versión es
cambiar una línea del catálogo; todas las apps y libs la toman a la vez.

### Por qué cada app conserva su propio `package.json`

Un único `package.json` para dos apps React Native no funciona, por la forma en
que se integra lo nativo:

| Quién | Qué lee del `package.json` de la app |
|---|---|
| CLI de React Native (autolinking) | Solo las `dependencies` **directas** de la app. Un módulo nativo que la app no declare compila, pero falla al ejecutarse. |
| Gradle (`android/settings.gradle`) | `../node_modules/@react-native/gradle-plugin`, el `node_modules` de la propia app. |
| CocoaPods (`ios/Podfile`) | Resuelve `react-native` desde la carpeta de la app. |
| `versionCode` / `CFBundleVersion` | El campo `version` de la app (cada app publica su propia versión). |
| Codegen | `codegenConfig`, que es propio de cada app. |

Por eso se comparte **la versión** de cada dependencia (catálogo) y **el
conjunto** de dependencias (chequeo), no el archivo.

## Reglas

Las comprueba `pnpm deps:check` (también corre dentro de
`pnpm nx run BSC.genesis.mobile.banking:verify`):

1. Ningún paquete de `apps/**` o `libs/**` escribe una versión de terceros: usa
   `catalog:`. Los paquetes propios usan `workspace:*`.
2. Todo `catalog:` apunta a una entrada existente del catálogo.
3. Todas las apps React Native (`apps/<nombre>` con `react-native` en
   `dependencies`) declaran el mismo conjunto de dependencias de terceros, en la
   misma sección (`dependencies` / `devDependencies`). Los paquetes propios
   (`workspace:`) quedan fuera: cada app puede tener los suyos, como `@bsc/shared`.

El `package.json` de la raíz (Nx, ESLint y Prettier del workspace) queda fuera
del catálogo: es herramienta del monorepo, no de las apps.

## Tareas habituales

### Instalar

```bash
corepack enable        # usa el pnpm fijado en packageManager (9.15.0)
pnpm install
```

### Agregar una dependencia nueva

1. Añade la entrada al catálogo en `pnpm-workspace.yaml`.
2. Declárala con `"catalog:"` en la app (o lib) que la usa.
3. `pnpm deps:sync` la copia a las demás apps móviles.
4. `pnpm install` actualiza `pnpm-lock.yaml`.
5. Si es un módulo nativo: `pod install` en el `ios/` de **cada** app y
   compila Android e iOS de todas las apps.
6. Si va en `dependencies` de mobile banking: `node scripts/generar-sbom.mjs`
   desde la carpeta de la app para regenerar `docs/sbom.json`.

### Subir una versión

Cambia la línea en el catálogo y corre `pnpm install`. Las entradas de React /
React Native (`react`, `react-native`, `@react-native/*`, la CLI,
`hermes-compiler`) y los módulos `react-native-*` se suben **juntas**, en un solo
cambio, con `pod install` y compilación de todas las apps antes de integrar.

### Agregar la segunda app React Native

1. Genera el proyecto nativo con la plantilla oficial de React Native
   `0.87.1` en `apps/<nombre>` (ver la guía `idioms/react-native/mobile-app`
   del charter), con su propio `applicationId` / bundle id y su nombre en
   `app.json`.
2. En su `package.json` deja `name`, `version`, `private`, los scripts y los
   paquetes propios (`"@bsc/ui-native": "workspace:*"`, etc.). Sin versiones de
   terceros.
3. `pnpm deps:sync` añade todas las dependencias de terceros que ya declara
   mobile banking, como `catalog:`.
4. `pnpm install` y `pod install` en su `ios/`.
5. Toma de mobile banking la configuración que hace funcionar el monorepo:
   - `metro.config.js`: `watchFolders` y `nodeModulesPaths` sobre la raíz, y la
     lista `UNA_SOLA_COPIA`, que obliga a resolver React / React Native y los
     módulos nativos compartidos desde la app (una sola copia en el bundle).
   - `jest.config.js`: el `transformIgnorePatterns` con el prefijo de `.pnpm`.
   - `project.json`: los targets `start`, `android`, `ios`, `lint`,
     `typecheck`, `test` y sus `tags` (una etiqueta `scope:` nueva se registra en
     `eslint.module-boundaries.cjs`).
6. `codegenConfig` es propio de cada app: no copies el de mobile banking salvo
   que la app nueva incluya esos mismos módulos nativos.
7. Para correr las dos apps a la vez, cada Metro necesita su propio puerto
   (`react-native start --port 8082` en la segunda).
8. `pnpm deps:check` debe terminar en verde.

## Comandos

| Comando (desde la raíz) | Qué hace |
|---|---|
| `pnpm deps:check` | Verifica las tres reglas; falla con la lista de problemas. |
| `pnpm deps:sync` | Cambia a `catalog:` las versiones escritas a mano que ya están en el catálogo y añade a cada app lo que le falta respecto de las otras. Después hay que correr `pnpm install`. |

El código está en [`tools/scripts/check-mobile-deps.mjs`](../../tools/scripts/check-mobile-deps.mjs)
y [`tools/scripts/pnpm-catalog.mjs`](../../tools/scripts/pnpm-catalog.mjs); este
último también lo usa `scripts/generar-sbom.mjs` para que el inventario guarde el
rango real y no la palabra `catalog:`.
