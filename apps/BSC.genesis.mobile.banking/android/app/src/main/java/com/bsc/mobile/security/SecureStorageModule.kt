package com.bsc.mobile.security

import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray

/**
 * Almacenamiento cifrado por el sistema operativo.
 *
 * Respaldado por `EncryptedSharedPreferences` con una llave maestra AES-256 del
 * Keystore de Android. Es la misma garantía que daba la app Flutter con
 * `flutter_secure_storage` y `encryptedSharedPreferences: true`, así que un
 * dispositivo que ya estuviera enrolado conserva el mismo nivel de protección.
 *
 * Tanto las claves como los valores se cifran: sin cifrar la clave, el solo
 * nombre `bsc_soft_token_secret` en el archivo de preferencias ya le diría a un
 * atacante dónde mirar.
 *
 * La llave maestra **no exige autenticación del usuario**, a diferencia de la
 * llave de firma. Es deliberado: la app necesita leer el token de sesión al
 * arrancar para saber si hay sesión, y pedir la huella para eso convertiría
 * cada apertura en una fricción. Lo que protege este almacén es el cifrado en
 * reposo; lo que protege el dinero es la llave del StrongBox, que sí la exige.
 */
class SecureStorageModule(private val reactContext: ReactApplicationContext) :
    NativeSecureStorageSpec(reactContext) {

    companion object {
        const val NAME = "SecureStorage"

        /**
         * Nombre del archivo de preferencias. Distinto del que usaba Flutter
         * (`FlutterSecureStorage`) porque son aplicaciones distintas y sus datos
         * no se comparten.
         */
        private const val ARCHIVO = "bsc_secure_store"
    }

    override fun getName(): String = NAME

    /**
     * Se crea una sola vez y se reutiliza: construir
     * `EncryptedSharedPreferences` implica descifrar la llave maestra, y hacerlo
     * en cada lectura haría notablemente más lento el arranque.
     */
    private val preferencias: SharedPreferences by lazy {
        val llaveMaestra = MasterKey.Builder(reactContext)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            reactContext,
            ARCHIVO,
            llaveMaestra,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    override fun getItem(key: String?, promise: Promise) {
        if (key.isNullOrEmpty()) {
            promise.reject("invalid_argument", "Falta la clave")
            return
        }

        try {
            promise.resolve(preferencias.getString(key, null))
        } catch (e: Exception) {
            promise.reject("secure_storage_error", e.message)
        }
    }

    override fun setItem(key: String?, value: String?, promise: Promise) {
        if (key.isNullOrEmpty()) {
            promise.reject("invalid_argument", "Falta la clave")
            return
        }

        try {
            // `commit` y no `apply`: quien guarda un token necesita saber que
            // quedó escrito antes de continuar. `apply` es asíncrono y un cierre
            // inmediato de la app podría perderlo.
            preferencias.edit().putString(key, value ?: "").commit()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("secure_storage_error", e.message)
        }
    }

    override fun removeItem(key: String?, promise: Promise) {
        if (key.isNullOrEmpty()) {
            promise.reject("invalid_argument", "Falta la clave")
            return
        }

        try {
            preferencias.edit().remove(key).commit()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("secure_storage_error", e.message)
        }
    }

    /**
     * Borra varias claves en una sola transacción.
     *
     * Cerrar sesión debe ser atómico: si se borrara clave por clave y la app
     * muriera a mitad, quedaría un estado imposible —por ejemplo, con token de
     * renovación pero sin token de acceso— que la app no sabría interpretar.
     *
     * No se ofrece un «borrar todo» porque borraría también el identificador de
     * instalación y el secreto del dispositivo, que deben sobrevivir al cierre
     * de sesión: perderlos obligaría al cliente a re-enrolar el teléfono cada
     * vez que sale de la app.
     */
    override fun removeItems(keys: ReadableArray?, promise: Promise) {
        if (keys == null) {
            promise.reject("invalid_argument", "Falta la lista de claves")
            return
        }

        try {
            val editor = preferencias.edit()
            for (i in 0 until keys.size()) {
                keys.getString(i)?.let { editor.remove(it) }
            }
            editor.commit()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("secure_storage_error", e.message)
        }
    }
}
