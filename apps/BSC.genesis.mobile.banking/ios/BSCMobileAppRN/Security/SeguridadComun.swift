import Foundation
import LocalAuthentication
import Security
import UIKit

/**
 * Piezas compartidas por los módulos de seguridad de iOS.
 *
 * Contraparte de los módulos de `android/.../security`. Cada módulo vive en su
 * propio archivo; aquí solo va lo que usan varios: el Llavero, la limpieza al
 * reinstalar y la pantalla sobre la que presentar algo.
 *
 * ⚠️ Escrito sin iPhone físico (P-13): el Secure Enclave y la biometría no
 * existen en el simulador. Ver `docs/migration/adr/0003-paridad-de-firma-en-ios.md`.
 */

/// Resolver y rechazar, en la forma en que los reciben los módulos de Swift.
public typealias BscResolver = (Any?) -> Void
public typealias BscRechazo = (_ codigo: String, _ mensaje: String?) -> Void

enum Llavero {
  /** Servicio de los valores de `SecureStorage`. */
  static let servicioDeAlmacen = "bsc_secure_store"

  /** Servicio de los metadatos de la llave de firma (el estado biométrico). */
  static let servicioDeLlave = "bsc_device_key_meta"

  static func leer(servicio: String, cuenta: String) throws -> Data? {
    let consulta: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: servicio,
      kSecAttrAccount as String: cuenta,
      kSecReturnData as String: true,
      kSecMatchLimit as String: kSecMatchLimitOne,
    ]
    var resultado: CFTypeRef?
    let estado = SecItemCopyMatching(consulta as CFDictionary, &resultado)
    if estado == errSecItemNotFound { return nil }
    guard estado == errSecSuccess else { throw ErrorDeLlavero(estado) }
    return resultado as? Data
  }

  /**
   * Escribe o reemplaza.
   *
   * `WhenUnlockedThisDeviceOnly`: solo se lee con el teléfono desbloqueado y
   * **no viaja en copias de seguridad ni en iCloud**. Es la misma garantía que
   * el Keystore de Android, cuya llave maestra tampoco sale del teléfono.
   */
  static func escribir(servicio: String, cuenta: String, datos: Data) throws {
    let base: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: servicio,
      kSecAttrAccount as String: cuenta,
    ]
    let cambios: [String: Any] = [
      kSecValueData as String: datos,
      kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
    ]
    var estado = SecItemUpdate(base as CFDictionary, cambios as CFDictionary)
    if estado == errSecItemNotFound {
      estado = SecItemAdd(base.merging(cambios) { $1 } as CFDictionary, nil)
    }
    guard estado == errSecSuccess else { throw ErrorDeLlavero(estado) }
  }

  static func borrar(servicio: String, cuenta: String? = nil) throws {
    var consulta: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: servicio,
    ]
    if let cuenta { consulta[kSecAttrAccount as String] = cuenta }
    let estado = SecItemDelete(consulta as CFDictionary)
    guard estado == errSecSuccess || estado == errSecItemNotFound else {
      throw ErrorDeLlavero(estado)
    }
  }
}

struct ErrorDeLlavero: LocalizedError {
  let estado: OSStatus
  init(_ estado: OSStatus) { self.estado = estado }
  var errorDescription: String? {
    (SecCopyErrorMessageString(estado, nil) as String?) ?? "Error del Llavero \(estado)"
  }
}

/**
 * Limpieza al reinstalar.
 *
 * **En iOS el Llavero sobrevive a la desinstalación de la app**; en Android,
 * desinstalar borra el almacén cifrado y la llave del Keystore. Sin esta
 * limpieza, reinstalar la app en iOS encontraría el token de sesión y la llave
 * de firma de la instalación anterior: la app arrancaría con una sesión que el
 * cliente cree cerrada, y el banco vería un dispositivo «enrolado» que el
 * cliente borró.
 *
 * La marca va en `UserDefaults` precisamente porque ese almacén **sí** se borra
 * al desinstalar: si falta, es una instalación nueva y lo que haya en el
 * Llavero es de otra.
 *
 * Solo se ejecuta con los datos protegidos disponibles. iOS puede lanzar la app
 * antes del primer desbloqueo (el «prewarming»), y entonces `UserDefaults`
 * devuelve vacío aunque la marca exista: limpiar en ese momento borraría la
 * sesión de un cliente legítimo cada vez que reinicia el teléfono.
 */
enum InstalacionNueva {
  private static let marca = "bsc.seguridad.instalacion"
  private static let cerrojo = NSLock()
  private static var hecha = false

  static func limpiarSiHaceFalta() {
    cerrojo.lock()
    defer { cerrojo.unlock() }
    guard !hecha, datosProtegidosDisponibles() else { return }

    let defaults = UserDefaults.standard
    if !defaults.bool(forKey: marca) {
      try? Llavero.borrar(servicio: Llavero.servicioDeAlmacen)
      try? Llavero.borrar(servicio: Llavero.servicioDeLlave)
      LlaveDeFirma.borrarLlave()
      defaults.set(true, forKey: marca)
    }
    hecha = true
  }

  private static func datosProtegidosDisponibles() -> Bool {
    if Thread.isMainThread { return UIApplication.shared.isProtectedDataAvailable }
    return DispatchQueue.main.sync { UIApplication.shared.isProtectedDataAvailable }
  }
}

enum Pantalla {
  /** La ventana principal de la app, en el hilo principal. */
  static func ventana() -> UIWindow? {
    UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap(\.windows)
      .first { $0.isKeyWindow }
      ?? UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .flatMap(\.windows)
        .first
  }

  /** El controlador visible, sobre el que presentar una hoja del sistema. */
  static func controladorVisible() -> UIViewController? {
    var actual = ventana()?.rootViewController
    while let presentado = actual?.presentedViewController { actual = presentado }
    return actual
  }
}

/**
 * Una promesa del puente solo se puede resolver una vez. Las devoluciones de
 * llamada del sistema no lo garantizan, así que cada módulo envuelve las suyas
 * con esto, igual que el `AtomicBoolean` de los módulos de Android.
 */
final class UnaSolaVez {
  private let cerrojo = NSLock()
  private var usada = false

  func intentar() -> Bool {
    cerrojo.lock()
    defer { cerrojo.unlock() }
    if usada { return false }
    usada = true
    return true
  }
}
