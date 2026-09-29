package com.bsc.conversational.autentikar

import android.app.Activity
import android.app.Activity.RESULT_CANCELED
import android.app.Activity.RESULT_OK
import android.content.Intent
import com.bsc.conversational.BuildConfig
import com.autentikar.core_v2.common.managers.AutentikarManager.start
import com.autentikar.core_v2.common.types.AutentikarStageType
import com.autentikar.core_v2.configuration.AutentikarConfiguration.alias
import com.autentikar.core_v2.configuration.AutentikarConfiguration.stage
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

/**
 * Puente nativo hacia el SDK de Autentikar: verificación de identidad mediante
 * fotografía de cédula dominicana + reconocimiento facial (prueba de vida).
 */
class RNAutentikarBridgeModule(
    context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {

    companion object {
        const val E_ACTIVITY_DOES_NOT_EXIST = "E_ACTIVITY_DOES_NOT_EXIST"
    }

    private lateinit var mPromise: Promise

    private val mActivityEventListener = object : ActivityEventListener {

        override fun onActivityResult(
            activity: Activity,
            requestCode: Int,
            resultCode: Int,
            data: Intent?,
        ) {
            when (resultCode) {
                RESULT_CANCELED -> mPromise.resolve(false)
                RESULT_OK -> mPromise.resolve(true)
            }
        }

        override fun onNewIntent(intent: Intent) {
            // No se requiere lógica aquí actualmente
        }
    }

    init {
        context.addActivityEventListener(mActivityEventListener)
    }

    override fun getName(): String {
        return "AutentikarBridge"
    }

    @ReactMethod
    fun authenticate(`object`: ReadableMap, promise: Promise) {
        mPromise = promise

        val currentActivity = getCurrentActivity()

        if (currentActivity == null) {
            promise.reject(
                E_ACTIVITY_DOES_NOT_EXIST,
                "Activity doesn't exist"
            )
            return
        }

        val link = `object`.getString("link") ?: ""

        checkNotNull(link)

        alias = BuildConfig.AUTENTIKAR_ALIAS
        stage = AutentikarStageType.SANDBOX

        start(currentActivity, link) {
            mPromise.resolve(false)
            null
        }
    }
}
