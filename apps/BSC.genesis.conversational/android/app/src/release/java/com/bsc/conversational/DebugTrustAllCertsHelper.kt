package com.bsc.conversational

/**
 * Contraparte no-op de la versión debug-only (android/app/src/debug/). Esta es la
 * que realmente se compila en assembleRelease: garantiza que el bypass de
 * validación TLS es físicamente imposible de incluir en un build de producción,
 * sin necesitar un chequeo en tiempo de ejecución en MainApplication.
 */
object DebugTrustAllCertsHelper {
  fun install() {
    // No-op en release: la validación TLS estándar de Android permanece intacta.
  }
}
