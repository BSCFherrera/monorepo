package com.bsc.mobile.security

import android.os.Build
import android.os.Debug
import com.bsc.mobile.BuildConfig
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import java.io.File

/**
 * Integridad del dispositivo.
 *
 * Sustituye a `flutter_jailbreak_detection` sin traer una dependencia a la
 * ruta por la que el banco decide si entrega un secreto a este teléfono. Son
 * tres comprobaciones baratas y conocidas; ninguna es infalible y ninguna
 * pretende serlo.
 *
 * ⚠️ Lo que este módulo produce es **una señal, no una garantía**. Un atacante
 * con root oculta los binarios, parchea la app o devuelve `false` desde aquí
 * mismo. Lo que sí atrapa es el caso honesto —el cliente cuyo teléfono está
 * comprometido y no lo sabe— y deja constancia del resto en la bitácora del
 * banco. La protección real es que la llave privada nunca sale del hardware
 * seguro.
 */
class DeviceIntegrityModule(private val reactContext: ReactApplicationContext) :
    NativeDeviceIntegritySpec(reactContext) {

    /**
     * Las constantes que la compilación inyecta (D-18).
     *
     * Van aquí y no en un módulo propio por la misma razón que la versión de la
     * aplicación: es un dato de la compilación, se lee una vez y no justifica
     * otro puente nativo.
     *
     * `BuildConfig.BSC_BASE_URL` lo escribe Gradle desde `-PbscBaseUrl` o desde
     * la variable de entorno `BSC_BASE_URL`, y **queda vacío si no se inyectó
     * ninguna**: una release mal configurada debe fallar, no adivinar.
     */
    override fun getTypedExportedConstants(): MutableMap<String, Any> =
        mutableMapOf("baseUrl" to BuildConfig.BSC_BASE_URL)

    companion object {
        const val NAME = "DeviceIntegrity"

        /**
         * Dónde se deja el binario `su` cuando un teléfono está rooteado.
         *
         * Es la lista habitual de las herramientas de root: cada una instala su
         * `su` en alguna de estas rutas. Buscar el archivo es más fiable que
         * ejecutarlo, porque ejecutarlo dispara el diálogo de permiso de la
         * herramienta de root y eso avisa al atacante de que se le está mirando.
         */
        private val RUTAS_DE_SU = arrayOf(
            "/system/bin/su",
            "/system/xbin/su",
            "/sbin/su",
            "/system/su",
            "/system/app/Superuser.apk",
            "/data/local/su",
            "/data/local/bin/su",
            "/data/local/xbin/su",
            "/su/bin/su",
            "/magisk/.core/bin/su",
        )

        /**
         * Aplicaciones de root instaladas.
         *
         * Se busca su directorio en vez de consultar el gestor de paquetes
         * porque desde Android 11 la consulta exige declarar cada paquete en el
         * manifiesto, y una lista de nombres en el manifiesto le dice al
         * atacante exactamente qué se está buscando.
         */
        private val RUTAS_DE_APLICACIONES = arrayOf(
            "/data/data/com.topjohnwu.magisk",
            "/data/data/eu.chainfire.supersu",
            "/data/data/com.noshufou.android.su",
            "/data/data/com.koushikdutta.superuser",
        )
    }

    override fun getName(): String = NAME

    override fun isDeviceCompromised(promise: Promise) {
        try {
            promise.resolve(tieneSu() || tieneAplicacionDeRoot() || firmadaConClavesDePrueba())
        } catch (e: Exception) {
            /*
              Un fallo de la sonda no es una acusación. Si el sistema de
              archivos no deja mirar, lo que se sabe es que no se sabe, y
              bloquear a un cliente legítimo por eso es peor daño que el que se
              quiere evitar.
            */
            promise.resolve(false)
        }
    }

    override fun isDebuggerAttached(promise: Promise) {
        try {
            promise.resolve(Debug.isDebuggerConnected() || Debug.waitingForDebugger())
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    override fun getPackageName(promise: Promise) {
        try {
            promise.resolve(reactContext.packageName)
        } catch (e: Exception) {
            promise.reject("package_name_failed", e.message)
        }
    }

    /**
     * La versión que declara el paquete instalado, no la que alguien escribió
     * en un archivo de JavaScript. Es la que soporte necesita para saber qué
     * compilación tiene delante.
     */
    override fun getAppVersion(promise: Promise) {
        try {
            val info = reactContext.packageManager
                .getPackageInfo(reactContext.packageName, 0)
            promise.resolve(info.versionName ?: "")
        } catch (e: Exception) {
            // La versión es informativa: sin ella el pie se queda en blanco,
            // que es mejor que una pantalla que no carga.
            promise.resolve("")
        }
    }

    /**
     * El número de compilación, que el perfil escribe entre paréntesis. Sale
     * del paquete instalado, igual que la versión.
     */
    override fun getAppBuild(promise: Promise) {
        try {
            val info = reactContext.packageManager
                .getPackageInfo(reactContext.packageName, 0)
            @Suppress("DEPRECATION")
            promise.resolve(info.versionCode.toString())
        } catch (e: Exception) {
            promise.resolve("")
        }
    }

    private fun tieneSu(): Boolean = RUTAS_DE_SU.any { existe(it) }

    private fun tieneAplicacionDeRoot(): Boolean = RUTAS_DE_APLICACIONES.any { existe(it) }

    /**
     * Una compilación firmada con las claves de prueba de AOSP no es la de
     * fábrica: suele ser una ROM personalizada, y esas vienen con root o lo
     * permiten sin resistencia.
     */
    private fun firmadaConClavesDePrueba(): Boolean =
        Build.TAGS?.contains("test-keys") == true

    /**
     * `File.exists()` lanza cuando la política de SELinux prohíbe mirar la
     * ruta, que es lo corriente en un teléfono sano para varias de estas. Sin
     * este envoltorio, la primera ruta protegida abortaría el recorrido y las
     * demás no se comprobarían nunca.
     */
    private fun existe(ruta: String): Boolean =
        try {
            File(ruta).exists()
        } catch (e: Exception) {
            false
        }
}
