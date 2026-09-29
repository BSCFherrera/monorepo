package com.bsc.conversational

import android.util.Log
import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.OkHttpClientProvider
import java.security.SecureRandom
import java.security.cert.X509Certificate
import javax.net.ssl.HostnameVerifier
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager
import okhttp3.OkHttpClient

/**
 * SOLO DEBUG: desactiva por completo la validación de certificados TLS (cadena de
 * confianza y hostname) para poder consumir gateways de desarrollo detrás de
 * inspección TLS corporativa sin instalar el CA interno en cada emulador.
 *
 * Este archivo vive en android/app/src/debug/, un source set que Gradle excluye
 * físicamente de assembleRelease — ver la contraparte no-op en src/release/ con
 * la misma firma, que es la que realmente se compila en producción.
 *
 * NUNCA reutilizar este patrón fuera de esta carpeta debug-only.
 */
object DebugTrustAllCertsHelper {
  fun install() {
    Log.w("DebugTrustAllCerts", "TLS certificate validation is DISABLED (debug build only)")

    val trustAllCerts =
        arrayOf<TrustManager>(
            object : X509TrustManager {
              override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) {}

              override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) {}

              override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
            },
        )

    val sslContext = SSLContext.getInstance("TLS")
    sslContext.init(null, trustAllCerts, SecureRandom())

    val client =
        OkHttpClientProvider.createClientBuilder()
            .sslSocketFactory(sslContext.socketFactory, trustAllCerts[0] as X509TrustManager)
            .hostnameVerifier(HostnameVerifier { _, _ -> true })
            .build()

    OkHttpClientProvider.setOkHttpClientFactory(OkHttpClientFactory { client })
  }
}
