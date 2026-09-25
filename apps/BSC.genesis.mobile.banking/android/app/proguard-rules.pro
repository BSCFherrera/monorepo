# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ─────────────────────────────────────────────────────────────────────────────
# Reglas de BSC (T-07)
#
# R8 está encendido en release. Reduce y ofusca el código Java/Kotlin, que es lo
# que hace más caro leer el APK con un descompilador. **No toca el paquete de
# JavaScript**: eso lo cubre Hermes, que lo compila a bytecode.
#
# Cada `keep` de aquí abajo existe porque sin él algo deja de funcionar **solo
# en release**, que es la peor forma de romper una aplicación: la compilación de
# depuración sigue bien y el fallo aparece en la tienda.
# ─────────────────────────────────────────────────────────────────────────────

# Los módulos nativos propios se resuelven por nombre desde JavaScript, así que
# R8 no ve quién los usa y los borraría. Son la llave de firma, el almacenamiento
# cifrado, la biometría, el bloqueo de capturas, la integridad y el PDF.
-keep class com.bsc.mobile.security.** { *; }

# La clase generada del BuildConfig la lee el módulo de integridad.
-keep class com.bsc.mobile.BuildConfig { *; }

# React Native resuelve por reflexión los módulos y sus métodos anotados.
-keep,includedescriptorclasses class com.facebook.react.bridge.** { *; }
-keepclassmembers class * { @com.facebook.react.bridge.ReactMethod <methods>; }
-keepclassmembers class * { @com.facebook.proguard.annotations.DoNotStrip *; }
-keep @com.facebook.proguard.annotations.DoNotStrip class *

# Hermes y el puente JSI.
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# AndroidX Security y Biometric: usan reflexión para elegir implementación según
# la versión del sistema.
-keep class androidx.security.crypto.** { *; }
-keep class androidx.biometric.** { *; }

# Las trazas de una excepción sin esto son ilegibles, y con ellas se diagnostica
# un fallo en producción. El mapa de ofuscación queda fuera del APK.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Se quitan los registros de Android que quedaran en código nativo. El
# equivalente de JavaScript lo hace `scripts/babel-quitar-console.js`.
-assumenosideeffects class android.util.Log {
    public static *** v(...);
    public static *** d(...);
    public static *** i(...);
    public static *** w(...);
}
