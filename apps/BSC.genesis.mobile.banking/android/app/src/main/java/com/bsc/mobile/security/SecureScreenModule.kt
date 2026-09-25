package com.bsc.mobile.security

import android.view.WindowManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

/**
 * Bloquea capturas de pantalla y la vista previa en el conmutador de apps.
 *
 * Portado de `SecureScreenPlugin.kt` de la app Flutter.
 *
 * Android permite capturar cualquier pantalla por defecto. Sin `FLAG_SECURE`,
 * un código de verificación queda en la galería del teléfono, y la vista previa
 * de la app en el conmutador lo muestra a cualquiera que tome el dispositivo.
 *
 * Se activa por pantalla y no globalmente: aplicarlo a toda la app impediría al
 * cliente capturar un comprobante legítimo, que es algo que la gente hace.
 */
class SecureScreenModule(private val reactContext: ReactApplicationContext) :
    NativeSecureScreenSpec(reactContext) {

    companion object {
        const val NAME = "SecureScreen"
    }

    override fun getName(): String = NAME

    override fun setSecure(secure: Boolean, promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("no_activity", "No hay actividad disponible")
            return
        }

        // La bandera de ventana solo puede tocarse desde el hilo de interfaz.
        activity.runOnUiThread {
            try {
                if (secure) {
                    activity.window.setFlags(
                        WindowManager.LayoutParams.FLAG_SECURE,
                        WindowManager.LayoutParams.FLAG_SECURE
                    )
                } else {
                    activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
                }
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("secure_screen_failed", e.message)
            }
        }
    }
}
