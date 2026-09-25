package com.bsc.mobile.security

import android.content.Intent
import android.util.Base64
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import java.io.File

/**
 * Entrega al teléfono el PDF de un estado de cuenta.
 *
 * Reemplaza a `share_plus` y a `statement_pdf_saver_io.dart` de la app Flutter,
 * que escriben el archivo en el directorio temporal y abren la hoja de
 * compartir del sistema. Se escribe como módulo propio, y no con una librería
 * de la comunidad, por la misma razón que los otros cuatro de esta carpeta: es
 * código corto y auditable, en la ruta por la que sale un documento del banco.
 *
 * Vive en el paquete `security` porque es donde `codegenConfig` genera las
 * clases base de los módulos de esta aplicación, no porque sea un módulo de
 * seguridad.
 *
 * Decisiones que conviene no perder:
 *
 *  - El archivo va a la **caché**, no al almacenamiento permanente. Un estado
 *    de cuenta es un documento del cliente: si lo quiere conservar, lo guarda
 *    él desde la hoja de compartir, en el sitio que elija. Dejar copias en un
 *    directorio de la app significaría que el banco acumula estados de cuenta
 *    en el teléfono sin que nadie los borre nunca.
 *  - **Antes de escribir se borra lo anterior.** Sin eso, cada descarga deja un
 *    PDF más en la caché, y el conjunto sería un histórico de los movimientos
 *    del cliente accesible a cualquiera que obtenga acceso al sistema de
 *    archivos de la aplicación.
 *  - El nombre se **recorta a su último segmento**: un nombre con barras
 *    escribiría fuera del directorio previsto.
 *  - Se comparte por `FileProvider` con permiso de lectura de un solo uso, que
 *    es la única forma admitida desde Android 7 de pasar un archivo a otra
 *    aplicación.
 */
class StatementFileModule(private val reactContext: ReactApplicationContext) :
    NativeStatementFileSpec(reactContext) {

    companion object {
        const val NAME = "StatementFile"

        /** Debe coincidir con la autoridad declarada en el manifiesto. */
        private const val AUTORIDAD_SUFIJO = ".estadosdecuenta"

        /** Subdirectorio de la caché. Coincide con `file_paths.xml`. */
        private const val CARPETA = "estados"
    }

    override fun getName(): String = NAME

    override fun guardarYCompartir(
        pdfEnBase64: String,
        nombreDeArchivo: String,
        promise: Promise
    ) {
        val actividad = reactContext.currentActivity
        if (actividad == null) {
            promise.reject("sin_actividad", "No hay actividad disponible")
            return
        }

        val bytes = try {
            Base64.decode(pdfEnBase64, Base64.DEFAULT)
        } catch (e: IllegalArgumentException) {
            promise.reject("pdf_invalido", "El documento recibido no es válido")
            return
        }

        if (bytes.isEmpty()) {
            promise.reject("pdf_invalido", "El documento recibido está vacío")
            return
        }

        try {
            val carpeta = File(reactContext.cacheDir, CARPETA)
            carpeta.mkdirs()

            // No se acumulan estados de cuenta en el teléfono.
            carpeta.listFiles()?.forEach { it.delete() }

            val nombre = nombreDeArchivo.substringAfterLast('/').substringAfterLast('\\')
            val archivo = File(carpeta, nombre)
            archivo.writeBytes(bytes)

            val uri = FileProvider.getUriForFile(
                reactContext,
                reactContext.packageName + AUTORIDAD_SUFIJO,
                archivo
            )

            val envio = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            actividad.startActivity(Intent.createChooser(envio, nombre))
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("descarga_fallida", e.message)
        }
    }
}
