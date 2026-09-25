import Foundation
import LocalAuthentication

/**
 * Verificación biométrica del cliente, para desbloquear la app.
 *
 * Contraparte de `BiometricAuthModule.kt`. Distinta de `DeviceKey`: aquí solo
 * se comprueba identidad; la firma de dinero pasa por la llave del Secure
 * Enclave, que impone la biometría por su cuenta.
 *
 * Solo biometría (`.deviceOwnerAuthenticationWithBiometrics`), nunca el código
 * del teléfono, igual que `BIOMETRIC_STRONG` en Android.
 */
@objc(BscBiometricAuth)
public final class BscBiometricAuth: NSObject {
  /** Nunca lanza: quien la llama la usa para decidir qué mostrar. */
  @objc public static func isAvailable(_ resolver: @escaping BscResolver, rechazar: @escaping BscRechazo) {
    resolver(LAContext().canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil))
  }

  /**
   * Si el teléfono tiene Face ID inscrito.
   *
   * A diferencia de Android, aquí la respuesta es real: iOS distingue Face ID
   * de Touch ID, y la pantalla de acceso lo usa para decir «Entrar con Face ID»
   * o «Entrar con tu huella». `biometryType` solo se rellena después de
   * `canEvaluatePolicy`.
   */
  @objc public static func hasFaceUnlock(_ resolver: @escaping BscResolver, rechazar: @escaping BscRechazo) {
    let contexto = LAContext()
    let puede = contexto.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
    resolver(puede && contexto.biometryType == .faceID)
  }

  /**
   * Resuelve `true` si el cliente se verificó y `false` si no: «no se
   * verificó» es una respuesta, no una excepción.
   *
   * Los textos llegan de JavaScript ya traducidos. Con Face ID, iOS muestra el
   * texto de `NSFaceIDUsageDescription` (de `Info.plist`, en el idioma del
   * teléfono) y no `motivo`; con Touch ID muestra `motivo`. iOS no tiene un
   * título aparte: `titulo` se usa solo si falta el motivo.
   */
  @objc public static func authenticate(
    _ motivo: String,
    titulo: String,
    cancelar: String,
    resolver: @escaping BscResolver,
    rechazar: @escaping BscRechazo
  ) {
    let contexto = LAContext()
    contexto.localizedFallbackTitle = ""
    contexto.localizedCancelTitle = cancelar
    // `evaluatePolicy` exige un motivo no vacío, o falla sin mostrar nada.
    let texto = motivo.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? titulo : motivo

    guard contexto.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil) else {
      resolver(false)
      return
    }
    let unaVez = UnaSolaVez()
    contexto.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: texto) { exito, _ in
      if unaVez.intentar() { resolver(exito) }
    }
  }
}
