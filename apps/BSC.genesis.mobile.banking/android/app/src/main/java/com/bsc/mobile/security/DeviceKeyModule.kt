package com.bsc.mobile.security

import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyInfo
import android.security.keystore.KeyPermanentlyInvalidatedException
import android.security.keystore.KeyProperties
import android.security.keystore.StrongBoxUnavailableException
import android.security.keystore.UserNotAuthenticatedException
import android.util.Base64
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import java.security.KeyFactory
import java.util.concurrent.atomic.AtomicBoolean
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.PrivateKey
import java.security.Signature
import java.security.spec.ECGenParameterSpec

/**
 * Par de llaves de firma del dispositivo, dentro del hardware seguro.
 *
 * Portado de `DeviceKeyPlugin.kt` de la app Flutter. **La criptografía es la
 * misma, literalmente**: lo único que cambió es el puente hacia JavaScript, que
 * pasó de `MethodChannel` a TurboModule. Se hizo así a propósito — reescribir
 * la parte criptográfica sería introducir riesgo sin ganar nada.
 *
 * Esto es lo que reemplaza al secreto compartido para autorizar transacciones.
 * La diferencia no es de forma: un secreto simétrico existe en el servidor y en
 * el teléfono, así que comprometer cualquiera de los dos permite producir
 * autorizaciones válidas. Aquí la llave privada se genera dentro del StrongBox
 * o del Keystore respaldado por hardware, está marcada como no exportable, y
 * además exige verificación del usuario para cada uso. El banco solo guarda la
 * pública, así que ni el banco puede firmar en nombre del cliente.
 *
 * Se escribió a mano en vez de usar un paquete de npm por una razón concreta:
 * está en la ruta de la firma de transacciones, así que un paquete comprometido
 * sería un compromiso de la autorización. Y porque hacen falta cuatro
 * parámetros que la mayoría de los paquetes no exponen:
 *
 *  - setUserAuthenticationRequired(true): sin rostro o huella, la llave no
 *    firma. La exigencia la aplica el sistema operativo, no la app: no es una
 *    bandera que un atacante pueda saltar con un hook sobre JavaScript.
 *  - setInvalidatedByBiometricEnrollment(true): si alguien agrega su rostro al
 *    teléfono, la llave muere. Sin esto, inscribir una cara equivale a robar la
 *    cuenta.
 *  - setUnlockedDeviceRequired(true): no se firma con la pantalla bloqueada.
 *  - setIsStrongBoxBacked(true): el elemento seguro dedicado, cuando existe.
 */
