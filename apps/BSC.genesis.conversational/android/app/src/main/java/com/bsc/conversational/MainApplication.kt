package com.bsc.conversational

import android.app.Application
import com.bsc.conversational.autentikar.AutentikarPackage
import com.autentikar.core_v2.common.managers.AutentikarManager
import com.autentikar.core_v2.common.types.AutentikarStepType
import com.autentikar.unifiedid.common.managers.AutentikarUnifiedIDManager
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
        context = applicationContext,
        packageList =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(AutentikarPackage())
            }
        )
      }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    AutentikarManager.register(AutentikarUnifiedIDManager.setContract(AutentikarStepType.FACE_FACETEC))
    AutentikarManager.register(AutentikarUnifiedIDManager.setContract(AutentikarStepType.FACETEC_CARD_ID))
  }
}
