# BSC.MobileAppRN

Banca móvil de **Banco Santa Cruz** en React Native. Migración de `BSC.MobileApp` (Flutter).

**Estado:** Fase 2 — Cimientos (oleada 0). Gate A cerrado, Gate B en curso.

---

## Requisitos

| Herramienta | Versión | Nota |
|---|---|---|
| Node | ≥ 22.11 | Verificado con 24.20 |
| JDK | 17 | `C:\Program Files\Microsoft\jdk-17.*` |
| Android SDK | compileSdk 37 | En `C:\Users\<usuario>\Android\Sdk` |
| Xcode / macOS | — | iOS compila y corre en el simulador. El Secure Enclave y la biometría **siguen sin verificar** en un iPhone físico (P-13) |

### Red del banco

La red corporativa intercepta TLS con una CA propia. Windows confía en ella; el almacén de certificados del JDK **no**. Sin esto, cualquier descarga de Gradle falla con `unable to find valid certification path`.

Ya está resuelto en `android/gradle.properties` mediante `-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT`. Si aparece ese error en otra herramienta basada en Java, la causa es la misma.

## Arranque

Desde la raíz del monorepo:

```bash
pnpm install            # dependencias compartidas de todo el monorepo
pnpm banking:start      # terminal 1: Metro
pnpm banking:android    # terminal 2: compila e instala (o pnpm banking:ios)
```

Los comandos están definidos una sola vez, en los `targets` de [`project.json`](project.json). `pnpm banking:*` (en el `package.json` de la raíz) y `pnpm start|android|ios` (dentro de esta carpeta) son atajos a `pnpm nx run BSC.genesis.mobile.banking:<target>`: para cambiar un comando se edita `project.json`, nunca un `package.json`.

El target `android` corre `react-native run-android --no-packager --active-arch-only`:

