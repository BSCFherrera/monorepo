package com.bsc.mobile

import android.graphics.Color
import android.os.Bundle
import android.view.View

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "BSCMobileAppRN"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * Se descarta el estado guardado de Android al recrear la actividad.
   *
   * Lo exige react-native-screens: si Android restaura sus fragmentos mientras
   * React vuelve a montar el árbol de navegación desde cero, quedan dos
   * jerarquías compitiendo y la app revienta al rotar o al volver de segundo
   * plano tras una recreación del proceso.
   *
   * Perder ese estado no cuesta nada aquí: la navegación se reconstruye desde
   * el estado de sesión, y una banca **debe** volver al acceso cuando el
   * proceso se recreó, no a la pantalla donde estaba.
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    /*
      Se devuelve la ventana a su tema normal.

      El manifiesto lanza la actividad con `AppTheme.Arranque`, cuyo fondo es el
      logotipo del banco sobre el degradado de marca: eso es lo que se ve entre
      el toque en el icono y el primer render de React Native. Una vez creada la
      actividad ese dibujo ya no aporta nada y sí cuesta —Android lo conserva
      detrás de toda la aplicación y lo redibuja en cada cambio de tamaño—, así
      que se cambia aquí, antes de `super.onCreate`, que es donde se resuelve el
      tema de la ventana.
    */
    setTheme(R.style.AppTheme)
    super.onCreate(null)

    /*
      El área de contenido, del color de la foto de acceso con su velo.

      Entre el arranque del sistema y el primer dibujo de React Native, la
      superficie de React todavía está vacía y deja ver lo que tiene detrás: con
      `AppTheme`, blanco. Es un destello blanco justo entre dos pantallas
      oscuras. Se pinta el contenedor y no la ventana a propósito: la ventana es
      lo que asoma cuando el teclado redimensiona una pantalla clara, y ahí debe
      seguir siendo el fondo del tema. Mismo color que `values-v31/styles.xml` y
      que `AppDelegate.swift` en iOS.
    */
    findViewById<View>(android.R.id.content).setBackgroundColor(FONDO_DE_ARRANQUE)
  }

  private companion object {
    val FONDO_DE_ARRANQUE = Color.rgb(26, 23, 24)
  }
}
