# App Conversacional BSC - Guía de Instalación y Configuración

## Pasos para configurar el proyecto desde cero

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Android

#### a. Instalar requisitos

- Java JDK 17
- Android Studio
- Android SDK (API 34)

#### b. Configurar variables de entorno

**Windows (PowerShell):**

```powershell
# Temporal (para la sesión actual)
$env:ANDROID_HOME = "C:\Users\TuUsuario\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"

# Permanente (agregar al PATH del sistema)
# 1. Buscar "Variables de entorno" en Windows
# 2. Agregar ANDROID_HOME y JAVA_HOME
# 3. Agregar al Path:
#    - %ANDROID_HOME%\platform-tools
#    - %ANDROID_HOME%\tools
#    - %JAVA_HOME%\bin
```

#### c. Crear proyecto Android

Si la carpeta `android` no existe, crearla manualmente o ejecutar:

```bash
npx react-native init TempProject
# Copiar la carpeta android de TempProject a este proyecto
# Eliminar TempProject
```

#### d. Modificar archivos Android

**android/build.gradle:**

```gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 24
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "26.1.10909125"
        kotlinVersion = "1.9.22"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
    }
}
```

**android/app/build.gradle:**

```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

android {
    namespace "com.appconversacionalbsc"
    compileSdkVersion 34

    defaultConfig {
        applicationId "com.appconversacionalbsc"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
    }
}

dependencies {
    implementation("com.facebook.react:react-android")
}
```

**android/app/src/main/AndroidManifest.xml:**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme">
      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>
</manifest>
```

### 3. Configurar iOS (solo macOS)

```bash
cd ios
pod install
cd ..
```

### 4. Ejecutar la aplicación

```bash
# Iniciar Metro
npm start

# En otra terminal, ejecutar Android
npm run android

# O para iOS (macOS)
npm run ios
```

## Estructura de archivos nativos necesarios

### Android

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/appconversacionalbsc/
│   │       │   ├── MainActivity.kt
│   │       │   └── MainApplication.kt
│   │       ├── res/
│   │       │   ├── values/strings.xml
│   │       │   └── ...
│   │       └── AndroidManifest.xml
│   └── build.gradle
├── gradle/
├── build.gradle
├── settings.gradle
└── gradle.properties
```

### iOS

```
ios/
├── AppConversacionalBSC/
│   ├── AppDelegate.h
│   ├── AppDelegate.mm
│   ├── Info.plist
│   └── main.m
├── AppConversacionalBSC.xcodeproj/
├── AppConversacionalBSC.xcworkspace/
└── Podfile
```

## Configuración del WebSocket

Editar `src/constants/config.ts`:

```typescript
export const APP_CONFIG = {
  WEBSOCKET_URL: 'ws://tu-servidor:8080', // Cambiar según tu servidor
  // ...
};
```

## Problemas comunes

### 1. "Unable to load script from assets"

```bash
# Limpiar cache
npm start -- --reset-cache

# Reconstruir
cd android
./gradlew clean
cd ..
npm run android
```

### 2. "Task :app:installDebug FAILED"

- Verificar que el emulador esté corriendo
- Verificar permisos USB debugging
- Limpiar y reconstruir:

```bash
cd android
./gradlew clean
cd ..
```

### 3. Metro bundler no se conecta

```bash
adb reverse tcp:8081 tcp:8081
```

### 4. Dependencias de navegación

Si hay errores con React Navigation:

```bash
npm install react-native-screens react-native-safe-area-context
```

Para Android, agregar en `android/app/src/main/java/.../MainActivity.kt`:

```kotlin
import android.os.Bundle

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
}
```

## Siguientes pasos

1. Configurar el servidor WebSocket
2. Implementar autenticación
3. Agregar manejo de tokens
4. Configurar variables de entorno para desarrollo/producción
5. Configurar CI/CD

---

**Desarrollado para Banco Santa Cruz**
