import Foundation
import LocalAuthentication
import Security

/**
 * Par de llaves de firma del dispositivo, dentro del Secure Enclave.
 *
 * Contraparte de `DeviceKeyModule.kt`, con la misma superficie y los mismos
 * códigos de error (son parte del contrato con JavaScript). La equivalencia de
 * garantías está en `docs/migration/adr/0003-paridad-de-firma-en-ios.md`:
 *
 *  - La llave se genera **dentro** del Secure Enclave
 *    (`kSecAttrTokenIDSecureEnclave`) y no se puede exportar: la privada no
 *    existe fuera del chip, ni siquiera cifrada.
 *  - `.biometryCurrentSet`: cada uso exige Face ID o Touch ID, y **agregar o
 *    quitar una biometría invalida la llave**. Es la garantía más importante:
 *    sin ella, inscribir un rostro ajeno en el teléfono equivale a poder
 *    firmar transferencias.
 *  - Ni `.userPresence` ni `.devicePasscode`: el código del teléfono **no**
 *    firma. Quien lo conozca podría desbloquear el teléfono, no mover dinero.
 *  - `WhenUnlockedThisDeviceOnly`: no se firma con el teléfono bloqueado y la
 *    llave no viaja en copias de seguridad.
 *  - EC P-256 y `ecdsaSignatureMessageX962SHA256`, que produce la firma en
 *    DER: lo mismo que `SHA256withECDSA` en Android y lo que el backend .NET
 *    verifica.
 *
 * ⚠️ **Escrito, sin verificar** (P-13). En el simulador no hay Secure Enclave,
 * así que `isSupported` devuelve `false` y el flujo de la app es el de un
 * teléfono sin llave. El criterio de salida de ADR-0003 —una firma real en un
 * iPhone físico verificada por el backend— sigue pendiente.
 */
enum LlaveDeFirma {
  /** Debe coincidir con lo que el backend acepta. */
  static let algoritmo = "EC-P256"

  /**
   * El nivel de respaldo que se declara al banco.
   *
   * iOS no expone un equivalente de `KeyInfo.securityLevel`: o la llave está en
   * el Secure Enclave o no se crea. ADR-0003, opción A. ⚠️ Pendiente de
   * confirmar con backend que acepta este valor.
   */
  static let respaldo = "secure_enclave"

  private static let etiqueta = Data("com.bsc.mobile.device_signing_key".utf8)
  private static let cuentaDelEstadoBiometrico = "estado_biometrico"

  // ─── Operaciones ──────────────────────────────────────────────────────────

  static func soportado() -> Bool {
    #if targetEnvironment(simulator)
      return false
    #else
      // Todos los iPhone con iOS 15 tienen Secure Enclave. Lo que puede faltar
      // es biometría inscrita, y eso lo decide `createKey`.
      return true
    #endif
  }

  static func crear() throws -> [String: Any] {
    guard soportado() else {
      throw ErrorDeLlave("device_key_error", "Este dispositivo no soporta llaves con verificación de usuario")
    }

    // Igual que en Android, sin biometría fuerte inscrita no hay llave: la
    // alternativa prevista para esos clientes es el código de verificación.
    let contexto = LAContext()
    var error: NSError?
    guard contexto.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
      throw ErrorDeLlave("device_key_error", "El teléfono no tiene Face ID ni Touch ID configurado")
    }

    // Una llave previa se descarta: dos llaves para el mismo dispositivo
    // dejarían al servidor sin saber cuál es la vigente.
    borrarLlave()

    var errorDeAcceso: Unmanaged<CFError>?
    guard let acceso = SecAccessControlCreateWithFlags(
      nil,
      kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
      [.privateKeyUsage, .biometryCurrentSet],
      &errorDeAcceso
    ) else {
      throw ErrorDeLlave("device_key_error", describir(errorDeAcceso))
    }

    let atributos: [String: Any] = [
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrKeySizeInBits as String: 256,
      kSecAttrTokenID as String: kSecAttrTokenIDSecureEnclave,
      kSecPrivateKeyAttrs as String: [
        kSecAttrIsPermanent as String: true,
        kSecAttrApplicationTag as String: etiqueta,
        kSecAttrAccessControl as String: acceso,
      ],
    ]

    var errorDeCreacion: Unmanaged<CFError>?
    guard SecKeyCreateRandomKey(atributos as CFDictionary, &errorDeCreacion) != nil else {
      throw ErrorDeLlave("device_key_error", "No se pudo generar el par de llaves: \(describir(errorDeCreacion))")
    }

    // Se guarda el conjunto de biometrías vigente al crear la llave, para que
    // `hasKey` pueda saber sin diálogo si sigue siendo el mismo.
    if let estado = contexto.evaluatedPolicyDomainState {
      try? Llavero.escribir(
        servicio: Llavero.servicioDeLlave, cuenta: cuentaDelEstadoBiometrico, datos: estado)
    }

