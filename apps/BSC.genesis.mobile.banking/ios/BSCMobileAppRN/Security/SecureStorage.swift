import Foundation

/**
 * Almacenamiento cifrado por el sistema operativo: el Llavero.
 *
 * Contraparte de `SecureStorageModule.kt` (`EncryptedSharedPreferences`). Aquí
 * viven los tokens de sesión y los secretos de segundo factor, nunca la llave
 * de firma.
 *
 * Como en Android, leer **no** exige biometría: la app necesita saber al
 * arrancar si hay sesión. Lo que protege este almacén es el cifrado del
 * Llavero y que los valores no salen del teléfono (`ThisDeviceOnly`).
 *
 * Diferencias con Android que conviene conocer:
 *
 *  - El Llavero no tiene transacciones, así que `removeItems` borra clave por
 *    clave. Si la app muere a mitad de un cierre de sesión puede quedar parte
 *    de las claves; la siguiente apertura vuelve a cerrar la sesión.
 *  - El Llavero sobrevive a la desinstalación; `InstalacionNueva` lo limpia al
 *    reinstalar para igualar a Android.
 */
@objc(BscSecureStorage)
public final class BscSecureStorage: NSObject {
  private static let servicio = Llavero.servicioDeAlmacen

  @objc public static func getItem(
    _ clave: String, resolver: @escaping BscResolver, rechazar: @escaping BscRechazo
  ) {
    guard !clave.isEmpty else { return rechazar("invalid_argument", "Falta la clave") }
    InstalacionNueva.limpiarSiHaceFalta()
    do {
      let datos = try Llavero.leer(servicio: servicio, cuenta: clave)
      resolver(datos.flatMap { String(data: $0, encoding: .utf8) })
    } catch {
      rechazar("secure_storage_error", error.localizedDescription)
    }
  }

  @objc public static func setItem(
    _ clave: String, valor: String, resolver: @escaping BscResolver, rechazar: @escaping BscRechazo
  ) {
    guard !clave.isEmpty else { return rechazar("invalid_argument", "Falta la clave") }
    InstalacionNueva.limpiarSiHaceFalta()
    do {
      // Síncrono, como el `commit` de Android: quien guarda un token necesita
      // saber que quedó escrito antes de continuar.
      try Llavero.escribir(servicio: servicio, cuenta: clave, datos: Data(valor.utf8))
      resolver(nil)
    } catch {
      rechazar("secure_storage_error", error.localizedDescription)
    }
  }

  @objc public static func removeItem(
    _ clave: String, resolver: @escaping BscResolver, rechazar: @escaping BscRechazo
  ) {
    guard !clave.isEmpty else { return rechazar("invalid_argument", "Falta la clave") }
    do {
      try Llavero.borrar(servicio: servicio, cuenta: clave)
      resolver(nil)
    } catch {
      rechazar("secure_storage_error", error.localizedDescription)
    }
  }

  /**
   * Borra varias claves. No hay «borrar todo» por la misma razón que en
   * Android: el identificador de instalación y el secreto del dispositivo deben
   * sobrevivir al cierre de sesión.
   */
  @objc public static func removeItems(
    _ claves: [String], resolver: @escaping BscResolver, rechazar: @escaping BscRechazo
  ) {
    do {
      for clave in claves where !clave.isEmpty {
        try Llavero.borrar(servicio: servicio, cuenta: clave)
      }
      resolver(nil)
    } catch {
      rechazar("secure_storage_error", error.localizedDescription)
    }
  }
}