- `--no-packager`: no busca ni arranca Metro. En Windows la CLI cree que el puerto 8081 está ocupado aunque sea nuestro Metro (compara la ruta del proyecto con `/` contra `\`) y la pregunta que hace se congela dentro de Nx. Por eso Metro se arranca siempre antes, en su propia terminal.
- `--active-arch-only`: compila solo para la arquitectura del dispositivo conectado (arm64 en un teléfono, x86_64 en el emulador). `gradle.properties` fija arm64-v8a para no agotar la memoria; sin este flag, el APK no arranca en un emulador x86_64 (`couldn't find DSO to load: libreactnative.so`).

Si Metro falla con `EADDRINUSE :::8081`, quedó un Metro huérfano de una sesión anterior:

```powershell
Get-NetTCPConnection -LocalPort 8081 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess }
```

Para probar contra el backend local desde un teléfono por USB, el teléfono no alcanza la laptop por la red interna: hay que tunelizar por el cable.

```bash
adb reverse tcp:5000 tcp:5000
```

### Emulador de Android

En un emulador, React Native busca Metro en `10.0.2.2:8081`, y la política de red de depuración (`android/app/src/debug/res/xml/configuracion_de_red.xml`) solo permite tráfico sin cifrar hacia `localhost`: **a propósito no incluye ninguna dirección privada** (T-10). El síntoma es la pantalla roja «Unable to load script» y, en `adb logcat`, `CLEARTEXT communication to 10.0.2.2 not permitted`.

La solución es apuntar la app a `localhost`, que llega a la laptop por `adb reverse`, sin tocar la política:

1. Con la app abierta, `Ctrl+M` → **Change Bundle Location** → `localhost:8081` → recargar.
2. Túneles de Metro y del backend (`run-android` crea el de Metro, pero no está de más):

   ```bash
   adb reverse tcp:8081 tcp:8081
   adb reverse tcp:5000 tcp:5000
   ```

El ajuste se guarda en la app: sobrevive a reinicios y reinstalaciones con `:android`, pero se pierde al desinstalar, borrar los datos o cambiar de emulador. Los túneles de `adb reverse` se pierden al reiniciar el emulador.

### Apuntar a otro backend (QA)

La URL del backend **no está escrita en el repositorio** (D-18, T-10): se inyecta al compilar con la variable `BSC_BASE_URL`. En depuración, si no se inyecta ninguna se usa `http://localhost:5000`; en release, sin URL la app se niega a arrancar, a propósito.

```bash
# Depurar contra QA, desde la raíz del monorepo
BSC_BASE_URL=<url de QA> pnpm banking:ios
BSC_BASE_URL=<url de QA> pnpm banking:android
```

- La URL queda dentro de la compilación nativa (`Info.plist` en iOS, `BuildConfig` en Android): **cambiarla exige recompilar**, recargar Metro no basta.
- Tiene que ser `https`: fuera de `localhost`, las dos plataformas bloquean el tráfico sin cifrar.
- Si el certificado de QA lo emite una autoridad interna del banco (o la red la intercepta, ver «Red del banco»), el simulador o el emulador tiene que confiar en ella:
  - **iOS:** arrastrar el certificado al simulador y activarlo en *Ajustes → General → Información → Ajustes de confianza de certificados*.
  - **Android:** instalarlo como certificado de usuario. Solo la compilación de depuración confía en ellos; la de release, no.
- Si QA solo se alcanza por la VPN, el Mac tiene que estar conectado: el simulador y el emulador usan su red.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run verify` | Todas las comprobaciones. Falla con código distinto de cero ante cualquier incumplimiento |
| `npm run typecheck` | TypeScript en modo estricto |
| `npm run lint` | ESLint |
| `npm run format:check` | Prettier |
| `npm test` | Pruebas de la app |
| `npm run test:shared` | Pruebas del paquete compartido, con umbrales de cobertura |
| `npm run build:android` | APK de release |

## Estructura

```
src/
├── specs/            Interfaces tipadas entre JavaScript y código nativo (codegen)
├── app/              Arranque, navegación, tema
├── core/             Red, seguridad, composición de dependencias
├── features/         Un directorio por feature, con los mismos límites que la app Flutter
└── design-system/    Tokens y componentes

packages/bsc-shared/  Lógica pura compartida con el portal Nuxt
android/app/src/main/java/com/bsc/mobile/security/
                      Módulos nativos de seguridad, portados del Kotlin de Flutter
docs/migration/       Documentación de la migración
```

### `packages/bsc-shared` — la razón de ser de la migración

Hoy el algoritmo de la huella canónica de operaciones existe **tres veces**: C# en el backend, TypeScript en el portal y Dart en la app móvil. Los tres archivos se advierten mutuamente de que un solo carácter de diferencia rechaza la transacción.

Este paquete elimina la copia Dart. Todo lo que contiene es puro —sin React, sin red, sin plataforma— para que el mismo código corra en el teléfono y en el navegador.

Su prueba más importante verifica que la huella coincida **carácter por carácter** con la que produce el backend, usando los mismos vectores que la app Flutter.

### Módulos nativos de seguridad

`DeviceKeyModule` genera un par de llaves EC P-256 dentro del StrongBox del teléfono: no exportable, exige biometría fuerte en cada firma, y se invalida sola si alguien inscribe una huella o un rostro nuevo. El banco solo guarda la llave pública, así que ni el banco puede firmar por el cliente.

Está escrito a mano, sin librerías de npm, porque está en la ruta por la que se firma el dinero — un paquete comprometido ahí sería un compromiso de la autorización. La criptografía se portó **literalmente** desde el Kotlin de la app Flutter; lo único que cambió es el puente hacia JavaScript.

## Documentación

Todo el alcance, las decisiones y los riesgos están en [`docs/migration/`](docs/migration/). Empezar por [`00-executive-summary.md`](docs/migration/00-executive-summary.md), que incluye un glosario para quien no venga de Flutter.

Estado y próxima acción: [`SESSION-HANDOFF.md`](docs/migration/SESSION-HANDOFF.md).

## Repositorios relacionados

| Repositorio | Papel |
|---|---|
| `BSC.MobileApp` | App Flutter — **especificación funcional de referencia** |
| `BSC.BSCEnLinea.BackEnd` | API .NET. **No se modifica** |
| `BSC.BSCEnLinea.FrontEnd` | Portal Nuxt — socio del paquete compartido |