    return [
      "publicKey": llavePublica() as Any,
      "algorithm": algoritmo,
      "security": describirLlave(),
    ]
  }

  /**
   * Si hay una llave y además sirve para firmar.
   *
   * Con `.biometryCurrentSet`, cambiar la biometría deja la llave inservible,
   * pero la referencia sigue cargando del Llavero sin error, igual que en
   * Android. Para saberlo **sin abrir el diálogo** se compara el conjunto de
   * biometrías actual con el que había al crearla: si cambió, la llave murió.
   *
   * Como en Android, un fallo cualquiera de esa comprobación no se toma como
   * prueba de pérdida: mandaría al cliente a re-enrolar sin motivo.
   */
  static func usable() -> Bool {
    guard cargarPrivada(contexto: nil) != nil else { return false }
    return biometriaSinCambios() ?? true
  }

  static func llavePublica() -> String? {
    guard
      let privada = cargarPrivada(contexto: nil),
      let publica = SecKeyCopyPublicKey(privada),
      let x963 = SecKeyCopyExternalRepresentation(publica, nil) as Data?
    else { return nil }
    // iOS entrega el punto sin comprimir (X9.63); el backend importa SPKI,
    // como el `publicKey.encoded` de Android. El prefijo es el encabezado
    // ASN.1 fijo de una llave EC P-256.
    return (encabezadoSpkiP256 + x963).base64EncodedString()
  }

  /**
   * Firma el contenido tras pedir Face ID o Touch ID.
   *
   * La verificación se pide con `LAContext` y el mismo contexto se entrega al
   * Llavero al cargar la llave: el Secure Enclave comprueba que ese contexto se
   * autenticó con la biometría vigente, y solo entonces firma. Un solo diálogo,
   * y la exigencia la impone el enclave, no esta función.
   */
  static func firmar(
    _ contenidoBase64: String,
    resolver: @escaping BscResolver,
    rechazar: @escaping BscRechazo
  ) {
    guard !contenidoBase64.isEmpty, let contenido = Data(base64Encoded: contenidoBase64) else {
      rechazar("invalid_argument", "Falta el contenido a firmar")
      return
    }
    guard cargarPrivada(contexto: nil) != nil else {
      rechazar("no_key", "El dispositivo no tiene una llave registrada")
      return
    }
    if biometriaSinCambios() == false {
      // Es la defensa funcionando, no una falla.
      rechazar("key_invalidated", "La llave fue invalidada. Vuelve a registrar el dispositivo")
      return
    }

    let contexto = LAContext()
    // Sin «Introducir código»: la llave solo acepta biometría, y ofrecer el
    // código del teléfono llevaría a un camino que el enclave va a rechazar.
    contexto.localizedFallbackTitle = ""
    contexto.localizedCancelTitle = "Cancelar"
    // Cada firma exige su propia verificación (AUTH_VALIDITY_SECONDS = 0).
    contexto.touchIDAuthenticationAllowableReuseDuration = 0

    let unaVez = UnaSolaVez()
    contexto.evaluatePolicy(
      .deviceOwnerAuthenticationWithBiometrics,
      localizedReason: "Verifica tu identidad para firmar"
    ) { exito, error in
      guard unaVez.intentar() else { return }
      guard exito else {
        // Cancelación, intentos agotados o sensor bloqueado. La capa de negocio
        // no ofrece el código por SMS ante esto, a propósito.
        rechazar("user_not_authenticated", error?.localizedDescription ?? "Se requiere verificación del usuario")
        return
      }
      guard let privada = cargarPrivada(contexto: contexto) else {
        rechazar("key_invalidated", "La llave fue invalidada. Vuelve a registrar el dispositivo")
        return
      }
      var errorDeFirma: Unmanaged<CFError>?
      guard let firma = SecKeyCreateSignature(
        privada, .ecdsaSignatureMessageX962SHA256, contenido as CFData, &errorDeFirma
      ) as Data? else {
        let error = errorDeFirma?.takeRetainedValue()
        if let error, CFErrorGetCode(error) == Int(errSecUserCanceled) || CFErrorGetCode(error) == Int(errSecAuthFailed) {
          rechazar("user_not_authenticated", "Se requiere verificación del usuario")
        } else {
          rechazar("sign_failed", error.map { CFErrorCopyDescription($0) as String })
        }
        return
      }
      // DER, el formato que .NET verifica con Rfc3279DerSequence.
      resolver(firma.base64EncodedString())
    }
  }

  @discardableResult
  static func borrarLlave() -> Bool {
    let consulta: [String: Any] = [
      kSecClass as String: kSecClassKey,
      kSecAttrApplicationTag as String: etiqueta,
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
    ]
    let estado = SecItemDelete(consulta as CFDictionary)
    try? Llavero.borrar(servicio: Llavero.servicioDeLlave, cuenta: cuentaDelEstadoBiometrico)
    return estado == errSecSuccess
  }

  static func describirLlave() -> [String: Any] {
    guard cargarPrivada(contexto: nil) != nil else { return ["present": false] }
    return [
      "present": true,
      "backing": respaldo,
      "userAuthenticationRequired": true,
      "invalidatedByBiometricEnrollment": true,
    ]
  }

  // ─── Implementación ───────────────────────────────────────────────────────

  /// SubjectPublicKeyInfo de una llave EC P-256, sin el punto.
  private static let encabezadoSpkiP256 = Data([
    0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x02, 0x01,
    0x06, 0x08, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x03, 0x01, 0x07, 0x03, 0x42, 0x00,
  ])

  /**
   * La referencia a la privada. Obtenerla **no** abre ningún diálogo: la
   * biometría se exige al usarla. Con `contexto` ya autenticado, la firma no
   * vuelve a pedirla.
   */
  private static func cargarPrivada(contexto: LAContext?) -> SecKey? {
    var consulta: [String: Any] = [
      kSecClass as String: kSecClassKey,
      kSecAttrApplicationTag as String: etiqueta,
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
      kSecReturnRef as String: true,
    ]
    if let contexto {
      consulta[kSecUseAuthenticationContext as String] = contexto
    } else {
      let silencioso = LAContext()
      silencioso.interactionNotAllowed = true
      consulta[kSecUseAuthenticationContext as String] = silencioso
    }
    var resultado: CFTypeRef?
    guard SecItemCopyMatching(consulta as CFDictionary, &resultado) == errSecSuccess,
          let resultado, CFGetTypeID(resultado) == SecKeyGetTypeID()
    else { return nil }
    return (resultado as! SecKey)
  }

  /**
   * `true` si el conjunto de biometrías es el de cuando se creó la llave,
   * `false` si cambió o ya no hay biometría, `nil` si no se puede saber.
   */
  private static func biometriaSinCambios() -> Bool? {
    guard let guardado = try? Llavero.leer(
      servicio: Llavero.servicioDeLlave, cuenta: cuentaDelEstadoBiometrico)
    else { return nil }
    let contexto = LAContext()
    guard contexto.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil) else {
      // Sin biometría inscrita, `.biometryCurrentSet` ya invalidó la llave.
      return false
    }
    guard let actual = contexto.evaluatedPolicyDomainState else { return nil }
    return actual == guardado
  }

  private static func describir(_ error: Unmanaged<CFError>?) -> String {
    guard let error = error?.takeRetainedValue() else { return "error desconocido" }
    return CFErrorCopyDescription(error) as String
  }
}

