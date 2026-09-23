package com.bsc.mobile.security

import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Verificación biométrica del cliente, para desbloquear la app.
 *
 * Distinta de `DeviceKeyModule`: allí la biometría autoriza el uso de una llave
 * del hardware para firmar dinero, y la exigencia la impone el sistema
 * operativo sobre la llave. Aquí solo se comprueba identidad, sin material
 * criptográfico de por medio.
 *
 * Portado de `biometric_auth.dart`, que usaba `local_auth`.
 */
class BiometricAuthModule(private val reactContext: ReactApplicationContext) :
    NativeBiometricSpec(reactContext) {

    companion object {
        const val NAME = "BiometricAuth"

        /**
         * Solo biometría fuerte, igual que la llave de firma.
         *
         * `BIOMETRIC_WEAK` incluye reconocimiento facial que el fabricante no
         * certifica como seguro —el que se engaña con una foto en algunos
         * teléfonos—. Para entrar a la banca no alcanza.
         */
        private const val AUTENTICADORES = BiometricManager.Authenticators.BIOMETRIC_STRONG
    }

    override fun getName(): String = NAME

    override fun isAvailable(promise: Promise) {
        try {
            val estado = BiometricManager.from(reactContext).canAuthenticate(AUTENTICADORES)
            promise.resolve(estado == BiometricManager.BIOMETRIC_SUCCESS)
        } catch (e: Exception) {
            // Una sonda de capacidad nunca debe lanzar: quien la llama la usa
            // para decidir qué mostrar, y una excepción deja la pantalla
            // colgada.
            promise.resolve(false)
        }
    }

    /**
     * Si el teléfono tiene reconocimiento facial inscrito.
     *
     * **En Android siempre devuelve `false`, y es lo correcto.**
     *
     * Android no expone qué modalidad tiene inscrita el cliente: `BiometricManager`
     * solo dice si hay alguna que cumpla el nivel pedido. Las características
     * del dispositivo tampoco sirven — este mismo Pixel declara
     * `android.hardware.biometrics.face` **y** `android.hardware.fingerprint`, y
     * declararlas significa que el hardware existe, no que el cliente lo haya
     * configurado.
     *
     * La app Flutter tiene el mismo límite: `local_auth` en Android devuelve
     * `BiometricType.strong` y `BiometricType.weak`, nunca `face`, así que su
     * `hasFaceId()` es siempre falso y el botón dice «Entrar con tu huella». Una
     * primera versión aquí dedujo el rostro por la característica declarada y el
     * botón pasó a decir «Face ID» en un teléfono donde el cliente usa huella —
     * es decir, le pedía algo que no podía hacer, que es exactamente el defecto
     * que el comentario de `login_screen.dart` dice haber corregido.
     *
     * En iOS sí tiene sentido: allí Face ID y Touch ID se distinguen de verdad,
     * y el módulo de Swift debe devolver el valor real.
     */
    override fun hasFaceUnlock(promise: Promise) {
        promise.resolve(false)
    }

    /**
     * Los tres textos del diálogo llegan de JavaScript ya traducidos: el idioma
     * lo elige el cliente en la app y no tiene por qué ser el del teléfono.
     */
    override fun authenticate(
        reason: String?,
        title: String?,
        cancelLabel: String?,
        promise: Promise
    ) {
        val activity = reactContext.currentActivity as? FragmentActivity
        if (activity == null) {
            promise.reject("no_activity", "No hay una pantalla activa")
            return
        }

        val resuelta = AtomicBoolean(false)

        activity.runOnUiThread {
            val prompt = BiometricPrompt(
                activity,
                ContextCompat.getMainExecutor(activity),
                object : BiometricPrompt.AuthenticationCallback() {

                    override fun onAuthenticationSucceeded(
                        result: BiometricPrompt.AuthenticationResult
                    ) {
                        if (resuelta.compareAndSet(false, true)) promise.resolve(true)
                    }

                    /**
                     * Cancelación o error terminal. Resuelve `false` en lugar de
                     * rechazar: para quien llama, «no se verificó» no es una
                     * excepción sino una respuesta, y tratarla como error
                     * obligaría a envolver cada llamada.
                     */
                    override fun onAuthenticationError(
                        errorCode: Int,
                        errString: CharSequence
                    ) {
                        if (resuelta.compareAndSet(false, true)) promise.resolve(false)
                    }

                    /** Intento fallido pero no terminal: el sistema deja reintentar. */
                    override fun onAuthenticationFailed() = Unit
                }
            )

            val info = BiometricPrompt.PromptInfo.Builder()
                .setTitle(title.orEmpty())
                .setSubtitle(reason.orEmpty())
                .setAllowedAuthenticators(AUTENTICADORES)
                .setNegativeButtonText(cancelLabel.orEmpty())
                .build()

            try {
                prompt.authenticate(info)
            } catch (e: Exception) {
                if (resuelta.compareAndSet(false, true)) promise.resolve(false)
            }
        }
    }
}