class DeviceKeyModule(private val reactContext: ReactApplicationContext) :
    NativeDeviceKeySpec(reactContext) {

    companion object {
        const val NAME = "DeviceKey"

        private const val KEY_ALIAS = "bsc_device_signing_key"
        private const val KEYSTORE = "AndroidKeyStore"

        /** Debe coincidir con lo que el backend acepta. */
        private const val ALGORITHM = "EC-P256"

        /** DER/ECDSA sobre SHA-256: lo que .NET verifica con Rfc3279DerSequence. */
        private const val SIGNATURE_ALGORITHM = "SHA256withECDSA"

        /**
         * Cuánto vale una autenticación del usuario. Cero significa que cada
         * firma exige verificación; es lo correcto para autorizar dinero.
         */
        private const val AUTH_VALIDITY_SECONDS = 0
    }

    override fun getName(): String = NAME

    // ─── Superficie expuesta a JavaScript ───────────────────────────────────

    override fun isSupported(promise: Promise) {
        guard(promise) { isSupported() }
    }

    override fun hasKey(promise: Promise) {
        guard(promise) { hasUsableKey() }
    }

    override fun createKey(promise: Promise) {
        guard(promise) { createKey() }
    }

    override fun getPublicKey(promise: Promise) {
        guard(promise) { publicKeyBase64() }
    }

    override fun deleteKey(promise: Promise) {
        guard(promise) { deleteKey() }
    }

    override fun describeKey(promise: Promise) {
        guard(promise) { describeKey() }
    }

    /**
     * Firma el contenido, pidiendo antes la verificación biométrica del cliente.
     *
     * **Aquí hubo un defecto heredado de la app Flutter que conviene explicar,
     * porque parecía correcto y no lo era.** El plugin de Flutter documentaba
     * que «la llamada a `Signature.sign()` dispara el diálogo biométrico del
     * sistema». No lo hace. Android exige que la firma se realice con un objeto
     * criptográfico **ya autenticado**: hay que envolver el `Signature` en un
     * `BiometricPrompt.CryptoObject` y firmar dentro de la devolución de llamada
     * de éxito. Sin eso, el Keystore rechaza la operación con
     * `Key user not authenticated` y el cliente nunca ve un diálogo.
     *
     * Se detectó al ejecutar la verificación en un Pixel real; en emulador y en
     * pruebas automáticas no se manifiesta, porque no hay hardware que exija la
     * autenticación.
     *
     * Los códigos de error son parte del contrato con JavaScript: la capa de
     * negocio decide según ellos si ofrecer el código por SMS o pedir volver a
     * enrolar, así que cambiarlos rompe esa decisión.
     */
    override fun sign(payloadBase64: String?, promise: Promise) {
        if (payloadBase64.isNullOrEmpty()) {
            promise.reject("invalid_argument", "Falta el contenido a firmar")
            return
        }

        val privateKey = loadPrivateKey()
        if (privateKey == null) {
            promise.reject("no_key", "El dispositivo no tiene una llave registrada")
            return
        }

        val activity = reactContext.currentActivity as? FragmentActivity
        if (activity == null) {
            promise.reject(
                "no_activity",
                "No hay una pantalla activa donde pedir la verificación"
            )
            return
        }

        // `initSign` no abre ningún diálogo: solo prepara el objeto que el
        // sistema autenticará. Si la biometría del teléfono cambió, falla aquí.
        val signature = try {
            Signature.getInstance(SIGNATURE_ALGORITHM).apply { initSign(privateKey) }
        } catch (e: KeyPermanentlyInvalidatedException) {
            // Ocurre cuando cambió la biometría inscrita. La llave ya no sirve y
            // el dispositivo debe volver a enrolarse: es la defensa funcionando,
            // no una falla.
            promise.reject(
                "key_invalidated",
                "La llave fue invalidada. Vuelve a registrar el dispositivo"
            )
            return
        } catch (e: UserNotAuthenticatedException) {
            promise.reject("user_not_authenticated", "Se requiere verificación del usuario")
            return
        } catch (e: Exception) {
            promise.reject("sign_failed", e.message)
            return
        }

        val payload = Base64.decode(payloadBase64, Base64.NO_WRAP)

        // El puente puede invocar las devoluciones de llamada más de una vez
        // —un fallo de huella seguido de una cancelación, por ejemplo— y
        // resolver dos veces la misma promesa revienta en JavaScript.
        val resuelta = AtomicBoolean(false)

        activity.runOnUiThread {
            val prompt = BiometricPrompt(
                activity,
                ContextCompat.getMainExecutor(activity),
                object : BiometricPrompt.AuthenticationCallback() {

                    override fun onAuthenticationSucceeded(
                        result: BiometricPrompt.AuthenticationResult
                    ) {
                        if (!resuelta.compareAndSet(false, true)) return

                        val autenticada = result.cryptoObject?.signature
                        if (autenticada == null) {
                            promise.reject(
                                "sign_failed",
                                "El sistema no devolvió el objeto criptográfico autenticado"
                            )
                            return
                        }

                        try {
                            autenticada.update(payload)
                            // DER, el formato que .NET verifica con Rfc3279DerSequence.
                            promise.resolve(
                                Base64.encodeToString(autenticada.sign(), Base64.NO_WRAP)
                            )
                        } catch (e: Exception) {
                            promise.reject("sign_failed", e.message)
                        }
                    }

                    /**
                     * Error terminal: el cliente canceló, agotó los intentos, o
                     * el sensor no está disponible. La capa de negocio trata
                     * `user_not_authenticated` sin ofrecer el código, a
                     * propósito: ofrecerlo entrenaría al cliente a cancelar la
                     * biometría para llegar a un camino más débil.
                     */
                    override fun onAuthenticationError(
                        errorCode: Int,
                        errString: CharSequence
                    ) {
                        if (!resuelta.compareAndSet(false, true)) return
                        promise.reject("user_not_authenticated", errString.toString())
                    }

                    /**
                     * Intento fallido pero no terminal: una huella que no
                     * coincide. El sistema deja reintentar, así que la promesa
                     * no se resuelve todavía.
                     */
                    override fun onAuthenticationFailed() = Unit
                }
            )

            val info = BiometricPrompt.PromptInfo.Builder()
                .setTitle("Autoriza la operación")
                .setSubtitle("Verifica tu identidad para firmar")
                // Solo biometría fuerte, coherente con cómo se creó la llave.
                // Aceptar el PIN del teléfono permitiría firmar transferencias a
                // quien lo conozca, no solo desbloquear el dispositivo.
                .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
                .setNegativeButtonText("Cancelar")
                .setConfirmationRequired(true)
                .build()

            try {
                prompt.authenticate(info, BiometricPrompt.CryptoObject(signature))
            } catch (e: Exception) {
                if (resuelta.compareAndSet(false, true)) {
                    promise.reject("sign_failed", e.message)
                }
            }
        }
    }

    /**
     * Una excepción que cruce el puente sin envolver llega a JavaScript como un
     * fallo opaco. Envolverla aquí mantiene un único código de error
     * (`device_key_error`) para lo inesperado, y deja los códigos específicos
     * para los casos que la capa de negocio sí distingue.
     */
    private fun <T> guard(promise: Promise, block: () -> T) {
        try {
            promise.resolve(block())
        } catch (e: Exception) {
            promise.reject("device_key_error", e.message)
        }
    }

    // ─── Implementación ─────────────────────────────────────────────────────

    /**
     * El Keystore respaldado por hardware existe desde API 23, pero la
     * verificación de usuario por llave necesita API 28 para poder invalidarla
     * al cambiar la biometría. Por debajo de eso no se ofrece: una llave que
     * sobrevive a la inscripción de una cara nueva no sirve para autorizar
     * dinero.
     */
    private fun isSupported(): Boolean = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P

    /**
     * Genera el par. Devuelve la llave pública en SPKI/base64, que es lo que el
     * servidor importa.
     *
     * Intenta primero con StrongBox y cae al Keystore normal si el dispositivo
     * no lo tiene: ambos mantienen la privada fuera del alcance de la app, y
     * negarse por falta de StrongBox excluiría teléfonos perfectamente válidos.
     */
    private fun createKey(): WritableMap {
        if (!isSupported()) {
            throw IllegalStateException(
                "Este dispositivo no soporta llaves con verificación de usuario"
            )
        }

        // Una llave previa se descarta: dos llaves para el mismo dispositivo
        // dejarían al servidor sin saber cuál es la vigente.
        deleteKey()

        val generated = tryGenerate(useStrongBox = true) || tryGenerate(useStrongBox = false)
        if (!generated && loadPrivateKey() == null) {
            throw IllegalStateException("No se pudo generar el par de llaves")
        }

        return WritableNativeMap().apply {
            putString("publicKey", publicKeyBase64())
            putString("algorithm", ALGORITHM)
            putMap("security", describeKey())
        }
    }

    private fun tryGenerate(useStrongBox: Boolean): Boolean {
        return try {
            val builder = KeyGenParameterSpec.Builder(KEY_ALIAS, KeyProperties.PURPOSE_SIGN)
                .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
                .setDigests(KeyProperties.DIGEST_SHA256)
                // Sin rostro o huella, la llave no firma. Lo aplica el SO.
                .setUserAuthenticationRequired(true)
                // Agregar una biometría nueva invalida la llave.
                .setInvalidatedByBiometricEnrollment(true)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                builder.setUnlockedDeviceRequired(true)
                if (useStrongBox) builder.setIsStrongBoxBacked(true)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                // Cada firma exige una verificación propia, y SOLO biometría
                // fuerte.
                //
                // Aceptar también el bloqueo del dispositivo parecía más
                // permisivo sin costo, pero tenía dos consecuencias que no se
                // ven hasta medirlas en el teléfono:
                //
                //  - Android desactiva setInvalidatedByBiometricEnrollment
                //    cuando la llave admite credencial del dispositivo. Es
                //    decir: agregar una huella ajena dejaba de invalidar la
                //    llave, que es justo la garantía que la pantalla de
                //    Seguridad le promete al cliente.
                //  - Quien conozca el PIN del teléfono podía firmar
                //    transferencias, no solo desbloquearlo.
                //
                // Quien no tenga biometría sigue autorizando con el código de
                // verificación, que es la alternativa prevista.
                builder.setUserAuthenticationParameters(
                    AUTH_VALIDITY_SECONDS,
                    KeyProperties.AUTH_BIOMETRIC_STRONG
                )
            } else {
                @Suppress("DEPRECATION")
                builder.setUserAuthenticationValidityDurationSeconds(AUTH_VALIDITY_SECONDS)
            }

            val generator = KeyPairGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_EC, KEYSTORE
            )
            generator.initialize(builder.build())
            generator.generateKeyPair()
            true
        } catch (e: StrongBoxUnavailableException) {
            // Esperado en dispositivos sin elemento seguro dedicado.
            false
        } catch (e: Exception) {
            if (useStrongBox) false else throw e
        }
    }

    private fun keyStore(): KeyStore =
        KeyStore.getInstance(KEYSTORE).apply { load(null) }

    private fun loadPrivateKey(): PrivateKey? =
        keyStore().getKey(KEY_ALIAS, null) as? PrivateKey

    /**
     * Si hay una llave y además sirve para firmar.
     *
     * Comprobar solo que exista no alcanza: una llave invalidada porque cambió
     * la biometría del teléfono sigue cargando del Keystore sin error. Solo
     * `initSign` la rechaza. Sin esta prueba la app se cree lista para firmar y
     * el cliente descubre lo contrario a mitad de una transferencia, con la
     * pantalla de Seguridad mostrando el interruptor encendido y ninguna forma
     * de arreglarlo.
     *
     * `initSign` no abre el diálogo biométrico —eso pasa al usar el objeto
     * criptográfico—, así que la comprobación es silenciosa.
     */
    private fun hasUsableKey(): Boolean {
        val privateKey = loadPrivateKey() ?: return false

        return try {
            Signature.getInstance(SIGNATURE_ALGORITHM).initSign(privateKey)
            true
        } catch (e: KeyPermanentlyInvalidatedException) {
            false
        } catch (e: UserNotAuthenticatedException) {
            // La llave está bien; solo pide que el cliente se verifique.
            true
        } catch (e: Exception) {
            // Un fallo cualquiera no es prueba de que la llave se perdió, y
            // darla por perdida mandaría al cliente a re-enrolar sin motivo.
            true
        }
    }

    private fun publicKeyBase64(): String? {
        val certificate = keyStore().getCertificate(KEY_ALIAS) ?: return null
        val encoded = certificate.publicKey.encoded ?: return null
        return Base64.encodeToString(encoded, Base64.NO_WRAP)
    }

    private fun deleteKey(): Boolean {
        return try {
            val store = keyStore()
            if (store.containsAlias(KEY_ALIAS)) {
                store.deleteEntry(KEY_ALIAS)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Dónde vive la llave y con qué protecciones. Se envía al banco al enrolar,
     * y sirve para que el equipo de seguridad sepa qué garantiza cada
     * dispositivo del parque.
     */
    private fun describeKey(): WritableMap {
        val privateKey = loadPrivateKey()
            ?: return WritableNativeMap().apply { putBoolean("present", false) }

        return try {
            val factory = KeyFactory.getInstance(privateKey.algorithm, KEYSTORE)
            val info = factory.getKeySpec(privateKey, KeyInfo::class.java)

            val backing = when {
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ->
                    when (info.securityLevel) {
                        KeyProperties.SECURITY_LEVEL_STRONGBOX -> "strongbox"
                        KeyProperties.SECURITY_LEVEL_TRUSTED_ENVIRONMENT -> "tee"
                        KeyProperties.SECURITY_LEVEL_SOFTWARE -> "software"
                        else -> "unknown"
                    }
                @Suppress("DEPRECATION")
                info.isInsideSecureHardware -> "hardware"
                else -> "software"
            }

            WritableNativeMap().apply {
                putBoolean("present", true)
                putString("backing", backing)
                putBoolean("userAuthenticationRequired", info.isUserAuthenticationRequired)
                putBoolean(
                    "invalidatedByBiometricEnrollment",
                    Build.VERSION.SDK_INT < Build.VERSION_CODES.N ||
                        info.isInvalidatedByBiometricEnrollment
                )
            }
        } catch (e: Exception) {
            WritableNativeMap().apply {
                putBoolean("present", true)
                putString("backing", "unknown")
            }
        }
    }
}
