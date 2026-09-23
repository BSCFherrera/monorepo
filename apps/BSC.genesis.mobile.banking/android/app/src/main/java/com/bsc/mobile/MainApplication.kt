package com.bsc.mobile

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.common.assets.ReactFontManager
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.bsc.mobile.security.BscSecurityPackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Los módulos de seguridad se registran a mano, no por autoenlace:
          // viven dentro de este módulo de la aplicación precisamente para que
          // no dependan de un paquete externo en la ruta de la firma.
          add(BscSecurityPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    // Google Sans Flex (res/font/google_sans_flex.xml): una familia con un
    // corte estático por peso, para que `fontWeight` elija el corte real en
    // vez de engrosar el regular.
    ReactFontManager.getInstance()
      .addCustomFont(this, "Google Sans Flex", R.font.google_sans_flex)
    loadReactNative(this)
  }
}
