package com.bsc.mobile.security

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/**
 * Registra los módulos de seguridad propios de BSC.
 *
 * Viven dentro del módulo de la aplicación y no como paquete publicado aparte,
 * por la misma razón que en la app Flutter: una dependencia externa en la ruta
 * de la firma de transacciones sería el punto más sensible de la cadena de
 * suministro.
 */
class BscSecurityPackage : BaseReactPackage() {

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        when (name) {
            DeviceKeyModule.NAME -> DeviceKeyModule(reactContext)
            DeviceIntegrityModule.NAME -> DeviceIntegrityModule(reactContext)
            SecureScreenModule.NAME -> SecureScreenModule(reactContext)
            SecureStorageModule.NAME -> SecureStorageModule(reactContext)
            BiometricAuthModule.NAME -> BiometricAuthModule(reactContext)
            StatementFileModule.NAME -> StatementFileModule(reactContext)
            else -> null
        }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
        mapOf(
            DeviceKeyModule.NAME to ReactModuleInfo(
                DeviceKeyModule.NAME,
                DeviceKeyModule.NAME,
                false, // canOverrideExistingModule
                false, // needsEagerInit
                false, // isCxxModule
                true,  // isTurboModule
            ),
            DeviceIntegrityModule.NAME to ReactModuleInfo(
                DeviceIntegrityModule.NAME,
                DeviceIntegrityModule.NAME,
                false,
                false,
                false,
                true,
            ),
            SecureScreenModule.NAME to ReactModuleInfo(
                SecureScreenModule.NAME,
                SecureScreenModule.NAME,
                false,
                false,
                false,
                true,
            ),
            SecureStorageModule.NAME to ReactModuleInfo(
                SecureStorageModule.NAME,
                SecureStorageModule.NAME,
                false,
                false,
                false,
                true,
            ),
            BiometricAuthModule.NAME to ReactModuleInfo(
                BiometricAuthModule.NAME,
                BiometricAuthModule.NAME,
                false,
                false,
                false,
                true,
            ),
            StatementFileModule.NAME to ReactModuleInfo(
                StatementFileModule.NAME,
                StatementFileModule.NAME,
                false,
                false,
                false,
                true,
            ),
        )
    }
}