struct ErrorDeLlave: Error {
  let codigo: String
  let mensaje: String
  init(_ codigo: String, _ mensaje: String) {
    self.codigo = codigo
    self.mensaje = mensaje
  }
}

/// Puente para el envoltorio de Objective-C++ (`ModulosDeSeguridad.mm`).
@objc(BscDeviceKey)
public final class BscDeviceKey: NSObject {
  @objc public static func isSupported(_ resolver: @escaping BscResolver, rechazar: @escaping BscRechazo) {
    resolver(LlaveDeFirma.soportado())
  }

  @objc public static func hasKey(_ resolver: @escaping BscResolver, rechazar: @escaping BscRechazo) {
    InstalacionNueva.limpiarSiHaceFalta()
    resolver(LlaveDeFirma.usable())
  }

  @objc public static func createKey(_ resolver: @escaping BscResolver, rechazar: @escaping BscRechazo) {
    InstalacionNueva.limpiarSiHaceFalta()
    do {
      resolver(try LlaveDeFirma.crear())
    } catch let error as ErrorDeLlave {
      rechazar(error.codigo, error.mensaje)
    } catch {
      rechazar("device_key_error", error.localizedDescription)
    }
  }

  @objc public static func getPublicKey(_ resolver: @escaping BscResolver, rechazar: @escaping BscRechazo) {
    InstalacionNueva.limpiarSiHaceFalta()
    resolver(LlaveDeFirma.llavePublica())
  }

  @objc public static func sign(
    _ contenido: String, resolver: @escaping BscResolver, rechazar: @escaping BscRechazo
  ) {
    InstalacionNueva.limpiarSiHaceFalta()
    LlaveDeFirma.firmar(contenido, resolver: resolver, rechazar: rechazar)
  }

  @objc public static func deleteKey(_ resolver: @escaping BscResolver, rechazar: @escaping BscRechazo) {
    resolver(LlaveDeFirma.borrarLlave())
  }

  @objc public static func describeKey(_ resolver: @escaping BscResolver, rechazar: @escaping BscRechazo) {
    InstalacionNueva.limpiarSiHaceFalta()
    resolver(LlaveDeFirma.describirLlave())
  }
}
